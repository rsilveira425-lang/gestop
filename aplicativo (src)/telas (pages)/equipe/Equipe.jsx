import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../../conexoes (services)/firebase'
import { collection, query, where, getDocs, updateDoc, setDoc, deleteDoc, doc } from 'firebase/firestore'
import { useAuth } from '../../memoria-global (contexts)/AuthContext'
import { Icon } from '../../componentes (design)'

export default function Equipe({ restaurantId, codigoAcesso, onCodigoAtualizado }) {
  const { user } = useAuth()
  const navigate = useNavigate()
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

  async function excluirMembro(m) {
    if (!window.confirm(`Excluir ${m.nome || m.email} da equipe? Essa pessoa perde o acesso e some da lista. Para voltar, precisará entrar com o código de novo.`)) return
    try {
      await deleteDoc(doc(db, 'usuarios', m.id))
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
    <div style={{ minHeight:'100vh', background:'var(--gs-bg)', paddingBottom:'40px' }}>
      <div className="gs-appbar gs-appbar--row">
        <button onClick={() => navigate('/')} style={{ background:'none', border:'none', color:'white', fontSize:'22px', cursor:'pointer' }}>←</button>
        <h1 style={{ margin:0, fontSize:'20px', fontWeight:'700', display:'flex', alignItems:'center', gap:'9px' }}><Icon name="users" size={21} /> Equipe</h1>
      </div>

      <div style={{ margin:'16px 24px', background:'var(--gs-surface-brand)', borderRadius:'var(--gs-radius-card)', padding:'16px' }}>
        <p className="gs-eyebrow" style={{ margin:0, color:'var(--gs-action)' }}>Código de acesso</p>
        <p className="gs-num" style={{ margin:'6px 0 0 0', fontSize:'30px', fontWeight:600, color:'var(--gs-blue-800)', letterSpacing:'.16em', lineHeight:1.1 }}>{codigo || '—'}</p>
        <button onClick={regenerarCodigo} disabled={gerando}
          style={{ marginTop:'12px', minHeight:'38px', padding:'9px 14px', borderRadius:'var(--gs-radius-md)', border:'none', background:'var(--gs-surface)', color:'var(--gs-action)', fontSize:'13px', fontWeight:'600', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'7px', boxShadow:'var(--gs-shadow-xs)' }}>
          {gerando ? 'Gerando...' : <><Icon name="refresh" size={14} /> Gerar novo código</>}
        </button>
      </div>

      <div style={{ padding:'0 24px' }}>
        <p style={{ fontSize:'13px', fontWeight:600, color:'var(--gs-text-muted)', margin:'10px 0' }}>Membros ({membros.length})</p>
        {loading ? <p style={{ textAlign:'center', color:'var(--gs-text-subtle)' }}>Carregando...</p>
        : membros.map(m => (
          <div key={m.id} style={{ background:'var(--gs-surface)', borderRadius:'var(--gs-radius-card)', padding:'14px 16px', marginBottom:'10px', boxShadow:'var(--gs-shadow-xs)', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'12px', opacity: m.ativo === false ? 0.6 : 1 }}>
            <div style={{ minWidth:0 }}>
              <p style={{ margin:0, fontWeight:'600', fontSize:'14px', color:'var(--gs-text-body)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                <Icon name={m.role === 'dono' ? 'crown' : 'user'} size={14} style={{ display:'inline-block', verticalAlign:'-2px', marginRight:'6px' }} />{m.nome || m.email}{m.id === user.uid ? ' (você)' : ''}
              </p>
              <p style={{ margin:'3px 0 0 0', fontSize:'12px', color:'var(--gs-text-subtle)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {m.email} · {m.role === 'dono' ? 'Gestor' : m.ativo === false ? 'Desativado' : 'Funcionário'}
              </p>
            </div>
            {m.role !== 'dono' && (
              <div style={{ display:'flex', gap:'6px', flexShrink:0 }}>
                <button onClick={() => alternarAcesso(m)}
                  style={{ padding:'8px 12px', minHeight:'36px', borderRadius:'var(--gs-radius-md)', border:'none', fontSize:'12px', fontWeight:'600', cursor:'pointer', whiteSpace:'nowrap',
                    background: m.ativo === false ? 'var(--gs-success-bg)' : 'var(--gs-danger-bg)', color: m.ativo === false ? 'var(--gs-success-text)' : 'var(--gs-danger-text)' }}>
                  {m.ativo === false ? 'Reativar' : 'Desativar'}
                </button>
                <button onClick={() => excluirMembro(m)}
                  style={{ padding:'8px 12px', minHeight:'36px', borderRadius:'var(--gs-radius-md)', border:'none', fontSize:'12px', fontWeight:'600', cursor:'pointer', whiteSpace:'nowrap',
                    background:'var(--gs-surface-sunken)', color:'var(--gs-danger)' }}>
                  Excluir
                </button>
              </div>
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
