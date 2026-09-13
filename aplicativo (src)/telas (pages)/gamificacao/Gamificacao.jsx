import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../../conexoes (services)/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { DEFAULT_TURNOS, dataOperacional } from '../../ajustes (config)/turnos'
import { calcularRanking, TOLERANCIA_PRAZO_MIN } from '../../ajustes (config)/gamificacao'
import { Icon } from '../../componentes (design)'

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

// 1º, 2º e 3º lugar: cor da medalha e altura do degrau do pódio
const MEDALHAS = [
  { cor: 'var(--gs-podium-gold)', texto: 'var(--gs-podium-gold-text)', degrau: 124, avatar: 64 },
  { cor: 'var(--gs-podium-silver)', texto: 'var(--gs-podium-silver-text)', degrau: 92, avatar: 52 },
  { cor: 'var(--gs-podium-bronze)', texto: 'var(--gs-podium-bronze-text)', degrau: 68, avatar: 52 },
]

const iniciais = nome => {
  const partes = (nome || '?').trim().split(/\s+/)
  return ((partes[0]?.[0] || '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase()
}

const dataCurta = dataStr =>
  new Date(dataStr + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })

const resumo = p => `${p.turnos} turno${p.turnos === 1 ? '' : 's'} · ${p.noPrazo} no prazo`

function Avatar({ nome, tamanho, medalha }) {
  return (
    <div style={{ position: 'relative', width: tamanho, height: tamanho, flexShrink: 0 }}>
      <div style={{
        width: '100%', height: '100%', borderRadius: '50%', display: 'grid', placeItems: 'center',
        background: 'var(--gs-surface-sunken)', color: 'var(--gs-text-muted)',
        fontSize: Math.round(tamanho * 0.36), fontWeight: 600,
        boxShadow: medalha ? `0 0 0 2px var(--gs-surface), 0 0 0 4px ${medalha.cor}` : 'none',
      }}>{iniciais(nome)}</div>
      {medalha && (
        <span style={{
          position: 'absolute', right: -4, bottom: -4, width: 24, height: 24, borderRadius: '50%',
          display: 'grid', placeItems: 'center', background: 'var(--gs-surface)', color: medalha.cor,
          boxShadow: 'var(--gs-shadow-xs)',
        }}><Icon name="crown" size={14} /></span>
      )}
    </div>
  )
}

function Podio({ ranking }) {
  // 2º à esquerda, 1º no meio (mais alto), 3º à direita
  const lugares = [1, 0, 2].filter(i => ranking[i])
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
      {lugares.map(i => {
        const p = ranking[i], m = MEDALHAS[i]
        return (
          <div key={p.uid} style={{ flex: '1 1 0', maxWidth: '120px', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar nome={p.nome} tamanho={m.avatar} medalha={m} />
            <p style={{ margin: '10px 0 0', width: '100%', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: 'var(--gs-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.nome}</p>
            <p className="gs-num" style={{ margin: '2px 0 10px', fontSize: '13px', color: 'var(--gs-text-muted)' }}>{p.pontos} pts</p>
            <div style={{
              width: '100%', height: m.degrau, borderRadius: '10px 10px 0 0', background: m.cor,
              display: 'flex', justifyContent: 'center', paddingTop: '10px',
            }}>
              <span className="gs-num" style={{ fontSize: '20px', fontWeight: 700, color: 'rgba(255,255,255,.92)' }}>{i + 1}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ListaRanking({ ranking }) {
  return (
    <div style={{ border: '1px solid var(--gs-border)', borderRadius: 'var(--gs-radius-card)', overflow: 'hidden' }}>
      {ranking.map((p, i) => {
        const m = MEDALHAS[i]
        return (
          <div key={p.uid} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderTop: i === 0 ? 'none' : '1px solid var(--gs-border)' }}>
            <span className="gs-num" style={{ width: '18px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: 'var(--gs-text)', flexShrink: 0 }}>{i + 1}</span>
            <span style={{ width: '18px', flexShrink: 0, color: m?.cor }}>{m && <Icon name="crown" size={18} />}</span>
            <Avatar nome={p.nome} tamanho={38} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--gs-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.nome}</p>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--gs-text-muted)' }}>{resumo(p)}</p>
            </div>
            <p className="gs-num" style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: m ? m.texto : 'var(--gs-text)', flexShrink: 0 }}>{p.pontos} pts</p>
          </div>
        )
      })}
    </div>
  )
}

export default function Gamificacao({ restaurantId, turnos = DEFAULT_TURNOS }) {
  const navigate = useNavigate()
  // Dia de operação: na madrugada do dia 1º o fechamento ainda conta no mês anterior
  const hoje = new Date(dataOperacional() + 'T12:00:00')
  const [ano, setAno] = useState(hoje.getFullYear())
  const [mes, setMes] = useState(hoje.getMonth())
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)
  const localDate = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const ehMesAtual = ano === hoje.getFullYear() && mes === hoje.getMonth()
  const inicio = localDate(new Date(ano, mes, 1))
  const fim = ehMesAtual ? localDate(hoje) : localDate(new Date(ano, mes + 1, 0))

  // O "Carregando..." é ligado por quem troca o mês (e já começa ligado), não
  // aqui: o efeito só mexe na tela quando a resposta chega. `ativo` descarta a
  // resposta de um mês que o gestor já deixou para trás.
  useEffect(() => {
    let ativo = true
    Promise.resolve()
      .then(() => {
        const ref = collection(db, 'restaurants', restaurantId, 'checklists')
        return getDocs(query(ref, where('data', '>=', inicio), where('data', '<=', fim)))
      })
      .then(snap => { if (ativo) setRanking(calcularRanking(snap.docs.map(d => d.data()), turnos)) })
      .catch(e => console.error(e))
      .finally(() => { if (ativo) setLoading(false) })
    return () => { ativo = false }
  }, [restaurantId, inicio, fim, turnos])

  function mudarMes(delta) {
    let novoMes = mes + delta, novoAno = ano
    if (novoMes < 0) { novoMes = 11; novoAno-- }
    if (novoMes > 11) { novoMes = 0; novoAno++ }
    if (novoAno > hoje.getFullYear() || (novoAno === hoje.getFullYear() && novoMes > hoje.getMonth())) return
    setLoading(true); setMes(novoMes); setAno(novoAno)
  }

  const botaoMes = desativado => ({
    width: '36px', height: '36px', display: 'grid', placeItems: 'center', borderRadius: 'var(--gs-radius-sm)',
    border: '1px solid var(--gs-border)', background: 'var(--gs-surface)', cursor: desativado ? 'default' : 'pointer',
    color: desativado ? 'var(--gs-border-strong)' : 'var(--gs-text-body)',
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gs-bg)', paddingBottom: '80px' }}>
      <div className="gs-appbar gs-appbar--row">
        <button onClick={() => navigate('/gestor')} style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}>←</button>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700', display:'flex', alignItems:'center', gap:'9px' }}><Icon name="trophy" size={21} /> Gamificação</h1>
      </div>

      <div style={{ padding: '20px 16px', maxWidth: '560px', margin: '0 auto' }}>
        <div style={{ background: 'var(--gs-surface)', borderRadius: 'var(--gs-radius-lg)', boxShadow: 'var(--gs-shadow-xs)', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '24px' }}>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: 'var(--gs-text)', letterSpacing: 'var(--gs-tracking-tight)' }}>Ranking de {MESES[mes]}</h2>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--gs-text-muted)' }}>{dataCurta(inicio)} – {dataCurta(fim)}</p>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
              <button onClick={() => mudarMes(-1)} aria-label="Mês anterior" style={botaoMes(false)}><Icon name="back" size={18} /></button>
              <button onClick={() => mudarMes(1)} disabled={ehMesAtual} aria-label="Próximo mês" style={botaoMes(ehMesAtual)}><Icon name="forward" size={18} /></button>
            </div>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--gs-text-muted)', padding: '40px 0' }}>Carregando...</p>
          ) : ranking.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--gs-text-subtle)' }}>
              <Icon name="trophy" size={36} style={{ margin: '0 auto 10px' }} />
              <p style={{ margin: 0 }}>Nenhum turno concluído {ehMesAtual ? 'ainda neste mês' : 'nesse mês'}.</p>
            </div>
          ) : (
            <>
              <Podio ranking={ranking} />
              <ListaRanking ranking={ranking} />
            </>
          )}

          <p style={{ margin: '14px 0 0', fontSize: '12px', color: 'var(--gs-text-subtle)', textAlign: 'center' }}>
            1 ponto por turno concluído · +1 se fechado até {TOLERANCIA_PRAZO_MIN} min após o horário
          </p>
        </div>
      </div>
    </div>
  )
}
