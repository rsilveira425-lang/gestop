import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { db } from '../../conexoes (services)/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import Historico from '../historico/Historico'
import Gamificacao from '../gamificacao/Gamificacao'
import { DEFAULT_TURNOS } from '../../ajustes (config)/turnos'
import { compararTarefas } from '../../ajustes (config)/tarefas'
import { Icon } from '../../componentes (design)'

function Kpi({ titulo, valor, sub, alerta }) {
  return (
    <div style={{ background:'var(--gs-surface)', borderRadius:'var(--gs-radius-card)', padding:'16px', boxShadow:'var(--gs-shadow-xs)' }}>
      <p className="gs-eyebrow" style={{ margin:0 }}>{titulo}</p>
      <p className="gs-num" style={{ margin:'9px 0 0', fontSize:'30px', fontWeight:600, lineHeight:1, color: alerta ? 'var(--gs-danger)' : 'var(--gs-text)' }}>{valor}</p>
      <p className="gs-num" style={{ margin:'7px 0 0', fontSize:'12px', color:'var(--gs-text-subtle)' }}>{sub}</p>
    </div>
  )
}

function Anel({ pct, label }) {
  const R = 26, C = 2 * Math.PI * R
  // Literal e nao var(): atributo de apresentacao de SVG nao resolve custom property.
  const cor = pct >= 100 ? '#16a34a' : pct >= 50 ? '#f59e0b' : '#dc2626'
  return (
    <div style={{ textAlign:'center', flexShrink:0 }}>
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={R} fill="none" stroke="#eef2f9" strokeWidth="7" />
        <circle cx="36" cy="36" r={R} fill="none" stroke={cor} strokeWidth="7" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C * (1 - Math.min(pct, 100) / 100)} transform="rotate(-90 36 36)" />
        <text x="36" y="41.5" textAnchor="middle" fontSize="14" fontWeight="600" fill="#0f172a"
          style={{ fontFamily:'var(--gs-font-data)', fontVariantNumeric:'tabular-nums' }}>{pct}%</text>
      </svg>
      <p style={{ margin:'4px 0 0', fontSize:'12px', color:'var(--gs-text-muted)', fontWeight:500 }}>{label}</p>
    </div>
  )
}

