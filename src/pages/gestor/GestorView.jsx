import { useState, useEffect } from 'react'
import { db } from '../../services/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import Historico from '../historico/Historico'
import { DEFAULT_TURNOS } from '../../config/turnos'

function Kpi({ titulo, valor, sub, alerta }) {
  return (
    <div style={{ backgroundColor:'#f8fafc', border:'1px solid #f1f5f9', borderRadius:'12px', padding:'14px' }}>
      <p style={{ margin:0, fontSize:'11px', fontWeight:700, letterSpacing:'0.5px', textTransform:'uppercase', color:'#94a3b8' }}>{titulo}</p>
      <p style={{ margin:'6px 0 0', fontSize:'28px', fontWeight:800, color: alerta ? '#dc2626' : '#1e293b' }}>{valor}</p>
      <p style={{ margin:'2px 0 0', fontSize:'12px', color:'#64748b' }}>{sub}</p>
    </div>
  )
}

function Anel({ pct, label }) {
  const R = 26, C = 2 * Math.PI * R
  const cor = pct >= 100 ? '#16a34a' : pct >= 50 ? '#f59e0b' : '#dc2626'
  return (
    <div style={{ textAlign:'center', flexShrink:0 }}>
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={R} fill="none" stroke="#e2e8f0" strokeWidth="7" />
        <circle cx="36" cy="36" r={R} fill="none" stroke={cor} strokeWidth="7" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C * (1 - Math.min(pct, 100) / 100)} transform="rotate(-90 36 36)" />
        <text x="36" y="41" textAnchor="middle" fontSize="15" fontWeight="700" fill="#1e293b">{pct}%</text>
      </svg>
      <p style={{ margin:'2px 0 0', fontSize:'12px', color:'#64748b', fontWeight:600 }}>{label}</p>
    </div>
  )
}

