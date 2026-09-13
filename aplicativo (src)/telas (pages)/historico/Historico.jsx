import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../../conexoes (services)/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { DEFAULT_TURNOS, dataOperacional } from '../../ajustes (config)/turnos'
import { compararTarefas } from '../../ajustes (config)/tarefas'
import { Icon } from '../../componentes (design)'

export default function Historico({ restaurantId, turnos = DEFAULT_TURNOS }) {
  const navigate = useNavigate()
  const TURNOS = turnos.map(t => t.nome)
  const [checklists, setChecklists] = useState([])
  const [mapaT, setMapaT] = useState({})
  const [loading, setLoading] = useState(true)
  const [detalhe, setDetalhe] = useState(null)
  const [fotoAmpliada, setFotoAmpliada] = useState(null)
  const localDate = (d=new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  const [filtro, setFiltro] = useState('recente') // 'recente' | 'semana' | 'mes' | 'periodo'
  const [rangeDias, setRangeDias] = useState(15)
  const [temMais, setTemMais] = useState(true)
  const [periodoInicio, setPeriodoInicio] = useState(() => { const d = new Date(); d.setDate(d.getDate() - 30); return localDate(d) })
  const [periodoFim, setPeriodoFim] = useState(() => dataOperacional())
  const totalAnteriorRef = useRef(0)

  function calcularIntervalo() {
    const hoje = dataOperacional()
    if (filtro === 'semana') {
      const d = new Date(hoje + 'T12:00:00'); const diaSemana = d.getDay(); const diff = diaSemana === 0 ? -6 : 1 - diaSemana
      const seg = new Date(d); seg.setDate(d.getDate() + diff)
      return { inicio: localDate(seg), fim: hoje }
    }
    if (filtro === 'mes') {
      const d = new Date(hoje + 'T12:00:00')
      return { inicio: localDate(new Date(d.getFullYear(), d.getMonth(), 1)), fim: hoje }
    }
    if (filtro === 'periodo') return { inicio: periodoInicio, fim: periodoFim }
    const d = new Date(); d.setDate(d.getDate() - rangeDias)
    return { inicio: localDate(d), fim: null }
  }

  useEffect(() => { carregar() }, [filtro, rangeDias, periodoInicio, periodoFim])

  async function carregar() {
    setLoading(true)
    try {
      const tSnap = await getDocs(collection(db, 'restaurants', restaurantId, 'tarefas'))
      const mapa = {}
      tSnap.docs.forEach(d => { const t = d.data(); mapa[d.id] = { texto: t.texto, setorNome: t.setorNome, ordem: t.ordem, criadoEm: t.criadoEm } })
      setMapaT(mapa)

      const { inicio, fim } = calcularIntervalo()
      const ref = collection(db, 'restaurants', restaurantId, 'checklists')
      const q = fim ? query(ref, where('data', '>=', inicio), where('data', '<=', fim)) : query(ref, where('data', '>=', inicio))
      const snap = await getDocs(q)
      const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      lista.sort((a, b) => b.data.localeCompare(a.data))
      if (filtro === 'recente') { setTemMais(lista.length > totalAnteriorRef.current); totalAnteriorRef.current = lista.length }
      setChecklists(lista)
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  function selecionarFiltro(novo) {
    setFiltro(novo)
    if (novo === 'recente') { setRangeDias(15); totalAnteriorRef.current = 0 }
  }

  function legendaPeriodo() {
    if (filtro === 'semana') return 'Esta semana'
    if (filtro === 'mes') return 'Este mês'
    if (filtro === 'periodo') {
      const fmt = s => { const [a,m,d] = s.split('-'); return `${d}/${m}/${a}` }
      return `De ${fmt(periodoInicio)} até ${fmt(periodoFim)}`
    }
    return `Últimos ${rangeDias} dias`
  }

  async function abrirDetalhe(cl) {
    const f = { ...(cl.fotos || {}) }
    try {
      const fSnap = await getDocs(collection(db, 'restaurants', restaurantId, 'checklists', cl.id, 'fotos'))
      fSnap.docs.forEach(fd => { f[fd.id] = fd.data().b64 })
    } catch(e) {}
    setDetalhe({ ...cl, fotos: f })
  }

  // Agrupa por data -> turno -> lista de checklists (um por funcionário)
  const porData = {}
  checklists.forEach(cl => {
    if (!porData[cl.data]) porData[cl.data] = {}
    if (!porData[cl.data][cl.turno]) porData[cl.data][cl.turno] = []
    porData[cl.data][cl.turno].push(cl)
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
      <>
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: '80px' }}>
        <div className="gs-appbar gs-appbar--row">
          <button onClick={() => setDetalhe(null)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}>←</button>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>{detalhe.turno}</h1>
            <p style={{ margin: 0, fontSize: '13px', opacity: 0.85 }}>{detalhe.funcionarioNome ? detalhe.funcionarioNome + ' · ' : ''}{formatarData(detalhe.data)}</p>
          </div>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', marginBottom: '16px', boxShadow: 'var(--gs-shadow-xs)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Taxa de conclusão</span>
              <span style={{ fontSize: '13px', fontWeight: '700', color: pct === 100 ? '#16a34a' : 'var(--gs-action)' }}>{pct}%</span>
            </div>
            <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: pct + '%', backgroundColor: pct === 100 ? '#16a34a' : 'var(--gs-action)', borderRadius: '4px' }} />
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: detalhe.concluido ? '#16a34a' : '#f59e0b', fontWeight: '600' }}>
              {detalhe.concluido ? '✅ Turno concluído' : '⚠️ Turno não concluído'}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(detalhe.respostas || {}).sort(([a], [b]) => compararTarefas({ ...mapaT[a], id: a }, { ...mapaT[b], id: b })).map(([tarefaId, resp]) => (
              <div key={tarefaId} style={{
                backgroundColor: 'white', borderRadius: '10px', padding: '14px',
                boxShadow: 'var(--gs-shadow-xs)',
                borderLeft: resp === 'sim' ? '4px solid #16a34a' : '4px solid #dc2626'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>{mapaT[tarefaId]?.texto || 'Tarefa #' + tarefaId.slice(-4)}</span>
                  <span style={{ fontWeight: '700', whiteSpace: 'nowrap', color: resp === 'sim' ? '#16a34a' : '#dc2626' }}>
                    {resp === 'sim' ? '✓ Sim' : '✗ Não'}
                  </span>
                </div>
                {detalhe.comentarios?.[tarefaId] && <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#475569' }}>💬 {detalhe.comentarios[tarefaId]}</p>}
                {detalhe.fotos?.[tarefaId] && <img src={detalhe.fotos[tarefaId]} alt="foto" onClick={() => setFotoAmpliada(detalhe.fotos[tarefaId])} style={{ marginTop: '8px', width: '100%', borderRadius: '8px', maxHeight: '200px', objectFit: 'cover', cursor: 'pointer' }} />}
              </div>
            ))}
          </div>
        </div>
      </div>
      {fotoAmpliada && (
        <div onClick={() => setFotoAmpliada(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.92)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <img src={fotoAmpliada} alt="foto" style={{ maxWidth: '96vw', maxHeight: '96vh', objectFit: 'contain', borderRadius: '8px' }} />
        </div>
      )}
      </>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: '80px' }}>
      <div className="gs-appbar gs-appbar--row">
        <button onClick={() => navigate('/gestor')} style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}>←</button>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700' }}>Histórico</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', opacity: 0.85 }}>{legendaPeriodo()}</p>
        </div>
      </div>

      <div style={{ padding: '16px 24px 0', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {[['recente', 'Recente'], ['semana', 'Esta semana'], ['mes', 'Este mês'], ['periodo', 'Período']].map(([id, label]) => (
          <button key={id} onClick={() => selecionarFiltro(id)} style={{ padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', backgroundColor: filtro === id ? 'var(--gs-action)' : '#f1f5f9', color: filtro === id ? 'white' : '#64748b' }}>{label}</button>
        ))}
      </div>

      {filtro === 'periodo' && (
        <div style={{ padding: '12px 24px 0', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '12px', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            De
            <input type="date" value={periodoInicio} max={periodoFim} onChange={e => setPeriodoInicio(e.target.value)} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
          </label>
          <label style={{ fontSize: '12px', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            Até
            <input type="date" value={periodoFim} min={periodoInicio} max={localDate()} onChange={e => setPeriodoFim(e.target.value)} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
          </label>
        </div>
      )}

      <div style={{ padding: '20px 24px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748b' }}>Carregando...</p>
        ) : Object.keys(porData).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--gs-text-muted)' }}>
            <Icon name="clipboard" size={34} style={{ margin: '0 auto 12px', color: 'var(--gs-text-subtle)' }} />
            <p style={{ margin: 0, fontSize: '14px' }}>Nenhum checklist registrado ainda.</p>
          </div>
        ) : (
          Object.entries(porData).map(([data, turnosData]) => (
            <div key={data} style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gs-text-muted)', marginBottom: '9px' }}>
                {formatarData(data)}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {TURNOS.map(turno => {
                  const lista = turnosData[turno] || []
                  if (lista.length === 0) return (
                    <div key={turno} style={{ background: 'var(--gs-surface)', borderRadius: 'var(--gs-radius-card)', padding: '14px 16px', boxShadow: 'var(--gs-shadow-xs)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--gs-text-subtle)' }}>
                        <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: 'var(--gs-border-strong)', flexShrink: 0 }} />
                        {turno}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--gs-text-subtle)' }}>Não iniciado</span>
                    </div>
                  )
                  return lista.map(cl => {
                    const pct = calcularPorcentagem(cl.respostas)
                    return (
                      <div key={cl.id} onClick={() => abrirDetalhe(cl)} style={{ background: 'var(--gs-surface)', borderRadius: 'var(--gs-radius-card)', padding: '14px 16px', boxShadow: 'var(--gs-shadow-xs)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', minWidth: 0 }}>
                          <Icon name={cl.concluido ? 'checkCircle' : 'warning'} size={17}
                            style={{ marginTop: '2px', color: cl.concluido ? 'var(--gs-success)' : 'var(--gs-warning-text)' }} />
                          <div style={{ minWidth: 0 }}>
                            <p style={{ margin: 0, fontWeight: '600', color: 'var(--gs-text-body)' }}>{turno}{cl.funcionarioNome ? <span style={{ fontWeight: 400, color: 'var(--gs-text-subtle)' }}> · {cl.funcionarioNome}</span> : null}</p>
                            <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: cl.concluido ? 'var(--gs-success-text)' : 'var(--gs-warning-text)' }}>
                              {cl.concluido ? 'Concluído' : 'Incompleto'} · <span className="gs-num">{pct}%</span>
                            </p>
                          </div>
                        </div>
                        <Icon name="forward" size={16} style={{ color: 'var(--gs-text-subtle)' }} />
                      </div>
                    )
                  })
                })}
              </div>
            </div>
          ))
        )}
        {!loading && filtro === 'recente' && temMais && Object.keys(porData).length > 0 && (
          <button onClick={() => setRangeDias(d => d + 15)} style={{ width: '100%', minHeight: '44px', padding: '12px', marginTop: '4px', background: 'var(--gs-surface-sunken)', color: 'var(--gs-text-body)', border: 'none', borderRadius: 'var(--gs-radius-md)', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
            Carregar mais
          </button>
        )}
      </div>
    </div>
  )
}