export default function GestorView({ restaurantId, codigoAcesso: codigoAcessoProp, turnos = DEFAULT_TURNOS }) {
  const navigate = useNavigate()
  const TURNOS = turnos.map(t => t.nome)
  const [checklists, setChecklists] = useState([])
  const [loading, setLoading] = useState(true)
  const codigoAcesso = codigoAcessoProp || '—'
  const localDate = (d=new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  const [data, setData] = useState(localDate())
  const [detalhe, setDetalhe] = useState(null)
  const [mapaT, setMapaT] = useState({})
  const [fotoAmpliada, setFotoAmpliada] = useState(null)
  const [fotosHoje, setFotosHoje] = useState(0)

  useEffect(() => { carregarDados() }, [data])

  async function abrirDetalhe(cl) {
    // Carrega fotos dos subdocumentos (novo formato) e mescla com o campo antigo
    const f = { ...(cl.fotos || {}) }
    try {
      const fSnap = await getDocs(collection(db, 'restaurants', restaurantId, 'checklists', cl.id, 'fotos'))
      fSnap.docs.forEach(fd => { f[fd.id] = fd.data().b64 })
    } catch(e) {}
    setDetalhe({ ...cl, fotos: f })
  }

  async function carregarDados() {
    setLoading(true)
    try {
      const tSnap = await getDocs(collection(db, 'restaurants', restaurantId, 'tarefas'))
      const mapa = {}
      tSnap.docs.forEach(d => { const t = d.data(); mapa[d.id] = { texto: t.texto, turno: t.turno, setorNome: t.setorNome, ordem: t.ordem, criadoEm: t.criadoEm } })
      setMapaT(mapa)
      const q = query(collection(db, 'restaurants', restaurantId, 'checklists'), where('data', '==', data))
      const s = await getDocs(q)
      const cls = s.docs.map(d => ({ id: d.id, ...d.data() }))
      setChecklists(cls)
      // conta fotos do dia (campo antigo + subcoleção), sem duplicar por tarefa
      let totFotos = 0
      await Promise.all(cls.map(async cl => {
        const ids = new Set(Object.keys(cl.fotos || {}))
        try {
          const fSnap = await getDocs(collection(db, 'restaurants', restaurantId, 'checklists', cl.id, 'fotos'))
          fSnap.forEach(fd => ids.add(fd.id))
        } catch (e) {}
        totFotos += ids.size
      }))
      setFotosHoje(totFotos)
    } catch(e) {}
    setLoading(false)
  }

  const porFuncionario = {}
  checklists.forEach(cl => {
    const nome = cl.funcionarioNome || 'Sem identificação'
    if (!porFuncionario[nome]) porFuncionario[nome] = {}
    porFuncionario[nome][cl.turno] = cl
  })

  const status = (cl) => {
    if (!cl) return { icone: null, label: 'Não iniciado', cor: 'var(--gs-text-subtle)' }
    if (cl.concluido) return { icone: 'checkCircle', label: 'Concluído', cor: 'var(--gs-success)' }
    return { icone: 'clock', label: `${Object.keys(cl.respostas||{}).length} resp.`, cor: 'var(--gs-action)' }
  }

  // ----- Resumo do dia (Painel do Dono) -----
  const ehHoje = data === localDate()
  let totalEsp = 0, totalResp = 0, naoCount = 0
  const porSetor = {}
  checklists.forEach(cl => {
    const respostas = cl.respostas || {}
    Object.entries(mapaT).forEach(([id, t]) => {
      if (t.turno !== cl.turno) return
      const setor = t.setorNome || 'Outros'
      if (!porSetor[setor]) porSetor[setor] = { esp: 0, resp: 0 }
      porSetor[setor].esp++; totalEsp++
      if (respostas[id] !== undefined) { porSetor[setor].resp++; totalResp++ }
    })
    Object.values(respostas).forEach(v => { if (v !== 'sim') naoCount++ })
  })
  let atrasados = 0
  if (ehHoje) {
    const horaAgora = new Date().getHours()
    turnos.forEach(t => {
      if (typeof t.horaLimite === 'number' && horaAgora >= t.horaLimite) {
        const concluido = checklists.some(cl => cl.turno === t.nome && cl.concluido)
        if (!concluido) atrasados++
      }
    })
  }
  const pendencias = naoCount + atrasados
  const ativos = Object.keys(porFuncionario).length
  const progresso = totalEsp ? Math.round(totalResp / totalEsp * 100) : 0
  const setoresResumo = Object.entries(porSetor)

  const datas = Array.from({length:7}, (_,i) => { const d=new Date(); d.setDate(d.getDate()-i); return localDate(d) })

  const painel = detalhe ? (
    <>
    <div style={{ minHeight:'100vh', background:'var(--gs-bg)' }}>
      <div className="gs-appbar gs-appbar--row">
        <button onClick={() => setDetalhe(null)} style={{ background:'none', border:'none', color:'white', fontSize:'22px', cursor:'pointer' }}>←</button>
        <div>
          <h1 style={{ margin:0, fontSize:'18px', fontWeight:'700' }}>{detalhe.turno}</h1>
          <p style={{ margin:'2px 0 0 0', fontSize:'13px', opacity:0.8 }}>{detalhe.funcionarioNome} · {detalhe.data}</p>
        </div>
      </div>
      <div style={{ padding:'20px 24px' }}>
        {Object.keys(mapaT).length === 0 ? (
          <p style={{ color:'var(--gs-text-subtle)', textAlign:'center' }}>Nenhuma resposta.</p>
        ) : [...new Set([...Object.keys(mapaT).filter(id => mapaT[id].turno === detalhe.turno), ...Object.keys(detalhe.respostas||{})])].sort((a, b) => compararTarefas({ ...mapaT[a], id: a }, { ...mapaT[b], id: b })).map(id => [id, (detalhe.respostas||{})[id]]).map(([id, resp]) => (
          <div key={id} style={{ background:'var(--gs-surface)', borderRadius:'var(--gs-radius-card)', padding:'14px 16px', marginBottom:'10px', boxShadow:'var(--gs-shadow-xs)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'12px' }}>
              <span style={{ display:'flex', alignItems:'flex-start', gap:'10px', minWidth:0 }}>
                <span style={{ flexShrink:0, width:'20px', height:'20px', marginTop:'1px', borderRadius:'50%', display:'grid', placeItems:'center', color:'white',
                  background: resp==='sim' ? 'var(--gs-success)' : resp==='nao' ? 'var(--gs-danger)' : 'transparent',
                  border: resp===undefined ? '1.8px solid var(--gs-border-strong)' : 'none' }}>
                  {resp==='sim' ? <Icon name="check" size={12} /> : resp==='nao' ? <Icon name="x" size={11} /> : null}
                </span>
                <span style={{ fontSize:'13px', color:'var(--gs-text-body)' }}>{mapaT[id]?.texto || 'Tarefa #' + id.slice(-4)}</span>
              </span>
              <span style={{ flexShrink:0, fontSize:'13px', fontWeight:600, color: resp===undefined?'var(--gs-text-subtle)':resp==='sim'?'var(--gs-success-text)':'var(--gs-danger-text)' }}>{resp===undefined?'—':resp==='sim'?'Sim':'Não'}</span>
            </div>
            {detalhe.comentarios?.[id] && (
              <p style={{ margin:'10px 0 0 30px', fontSize:'13px', color:'var(--gs-text-muted)', display:'flex', gap:'8px', alignItems:'flex-start' }}>
                <Icon name="comment" size={14} style={{ marginTop:'2px', flexShrink:0, color:'var(--gs-text-subtle)' }} />
                {detalhe.comentarios[id]}
              </p>
            )}
            {detalhe.fotos?.[id] && <img src={detalhe.fotos[id]} alt="foto" onClick={() => setFotoAmpliada(detalhe.fotos[id])} style={{ marginTop:'8px', width:'100%', borderRadius:'8px', maxHeight:'200px', objectFit:'cover', cursor:'pointer' }} />}
          </div>
        ))}
      </div>
    </div>
    {fotoAmpliada && (
      <div onClick={() => setFotoAmpliada(null)} style={{ position:'fixed', top:0, left:0, right:0, bottom:0, backgroundColor:'rgba(0,0,0,0.92)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
        <img src={fotoAmpliada} alt="foto" style={{ maxWidth:'96vw', maxHeight:'96vh', objectFit:'contain', borderRadius:'8px' }} />
      </div>
    )}
    </>
  ) : (
    <div style={{ minHeight:'100vh', backgroundColor:'#f8fafc' }}>
      <div className="gs-appbar gs-appbar--row">
        <button onClick={() => navigate('/')} style={{ background:'none', border:'none', color:'white', fontSize:'22px', cursor:'pointer' }}>←</button>
        <h1 style={{ margin:0, fontSize:'20px', fontWeight:'700', display:'flex', alignItems:'center', gap:'9px' }}><Icon name="chart" size={21} /> Painel do Gestor</h1>
        <div style={{ marginLeft:'auto', display:'flex', gap:'8px' }}>
          <button onClick={() => navigate('ranking')} style={{ padding:'9px 13px', borderRadius:'var(--gs-radius-md)', border:'none', backgroundColor:'rgba(255,255,255,0.16)', color:'white', fontSize:'13px', cursor:'pointer', fontWeight:'600' }}>Ranking</button>
          <button onClick={() => navigate('historico')} style={{ padding:'9px 13px', borderRadius:'var(--gs-radius-md)', border:'none', backgroundColor:'rgba(255,255,255,0.16)', color:'white', fontSize:'13px', cursor:'pointer', fontWeight:'600' }}>Histórico</button>
        </div>
      </div>

      <div style={{ margin:'16px 24px', background:'var(--gs-surface-brand)', borderRadius:'var(--gs-radius-card)', padding:'16px' }}>
        <p className="gs-eyebrow" style={{ margin:0, color:'var(--gs-action)' }}>Código de acesso dos funcionários</p>
        <p className="gs-num" style={{ margin:'6px 0 0 0', fontSize:'30px', fontWeight:600, color:'var(--gs-blue-800)', letterSpacing:'.16em', lineHeight:1.1 }}>{codigoAcesso}</p>
        <p style={{ margin:'6px 0 0 0', fontSize:'12px', color:'var(--gs-text-muted)' }}>Compartilhe esse código com sua equipe</p>
      </div>

      <div style={{ padding:'0 24px 12px' }}>
        <div style={{ display:'flex', gap:'8px', overflowX:'auto' }}>
          {datas.map(d => {
            const label = d===localDate() ? 'Hoje' : new Date(d+'T12:00:00').toLocaleDateString('pt-BR', {day:'numeric', month:'short'})
            return <button key={d} onClick={() => setData(d)} style={{ padding:'9px 16px', borderRadius:'var(--gs-radius-pill)', border:'none', cursor:'pointer', fontSize:'13px', fontWeight:'600', whiteSpace:'nowrap', backgroundColor: data===d?'var(--gs-action)':'var(--gs-surface-sunken)', color: data===d?'white':'var(--gs-text-muted)' }}>{label}</button>
          })}
        </div>
      </div>

      {!loading && (
        <div style={{ margin:'0 24px 16px' }}>
          <p style={{ margin:'0 0 10px', fontSize:'13px', fontWeight:600, color:'var(--gs-text-muted)' }}>Resumo do dia</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            <Kpi titulo="Progresso do dia" valor={progresso + '%'} sub={totalResp + ' de ' + totalEsp + ' tarefas'} />
            <Kpi titulo="Funcionários ativos" valor={ativos} sub="hoje" />
            <Kpi titulo="Fotos registradas" valor={fotosHoje} sub="no dia" />
            <Kpi titulo="Pendências" valor={pendencias} sub="abertas" alerta={pendencias > 0} />
          </div>
          {setoresResumo.length > 0 && (
            <>
              <p style={{ margin:'22px 0 10px', fontSize:'13px', fontWeight:600, color:'var(--gs-text-muted)' }}>Progresso por área</p>
              <div style={{ display:'flex', gap:'14px', overflowX:'auto', padding:'16px', background:'var(--gs-surface)', borderRadius:'var(--gs-radius-card)', boxShadow:'var(--gs-shadow-xs)' }}>
                {setoresResumo.map(([nome, o]) => (
                  <Anel key={nome} pct={o.esp ? Math.round(o.resp / o.esp * 100) : 0} label={nome} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div style={{ padding:'0 24px 40px' }}>
        {loading ? <p style={{ textAlign:'center', color:'var(--gs-text-subtle)' }}>Carregando...</p>
        : Object.keys(porFuncionario).length === 0 ? (
          <div style={{ textAlign:'center', padding:'48px 0', color:'var(--gs-text-muted)' }}>
            <Icon name="clipboard" size={34} style={{ margin:'0 auto 12px', color:'var(--gs-text-subtle)' }} />
            <p style={{ margin:0, fontSize:'14px' }}>Nenhum registro nessa data.</p>
          </div>
        ) : Object.entries(porFuncionario).map(([nome, turnos]) => (
          <div key={nome} style={{ background:'var(--gs-surface)', borderRadius:'var(--gs-radius-card)', padding:'16px', marginBottom:'12px', boxShadow:'var(--gs-shadow-xs)' }}>
            <p style={{ margin:'0 0 12px 0', fontWeight:'700', fontSize:'15px', color:'#1e293b' }}><Icon name="user" size={14} style={{ display:'inline-block', verticalAlign:'-2px', marginRight:'6px' }} />{nome}</p>
            {TURNOS.map(turno => {
              const cl = turnos[turno]; const st = status(cl)
              return (
                <button key={turno} onClick={() => cl && abrirDetalhe(cl)}
                  style={{ display:'flex', justifyContent:'space-between', alignItems:'center', width:'100%', minHeight:'44px', padding:'10px 13px', borderRadius:'var(--gs-radius-md)', border:'none', background:'var(--gs-surface-sunken)', cursor: cl?'pointer':'default', marginBottom:'7px', textAlign:'left' }}>
                  <span style={{ fontSize:'13px', fontWeight:'600', color:'var(--gs-text-body)' }}>{turno}</span>
                  <span style={{ fontSize:'13px', color: st.cor, fontWeight:'600', display:'flex', alignItems:'center', gap:'6px' }}>
                    {st.icone && <Icon name={st.icone} size={14} />}{st.label}
                  </span>
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <Routes>
      <Route path="historico" element={<Historico restaurantId={restaurantId} turnos={turnos} />} />
      <Route path="ranking" element={<Gamificacao restaurantId={restaurantId} turnos={turnos} />} />
      <Route path="" element={painel} />
    </Routes>
  )
}