export default function GestorView({ restaurantId, codigoAcesso: codigoAcessoProp, turnos = DEFAULT_TURNOS, onVoltar }) {
  const TURNOS = turnos.map(t => t.nome)
  const [checklists, setChecklists] = useState([])
  const [loading, setLoading] = useState(true)
  const codigoAcesso = codigoAcessoProp || '—'
  const localDate = (d=new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  const [data, setData] = useState(localDate())
  const [detalhe, setDetalhe] = useState(null)
  const [mapaT, setMapaT] = useState({})
  const [fotoAmpliada, setFotoAmpliada] = useState(null)
  const [verHistorico, setVerHistorico] = useState(false)
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
      tSnap.docs.forEach(d => { const t = d.data(); mapa[d.id] = { texto: t.texto, turno: t.turno, setorNome: t.setorNome } })
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
    if (!cl) return { emoji: '⬜', label: 'Não iniciado', cor: '#94a3b8' }
    if (cl.concluido) return { emoji: '✅', label: 'Concluído', cor: '#16a34a' }
    return { emoji: '🔄', label: `${Object.keys(cl.respostas||{}).length} resp.`, cor: '#2563eb' }
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

  if (verHistorico) return <Historico restaurantId={restaurantId} turnos={turnos} onVoltar={() => setVerHistorico(false)} />

  if (detalhe) return (
    <>
    <div style={{ minHeight:'100vh', backgroundColor:'#f8fafc' }}>
      <div style={{ backgroundColor:'#2563eb', color:'white', padding:'20px 24px', display:'flex', alignItems:'center', gap:'12px' }}>
        <button onClick={() => setDetalhe(null)} style={{ background:'none', border:'none', color:'white', fontSize:'22px', cursor:'pointer' }}>←</button>
        <div>
          <h1 style={{ margin:0, fontSize:'18px', fontWeight:'700' }}>{detalhe.turno}</h1>
          <p style={{ margin:'2px 0 0 0', fontSize:'13px', opacity:0.8 }}>{detalhe.funcionarioNome} · {detalhe.data}</p>
        </div>
      </div>
      <div style={{ padding:'20px 24px' }}>
        {Object.keys(mapaT).length === 0 ? (
          <p style={{ color:'#94a3b8', textAlign:'center' }}>Nenhuma resposta.</p>
        ) : [...new Set([...Object.keys(mapaT).filter(id => mapaT[id].turno === detalhe.turno), ...Object.keys(detalhe.respostas||{})])].map(id => [id, (detalhe.respostas||{})[id]]).map(([id, resp]) => (
          <div key={id} style={{ backgroundColor:'white', borderRadius:'10px', padding:'14px', marginBottom:'10px', boxShadow:'0 1px 2px rgba(0,0,0,0.06)', borderLeft:`4px solid ${resp===undefined?'#e2e8f0':resp==='sim'?'#16a34a':'#dc2626'}` }}>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontSize:'13px', color:'#64748b' }}>{mapaT[id]?.texto || 'Tarefa #' + id.slice(-4)}</span>
              <span style={{ fontWeight:'700', color: resp===undefined?'#94a3b8':resp==='sim'?'#16a34a':'#dc2626' }}>{resp==='sim'?'✓ Sim':'✗ Não'}</span>
            </div>
            {detalhe.comentarios?.[id] && <p style={{ margin:'8px 0 0 0', fontSize:'13px', color:'#475569' }}>💬 {detalhe.comentarios[id]}</p>}
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
  )

  return (
    <div style={{ minHeight:'100vh', backgroundColor:'#f8fafc' }}>
      <div style={{ backgroundColor:'#2563eb', color:'white', padding:'20px 24px', display:'flex', alignItems:'center', gap:'12px' }}>
        <button onClick={onVoltar} style={{ background:'none', border:'none', color:'white', fontSize:'22px', cursor:'pointer' }}>←</button>
        <h1 style={{ margin:0, fontSize:'20px', fontWeight:'700' }}>👑 Painel do Gestor</h1>
        <button onClick={() => setVerHistorico(true)} style={{ marginLeft:'auto', padding:'8px 12px', borderRadius:'8px', border:'none', backgroundColor:'rgba(255,255,255,0.2)', color:'white', fontSize:'13px', cursor:'pointer', fontWeight:'600' }}>Histórico</button>
      </div>

      <div style={{ margin:'16px 24px', backgroundColor:'#eff6ff', borderRadius:'12px', padding:'16px', border:'1px solid #bfdbfe' }}>
        <p style={{ margin:0, fontSize:'11px', color:'#3b82f6', fontWeight:'700', textTransform:'uppercase', letterSpacing:'1px' }}>Código de acesso dos funcionários</p>
        <p style={{ margin:'4px 0 0 0', fontSize:'32px', fontWeight:'900', color:'#1e40af', letterSpacing:'8px' }}>{codigoAcesso}</p>
        <p style={{ margin:'4px 0 0 0', fontSize:'12px', color:'#64748b' }}>Compartilhe esse código com sua equipe</p>
      </div>

      <div style={{ padding:'0 24px 12px' }}>
        <div style={{ display:'flex', gap:'8px', overflowX:'auto' }}>
          {datas.map(d => {
            const label = d===localDate() ? 'Hoje' : new Date(d+'T12:00:00').toLocaleDateString('pt-BR', {day:'numeric', month:'short'})
            return <button key={d} onClick={() => setData(d)} style={{ padding:'6px 14px', borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'13px', fontWeight:'600', whiteSpace:'nowrap', backgroundColor: data===d?'#2563eb':'#f1f5f9', color: data===d?'white':'#64748b' }}>{label}</button>
          })}
        </div>
      </div>

      {!loading && (
        <div style={{ margin:'0 24px 16px', backgroundColor:'white', borderRadius:'16px', padding:'18px', boxShadow:'0 1px 3px rgba(0,0,0,0.08)' }}>
          <p style={{ margin:'0 0 14px', fontSize:'13px', fontWeight:700, color:'#475569' }}>Resumo do dia</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
            <Kpi titulo="Progresso do dia" valor={progresso + '%'} sub={totalResp + ' de ' + totalEsp + ' tarefas'} />
            <Kpi titulo="Funcionários ativos" valor={ativos} sub="hoje" />
            <Kpi titulo="Fotos registradas" valor={fotosHoje} sub="no dia" />
            <Kpi titulo="Pendências" valor={pendencias} sub="abertas" alerta={pendencias > 0} />
          </div>
          {setoresResumo.length > 0 && (
            <>
              <p style={{ margin:'18px 0 10px', fontSize:'13px', fontWeight:700, color:'#475569' }}>Progresso por área</p>
              <div style={{ display:'flex', gap:'12px', overflowX:'auto', paddingBottom:'4px' }}>
                {setoresResumo.map(([nome, o]) => (
                  <Anel key={nome} pct={o.esp ? Math.round(o.resp / o.esp * 100) : 0} label={nome} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div style={{ padding:'0 24px 40px' }}>
        {loading ? <p style={{ textAlign:'center', color:'#94a3b8' }}>Carregando...</p>
        : Object.keys(porFuncionario).length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px 0', color:'#94a3b8' }}><p style={{ fontSize:'32px' }}>📋</p><p>Nenhum registro nessa data.</p></div>
        ) : Object.entries(porFuncionario).map(([nome, turnos]) => (
          <div key={nome} style={{ backgroundColor:'white', borderRadius:'12px', padding:'16px', marginBottom:'12px', boxShadow:'0 1px 3px rgba(0,0,0,0.08)' }}>
            <p style={{ margin:'0 0 12px 0', fontWeight:'700', fontSize:'15px', color:'#1e293b' }}>👤 {nome}</p>
            {TURNOS.map(turno => {
              const cl = turnos[turno]; const st = status(cl)
              return (
                <button key={turno} onClick={() => cl && abrirDetalhe(cl)}
                  style={{ display:'flex', justifyContent:'space-between', alignItems:'center', width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #f1f5f9', backgroundColor:'#f8fafc', cursor: cl?'pointer':'default', marginBottom:'6px', textAlign:'left' }}>
                  <span style={{ fontSize:'13px', fontWeight:'600', color:'#475569' }}>{turno}</span>
                  <span style={{ fontSize:'13px', color: st.cor, fontWeight:'600' }}>{st.emoji} {st.label}</span>
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
