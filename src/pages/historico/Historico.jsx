
import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../services/firebase'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'

const TURNOS = ['Abertura', 'Pré pico', 'Fechamento']

export default function Historico({ onVoltar }) {
  const { user } = useAuth()
  const [checklists, setChecklists] = useState([])
  const [loading, setLoading] = useState(true)
  const [detalhe, setDetalhe] = useState(null)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setLoading(true)
    const hoje = new Date()
    const d15 = new Date()
    d15.setDate(hoje.getDate() - 15)
    const dataInicio = d15.toISOString().split('T')[0]

    const ref = collection(db, 'restaurants', user.uid, 'checklists')
    const q = query(ref, where('data', '>=', dataInicio))
    const snap = await getDocs(q)
    const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    lista.sort((a, b) => b.data.localeCompare(a.data))
    setChecklists(lista)
    setLoading(false)
  }

  // Agrupa por data
  const porData = {}
  checklists.forEach(cl => {
    if (!porData[cl.data]) porData[cl.data] = {}
    porData[cl.data][cl.turno] = cl
  })

  function formatarData(dataStr) {
    const [ano, mes, dia] = dataStr.split('-')
    const d = new Date(ano, mes - 1, dia)
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  function calcularPorcentagem(respostas) {
    const total = Object.keys(respostas || {}).length
    if (total === 0) return 0
    const sim = Object.values(respostas).filter(v => v === 'sim').length
    return Math.round((sim / total) * 100)
  }

  if (detalhe) {
    const pct = calcularPorcentagem(detalhe.respostas)
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: '80px' }}>
        <div style={{ backgroundColor: '#2563eb', color: 'white', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => setDetalhe(null)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}>←</button>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>{detalhe.turno}</h1>
            <p style={{ margin: 0, fontSize: '13px', opacity: 0.85 }}>{formatarData(detalhe.data)}</p>
          </div>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Taxa de conclusão</span>
              <span style={{ fontSize: '13px', fontWeight: '700', color: pct === 100 ? '#16a34a' : '#2563eb' }}>{pct}%</span>
            </div>
            <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: pct + '%', backgroundColor: pct === 100 ? '#16a34a' : '#2563eb', borderRadius: '4px' }} />
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: detalhe.concluido ? '#16a34a' : '#f59e0b', fontWeight: '600' }}>
              {detalhe.concluido ? '✅ Turno concluído' : '⚠️ Turno não concluído'}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(detalhe.respostas || {}).map(([tarefaId, resp]) => (
              <div key={tarefaId} style={{
                backgroundColor: 'white', borderRadius: '10px', padding: '14px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                borderLeft: resp === 'sim' ? '4px solid #16a34a' : '4px solid #dc2626'
              }}>
                <span style={{ fontWeight: '700', color: resp === 'sim' ? '#16a34a' : '#dc2626' }}>
                  {resp === 'sim' ? '✓ Sim' : '✗ Não'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: '80px' }}>
      <div style={{ backgroundColor: '#2563eb', color: 'white', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={onVoltar} style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}>←</button>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700' }}>Histórico</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', opacity: 0.85 }}>Últimos 15 dias</p>
        </div>
      </div>

      <div style={{ padding: '20px 24px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748b' }}>Carregando...</p>
        ) : Object.keys(porData).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            <p style={{ fontSize: '32px' }}>📋</p>
            <p>Nenhum checklist registrado ainda.</p>
          </div>
        ) : (
          Object.entries(porData).map(([data, turnos]) => (
            <div key={data} style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                {formatarData(data)}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {TURNOS.map(turno => {
                  const cl = turnos[turno]
                  if (!cl) return (
                    <div key={turno} style={{ backgroundColor: 'white', borderRadius: '10px', padding: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderLeft: '4px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#94a3b8' }}>{turno}</span>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>Não iniciado</span>
                    </div>
                  )
                  const pct = calcularPorcentagem(cl.respostas)
                  return (
                    <div key={turno} onClick={() => setDetalhe(cl)} style={{ backgroundColor: 'white', borderRadius: '10px', padding: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderLeft: cl.concluido ? '4px solid #16a34a' : '4px solid #f59e0b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>{turno}</p>
                        <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: cl.concluido ? '#16a34a' : '#f59e0b' }}>
                          {cl.concluido ? '✅ Concluído' : '⚠️ Incompleto'} · {pct}%
                        </p>
                      </div>
                      <span style={{ color: '#94a3b8', fontSize: '18px' }}>›</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
