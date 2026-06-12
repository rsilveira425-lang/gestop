import { useState, useEffect } from 'react'
import { db } from '../../services/firebase'
import { collection, query, where, getDocs, updateDoc, setDoc, deleteDoc, doc } from 'firebase/firestore'
import { useAuth } from '../../contexts/AuthContext'

export default function Equipe({ restaurantId, codigoAcesso, onCodigoAtualizado, onVoltar }) {
  const { user } = useAuth()
  const [membros, setMembros] = useState([])
  const [loading, setLoading] = useState(true)
  const [codigo, setCodigo] = useState(codigoAcesso)
  const [gerando, setGerando] = useState(false)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setLoading(true)
    try {
      const q = query(collection(db, 'usuarios'), where('restaurantId', '==', restaurantId))
      const snap = await getDocs(q)
      const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      lista.sort((a, b) => (a.role === 'dono' ? -1 : 1) - (b.role === 'dono' ? -1 : 1))
      setMembros(lista)
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  async function alternarAcesso(m) {
    const desativar = m.ativo !== false
    if (desativar && !window.confirm(`Desativar o acesso de ${m.nome || m.email}?`)) return
    try {
      await updateDoc(doc(db, 'usuarios', m.id), { ativo: !desativar })
      await carregar()
    } catch(e) { alert('Erro: ' + e.message) }
  }

  async function regenerarCodigo() {
    if (!window.confirm('Gerar um novo código? O código atual deixa de funcionar para novas entradas. Quem já está na equipe continua com acesso.')) return
    setGerando(true)
    try {
      const novo = Math.random().toString(36).substring(2, 8).toUpperCase()
      await setDoc(doc(db, 'convites', novo), { restaurantId })
      await updateDoc(doc(db, 'restaurants', restaurantId), { codigoAcesso: novo })
      if (codigo) { try { await deleteDoc(doc(db, 'convites', codigo)) } catch(e) {} }
      setCodigo(novo)
      onCodigoAtualizado?.(novo)
    } catch(e) { alert('Erro: ' + e.message) }
    setGerando(false)
  }

  return (
    <div style={{ minHeight:'100vh', backgroundColor:'#f8fafc', paddingBottom:'40px' }}>
      <div style={{ backgroundColor:'#2563eb', color:'white', padding:'20px 24px', display:'flex', alignItems:'center', gap:'12px' }}>
        <button onClick={onVoltar} style={{ background:'none', border:'none', color:'white', fontSize:'22px', cursor:'pointer' }}>←</button>
        <h1 style={{ margin:0, fontSize:'20px', fontWeight:'700' }}>👥 Equipe</h1>
      </div>

      <div style={{ margin:'16px 24px', backgroundColor:'#eff6ff', borderRadius:'12px', padding:'16px', border:'1px solid #bfdbfe' }}>
        <p style={{ margin:0, fontSize:'11px', color:'#3b82f6', fontWeight:'700', textTransform:'uppercase', letterSpacing:'1px' }}>Código de acesso</p>
        <p style={{ margin:'4px 0 0 0', fontSize:'32px', fontWeight:'900', color:'#1e40af', letterSpacing:'8px' }}>{codigo || '—'}</p>
        <button onClick={regenerarCodigo} disabled={gerando}
          style={{ marginTop:'10px', padding:'8px 14px', borderRadius:'8px', border:'1px solid #bfdbfe', backgroundColor:'white', color:'#2563eb', fontSize:'13px', fontWeight:'600', cursor:'pointer' }}>
          {gerando ? 'Gerando...' : '↻ Gerar novo código'}
        </button>
      </div>

      <div style={{ padding:'0 24px' }}>
        <p style={{ fontSize:'13px', fontWeight:'700', color:'#64748b', textTransform:'uppercase', margin:'8px 0' }}>Membros ({membros.length})</p>
        {loading ? <p style={{ textAlign:'center', color:'#94a3b8' }}>Carregando...</p>
        : membros.map(m => (
          <div key={m.id} style={{ backgroundColor:'white', borderRadius:'12px', padding:'14px 16px', marginBottom:'10px', boxShadow:'0 1px 3px rgba(0,0,0,0.08)', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'12px', opacity: m.ativo === false ? 0.6 : 1 }}>
            <div style={{ minWidth:0 }}>
              <p style={{ margin:0, fontWeight:'600', fontSize:'14px', color:'#1e293b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {m.role === 'dono' ? '👑 ' : '👤 '}{m.nome || m.email}{m.id === user.uid ? ' (você)' : ''}
              </p>
              <p style={{ margin:'2px 0 0 0', fontSize:'12px', color:'#94a3b8', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {m.email} · {m.role === 'dono' ? 'Gestor' : m.ativo === false ? 'Desativado' : 'Funcionário'}
              </p>
            </div>
            {m.role !== 'dono' && (
              <button onClick={() => alternarAcesso(m)}
                style={{ padding:'6px 12px', borderRadius:'8px', border:'none', fontSize:'12px', fontWeight:'600', cursor:'pointer', whiteSpace:'nowrap',
                  backgroundColor: m.ativo === false ? '#f0fdf4' : '#fef2f2', color: m.ativo === false ? '#16a34a' : '#dc2626' }}>
                {m.ativo === false ? 'Reativar' : 'Desativar'}
              </button>
            )}
          </div>
        ))}
        {!loading && membros.filter(m => m.role !== 'dono').length === 0 && (
          <p style={{ fontSize:'13px', color:'#94a3b8', textAlign:'center', marginTop:'16px' }}>Nenhum funcionário entrou ainda. Compartilhe o código acima com sua equipe.</p>
        )}
      </div>
    </div>
  )
}
