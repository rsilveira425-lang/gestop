import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../../conexoes (services)/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { DEFAULT_TURNOS } from '../../ajustes (config)/turnos'
import { calcularRanking } from '../../ajustes (config)/gamificacao'
import { Icon } from '../../componentes (design)'

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

export default function Gamificacao({ restaurantId, turnos = DEFAULT_TURNOS }) {
  const navigate = useNavigate()
  const hoje = new Date()
  const [ano, setAno] = useState(hoje.getFullYear())
  const [mes, setMes] = useState(hoje.getMonth())
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)
  const localDate = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const ehMesAtual = ano === hoje.getFullYear() && mes === hoje.getMonth()

  useEffect(() => { carregar() }, [ano, mes])

  async function carregar() {
    setLoading(true)
    try {
      const inicio = localDate(new Date(ano, mes, 1))
      const fim = ehMesAtual ? localDate(hoje) : localDate(new Date(ano, mes + 1, 0))
      const ref = collection(db, 'restaurants', restaurantId, 'checklists')
      const snap = await getDocs(query(ref, where('data', '>=', inicio), where('data', '<=', fim)))
      setRanking(calcularRanking(snap.docs.map(d => d.data()), turnos))
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  function mudarMes(delta) {
    let novoMes = mes + delta, novoAno = ano
    if (novoMes < 0) { novoMes = 11; novoAno-- }
    if (novoMes > 11) { novoMes = 0; novoAno++ }
    if (novoAno > hoje.getFullYear() || (novoAno === hoje.getFullYear() && novoMes > hoje.getMonth())) return
    setMes(novoMes); setAno(novoAno)
  }

  const medalha = i => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}º`

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: '80px' }}>
      <div className="gs-appbar gs-appbar--row">
        <button onClick={() => navigate('/gestor')} style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}>←</button>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700', display:'flex', alignItems:'center', gap:'9px' }}><Icon name="trophy" size={21} /> Gamificação</h1>
      </div>

      <div style={{ padding: '18px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '18px' }}>
        <button onClick={() => mudarMes(-1)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: 'var(--gs-action)' }}>‹</button>
        <p style={{ margin: 0, fontWeight: '700', color: '#1e293b', fontSize: '15px', minWidth: '150px', textAlign: 'center' }}>{MESES[mes]} de {ano}</p>
        <button onClick={() => mudarMes(1)} disabled={ehMesAtual} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: ehMesAtual ? 'default' : 'pointer', color: ehMesAtual ? '#cbd5e1' : 'var(--gs-action)' }}>›</button>
      </div>
      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
        1 ponto por turno concluído · +1 se fechado dentro do horário
      </p>

      <div style={{ padding: '20px 24px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748b' }}>Carregando...</p>
        ) : ranking.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            <p style={{ fontSize: '32px' }}>🏆</p>
            <p>Nenhum turno concluído {ehMesAtual ? 'ainda neste mês' : 'nesse mês'}.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {ranking.map((p, i) => (
              <div key={p.uid} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: '14px', borderLeft: i < 3 ? '4px solid #f59e0b' : '4px solid #e2e8f0' }}>
                <span style={{ fontSize: '18px', fontWeight: '800', width: '30px', textAlign: 'center', flexShrink: 0 }}>{medalha(i)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: '700', color: '#1e293b', fontSize: '15px' }}>{p.nome}</p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>{p.turnos} turno{p.turnos === 1 ? '' : 's'} concluído{p.turnos === 1 ? '' : 's'} · {p.noPrazo} no prazo</p>
                </div>
                <p style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: 'var(--gs-action)', flexShrink: 0 }}>{p.pontos} pts</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
