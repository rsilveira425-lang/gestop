import { useState, useEffect } from 'react'
import { db } from '../../services/firebase'
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore'

const TURNOS = ['Abertura', 'Pré pico', 'Fechamento']

export default function GestorView({ restaurantId, codigoAcesso: codigoAcessoProp, onVoltar }) {
  const [checklists, setChecklists] = useState([])
  const [loading, setLoading] = useState(true)
  const codigoAcesso = codigoAcessoProp || '—'
  const localDate = (d=new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  const [data, setData] = useState(localDate())
  const [detalhe, setDetalhe] = useState(null)
  const [mapaT, setMapaT] = useState({})
  const [fotoAmpliada, setFotoAmpliada] = useState(null)

  useEffect(() => { carregarDados() }, [data])

  async function carregarDados() {
    setLoading(true)
    try {
      const tSnap = await getDocs(collection(db, 'restaurants', restaurantId, 'tarefas'))
      const mapa = {}
      tSnap.docs.forEach(d => { mapa[d.id] = d.data().texto })
      setMapaT(mapa)
      const q = query(collection(db, 'restaurants', restaurantId, 'checklists'), where('data', '==', data))
      const s = await getDocs(q)
      setChecklists(s.docs.map(d => ({ id: d.id, ...d.data() })))
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

  const datas = Array.from({length:7}, (_,i) => { const d=new Date(); d.setDate(d.getDate()-i); return localDate(d) })

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
        ) : [...new Set([...Object.keys(mapaT), ...Object.keys(detalhe.respostas||{})])].map(id => [id, (detalhe.respostas||{})[id]]).map(([id, resp]) => (
          <div key={id} style={{ backgroundColor:'white', borderRadius:'10px', padding:'14px', marginBottom:'10px', boxShadow:'0 1px 2px rgba(0,0,0,0.06)', borderLeft:`4px solid ${resp===undefined?'#e2e8f0':resp==='sim'?'#16a34a':'#dc2626'}` }}>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontSize:'13px', color:'#64748b' }}>{mapaT[id] || 'Tarefa #' + id.slice(-4)}</span>
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
                <button key={turno} onClick={() => cl && setDetalhe(cl)}
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
