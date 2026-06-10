import { useState, useEffect } from 'react'
import { db } from '../../services/firebase'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'

const TURNOS = ['Abertura', 'Pr\u00e9 pico', 'Fechamento']

export default function GerenciarTarefas({ restaurantId, onVoltar }) {
  const [setores, setSetores] = useState([])
  const [tarefas, setTarefas] = useState([])
  const [setorAtivo, setSetorAtivo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [adicionando, setAdicionando] = useState(null)
  const [novoTexto, setNovoTexto] = useState('')
  const [editando, setEditando] = useState(null)
  const [saving, setSaving] = useState(false)
  const [verSetores, setVerSetores] = useState(false)
  const [novoSetor, setNovoSetor] = useState('')

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setLoading(true)
    const [sSnap, tSnap] = await Promise.all([
      getDocs(collection(db, 'restaurants', restaurantId, 'setores')),
      getDocs(collection(db, 'restaurants', restaurantId, 'tarefas'))
    ])
    const s = sSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    const t = tSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    setSetores(s)
    setTarefas(t)
    if (s.length > 0) setSetorAtivo(prev => prev || s[0].nome)
    setLoading(false)
  }

  async function adicionarTarefa() {
    if (!novoTexto.trim() || !adicionando) return
    setSaving(true)
    await addDoc(collection(db, 'restaurants', restaurantId, 'tarefas'), {
      texto: novoTexto.trim(),
      setorNome: adicionando.setor,
      turno: adicionando.turno
    })
    setNovoTexto('')
    setAdicionando(null)
    await carregar()
    setSaving(false)
  }

  async function salvarEdicao() {
    if (!editando || !editando.texto.trim()) return
    setSaving(true)
    await updateDoc(doc(db, 'restaurants', restaurantId, 'tarefas', editando.id), {
      texto: editando.texto.trim()
    })
    setEditando(null)
    await carregar()
    setSaving(false)
  }

  async function excluir(id) {
    if (!window.confirm('Excluir esta tarefa?')) return
    await deleteDoc(doc(db, 'restaurants', restaurantId, 'tarefas', id))
    await carregar()
  }

  const s = {
    screen: { minHeight:'100vh', backgroundColor:'#f8fafc' },
    header: { backgroundColor:'#2563eb', color:'white', padding:'20px 24px', display:'flex', alignItems:'center', gap:'12px' },
    back: { background:'none', border:'none', color:'white', fontSize:'22px', cursor:'pointer' },
    tabs: { display:'flex', gap:'0', backgroundColor:'white', borderBottom:'2px solid #e2e8f0', paddingLeft:'24px' },
    tab: (ativo) => ({ padding:'12px 24px', border:'none', background:'none', fontSize:'15px', fontWeight:'600', cursor:'pointer', color: ativo ? '#2563eb' : '#64748b', borderBottom: ativo ? '2px solid #2563eb' : '2px solid transparent', marginBottom:'-2px' }),
    body: { padding:'20px 24px', maxWidth:'700px', margin:'0 auto' },
    turnoCard: { backgroundColor:'white', borderRadius:'12px', marginBottom:'16px', boxShadow:'0 1px 3px rgba(0,0,0,0.08)', overflow:'hidden' },
    turnoHeader: { padding:'14px 20px', backgroundColor:'#f8fafc', borderBottom:'1px solid #e2e8f0', fontSize:'14px', fontWeight:'700', color:'#475569' },
    tarefa: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 20px', borderBottom:'1px solid #f1f5f9' },
    tarefaTexto: { fontSize:'14px', color:'#1e293b', flex:1 },
    btnEdit: { padding:'4px 10px', backgroundColor:'#f1f5f9', border:'none', borderRadius:'6px', fontSize:'12px', cursor:'pointer', marginRight:'6px', color:'#475569' },
    btnDel: { padding:'4px 10px', backgroundColor:'#fef2f2', border:'none', borderRadius:'6px', fontSize:'12px', cursor:'pointer', color:'#dc2626' },
    addRow: { padding:'12px 20px', display:'flex', gap:'8px', alignItems:'center' },
    addInput: { flex:1, padding:'8px 12px', border:'1px solid #e2e8f0', borderRadius:'8px', fontSize:'16px', outline:'none' },
    btnConfirm: { padding:'8px 14px', backgroundColor:'#2563eb', color:'white', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:'600', cursor:'pointer' },
    btnCancel: { padding:'8px 12px', backgroundColor:'#f1f5f9', border:'none', borderRadius:'8px', fontSize:'13px', cursor:'pointer' },
    btnAdd: { width:'100%', padding:'10px', backgroundColor:'#f8fafc', border:'1px dashed #cbd5e1', borderRadius:'0', fontSize:'13px', color:'#64748b', cursor:'pointer', textAlign:'left' },
    editBox: { padding:'12px 20px', backgroundColor:'#eff6ff', borderBottom:'1px solid #bfdbfe', display:'flex', gap:'8px', alignItems:'center' },
  }

  async function adicionarSetor() {
    if (!novoSetor.trim()) return
    setSaving(true)
    await addDoc(collection(db, 'restaurants', restaurantId, 'setores'), { nome: novoSetor.trim() })
    setNovoSetor('')
    await carregar()
    setSaving(false)
  }

  async function excluirSetor(id, nome) {
    const temTarefas = tarefas.some(t => t.setorNome?.toLowerCase() === nome.toLowerCase())
    if (temTarefas) { alert('Remova as tarefas do setor antes de excluir.'); return }
    if (!window.confirm('Excluir setor ' + nome + '?')) return
    await deleteDoc(doc(db, 'restaurants', restaurantId, 'setores', id))
    if (setorAtivo?.toLowerCase() === nome.toLowerCase()) setSetorAtivo(null)
    await carregar()
  }

  if (loading) return <div style={{ textAlign:'center', padding:'60px', color:'#94a3b8' }}>Carregando...</div>

  return (
    <div style={s.screen}>
      <div style={s.header}>
        <button style={s.back} onClick={onVoltar}>{String.fromCharCode(8592)}</button>
        <h1 style={{ margin:0, fontSize:'20px', fontWeight:'700' }}>Gerenciar Tarefas</h1>
          <button onClick={() => setVerSetores(p => !p)} style={{ marginLeft:'auto', padding:'6px 12px', backgroundColor: verSetores ? '#2563eb' : '#f1f5f9', color: verSetores ? 'white' : '#475569', border:'none', borderRadius:'8px', fontSize:'12px', cursor:'pointer', fontWeight:'600' }}>Setores</button>
      </div>

      {verSetores && (
        <div style={{ padding:'16px 20px', backgroundColor:'#f8fafc', borderBottom:'1px solid #e2e8f0', marginBottom:'8px' }}>
          <p style={{ margin:'0 0 12px', fontWeight:'600', fontSize:'14px', color:'#1e293b' }}>Setores cadastrados</p>
          {setores.map(setor => (
            <div key={setor.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #f1f5f9' }}>
              <span style={{ fontSize:'14px', color:'#1e293b' }}>{setor.nome}</span>
              <button onClick={() => excluirSetor(setor.id, setor.nome)} style={{ padding:'4px 10px', backgroundColor:'#fef2f2', border:'none', borderRadius:'6px', color:'#dc2626', fontSize:'12px', cursor:'pointer' }}>remover</button>
            </div>
          ))}
          <div style={{ display:'flex', gap:'8px', marginTop:'12px' }}>
            <input value={novoSetor} onChange={e => setNovoSetor(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') adicionarSetor() }} placeholder="Novo setor..." style={{ flex:1, padding:'8px 12px', border:'1px solid #e2e8f0', borderRadius:'8px', fontSize:'16px', outline:'none' }} />
            <button onClick={adicionarSetor} disabled={saving} style={{ padding:'8px 14px', backgroundColor:'#2563eb', color:'white', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:'600', cursor:'pointer' }}>+ Adicionar</button>
          </div>
        </div>
      )}
      <div style={s.tabs}>
        {setores.map(setor => (
          <button key={setor.id} style={s.tab(setorAtivo === setor.nome)} onClick={() => setSetorAtivo(setor.nome)}>
            {setor.nome}
          </button>
        ))}
      </div>

      <div style={s.body}>
        {TURNOS.map(turno => {
          const lista = tarefas.filter(t => t.setorNome?.trim() === setorAtivo?.trim() && t.turno?.trim() === turno?.trim())
          const esteAdicionando = adicionando?.setor === setorAtivo && adicionando?.turno === turno
          return (
            <div key={turno} style={s.turnoCard}>
              <div style={s.turnoHeader}>{turno} <span style={{ fontWeight:400, color:'#94a3b8' }}>({lista.length})</span></div>

              {lista.map(tarefa => (
                editando?.id === tarefa.id ? (
                  <div key={tarefa.id} style={s.editBox}>
                    <input style={s.addInput} value={editando.texto} onChange={e => setEditando({...editando, texto: e.target.value})} autoFocus />
                    <button style={s.btnConfirm} onClick={salvarEdicao} disabled={saving}>Salvar</button>
                    <button style={s.btnCancel} onClick={() => setEditando(null)}>{String.fromCharCode(215)}</button>
                  </div>
                ) : (
                  <div key={tarefa.id} style={s.tarefa}>
                    <span style={s.tarefaTexto}>{tarefa.texto}</span>
                    <button style={s.btnEdit} onClick={() => setEditando({...tarefa})}>editar</button>
                    <button style={s.btnDel} onClick={() => excluir(tarefa.id)}>excluir</button>
                  </div>
                )
              ))}

              {esteAdicionando ? (
                <div style={s.addRow}>
                  <input style={s.addInput} placeholder="Nome da tarefa..." value={novoTexto} onChange={e => setNovoTexto(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') adicionarTarefa() }} autoFocus />
                  <button style={s.btnConfirm} onClick={adicionarTarefa} disabled={saving}>Salvar</button>
                  <button style={s.btnCancel} onClick={() => { setAdicionando(null); setNovoTexto('') }}>{String.fromCharCode(215)}</button>
                </div>
              ) : (
                <button style={s.btnAdd} onClick={() => { setAdicionando({ setor: setorAtivo, turno }); setNovoTexto('') }}>
                  + Adicionar Tarefa
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
