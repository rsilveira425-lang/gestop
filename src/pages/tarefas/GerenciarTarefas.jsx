import { useState, useEffect } from 'react'
import { db } from '../../services/firebase'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'

const TURNOS = ['Abertura', 'Pré pico', 'Fechamento']

export default function GerenciarTarefas({ restaurantId, onVoltar }) {
  const [tarefas, setTarefas] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ texto: '', setorNome: '', turno: 'Abertura' })
  const [editando, setEditando] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setLoading(true)
    const snap = await getDocs(collection(db, 'restaurants', restaurantId, 'tarefas'))
    setTarefas(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }

  async function adicionar() {
    if (!form.texto.trim() || !form.setorNome.trim()) return
    setSaving(true)
    await addDoc(collection(db, 'restaurants', restaurantId, 'tarefas'), {
      texto: form.texto.trim(),
      setorNome: form.setorNome.trim(),
      turno: form.turno
    })
    setForm({ texto: '', setorNome: '', turno: 'Abertura' })
    await carregar()
    setSaving(false)
  }

  async function salvarEdicao() {
    if (!editando || !editando.texto.trim()) return
    setSaving(true)
    await updateDoc(doc(db, 'restaurants', restaurantId, 'tarefas', editando.id), {
      texto: editando.texto.trim(),
      setorNome: editando.setorNome.trim(),
      turno: editando.turno
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
    body: { padding:'24px', maxWidth:'700px', margin:'0 auto' },
    card: { backgroundColor:'white', borderRadius:'12px', padding:'20px', marginBottom:'16px', boxShadow:'0 1px 3px rgba(0,0,0,0.08)' },
    label: { fontSize:'12px', fontWeight:'600', color:'#64748b', marginBottom:'6px', display:'block' },
    input: { width:'100%', padding:'10px 12px', border:'1px solid #e2e8f0', borderRadius:'8px', fontSize:'14px', outline:'none', boxSizing:'border-box' },
    select: { width:'100%', padding:'10px 12px', border:'1px solid #e2e8f0', borderRadius:'8px', fontSize:'14px', outline:'none', backgroundColor:'white', boxSizing:'border-box' },
    btnAdd: { width:'100%', padding:'12px', backgroundColor:'#2563eb', color:'white', border:'none', borderRadius:'8px', fontSize:'15px', fontWeight:'600', cursor:'pointer', marginTop:'12px' },
    turnoHeader: { fontSize:'16px', fontWeight:'700', color:'#1e293b', marginBottom:'12px', paddingBottom:'8px', borderBottom:'2px solid #e2e8f0' },
    tarefa: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px', borderRadius:'8px', border:'1px solid #f1f5f9', marginBottom:'8px', backgroundColor:'#fafafa' },
    tarefaInfo: { flex:1 },
    tarefaTexto: { fontSize:'14px', fontWeight:'500', color:'#1e293b' },
    tarefaSetor: { fontSize:'12px', color:'#94a3b8', marginTop:'2px' },
    btnEdit: { padding:'6px 12px', backgroundColor:'#f1f5f9', border:'none', borderRadius:'6px', fontSize:'13px', cursor:'pointer', marginRight:'6px' },
    btnDel: { padding:'6px 12px', backgroundColor:'#fef2f2', color:'#dc2626', border:'none', borderRadius:'6px', fontSize:'13px', cursor:'pointer' },
    editBox: { backgroundColor:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:'10px', padding:'16px', marginBottom:'8px' },
    row: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px' },
    btnSave: { padding:'8px 16px', backgroundColor:'#2563eb', color:'white', border:'none', borderRadius:'6px', fontSize:'13px', fontWeight:'600', cursor:'pointer', marginRight:'8px' },
    btnCancel: { padding:'8px 16px', backgroundColor:'#f1f5f9', border:'none', borderRadius:'6px', fontSize:'13px', cursor:'pointer' },
  }

  return (
    <div style={s.screen}>
      <div style={s.header}>
        <button style={s.back} onClick={onVoltar}>←</button>
        <h1 style={{ margin:0, fontSize:'20px', fontWeight:'700' }}>⚙️ Gerenciar Tarefas</h1>
      </div>

      <div style={s.body}>
        {/* Adicionar nova tarefa */}
        <div style={s.card}>
          <h2 style={{ margin:'0 0 16px 0', fontSize:'16px', fontWeight:'700', color:'#1e293b' }}>+ Adicionar Tarefa</h2>
          <div style={s.row}>
            <div>
              <label style={s.label}>Turno</label>
              <select style={s.select} value={form.turno} onChange={e => setForm({...form, turno: e.target.value})}>
                {TURNOS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={s.label}>Setor</label>
              <input style={s.input} placeholder="Ex: Cozinha" value={form.setorNome} onChange={e => setForm({...form, setorNome: e.target.value})} />
            </div>
          </div>
          <label style={s.label}>Tarefa</label>
          <input style={s.input} placeholder="Ex: Verificar temperatura da câmara" value={form.texto} onChange={e => setForm({...form, texto: e.target.value})} />
          <button style={s.btnAdd} onClick={adicionar} disabled={saving}>
            {saving ? 'Salvando...' : 'Adicionar tarefa'}
          </button>
        </div>

        {/* Tarefas por turno */}
        {loading ? <p style={{ textAlign:'center', color:'#94a3b8' }}>Carregando...</p> : (
          TURNOS.map(turno => {
            const lista = tarefas.filter(t => t.turno === turno)
            return (
              <div key={turno} style={s.card}>
                <p style={s.turnoHeader}>{turno} <span style={{ fontSize:'13px', color:'#94a3b8', fontWeight:'400' }}>({lista.length} tarefas)</span></p>
                {lista.length === 0 && <p style={{ color:'#94a3b8', fontSize:'14px' }}>Nenhuma tarefa neste turno.</p>}
                {lista.map(tarefa => (
                  <div key={tarefa.id}>
                    {editando?.id === tarefa.id ? (
                      <div style={s.editBox}>
                        <div style={s.row}>
                          <div>
                            <label style={s.label}>Turno</label>
                            <select style={s.select} value={editando.turno} onChange={e => setEditando({...editando, turno: e.target.value})}>
                              {TURNOS.map(t => <option key={t}>{t}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={s.label}>Setor</label>
                            <input style={s.input} value={editando.setorNome} onChange={e => setEditando({...editando, setorNome: e.target.value})} />
                          </div>
                        </div>
                        <label style={s.label}>Tarefa</label>
                        <input style={{...s.input, marginBottom:'12px'}} value={editando.texto} onChange={e => setEditando({...editando, texto: e.target.value})} />
                        <button style={s.btnSave} onClick={salvarEdicao} disabled={saving}>Salvar</button>
                        <button style={s.btnCancel} onClick={() => setEditando(null)}>Cancelar</button>
                      </div>
                    ) : (
                      <div style={s.tarefa}>
                        <div style={s.tarefaInfo}>
                          <p style={s.tarefaTexto}>{tarefa.texto}</p>
                          {tarefa.setorNome && <p style={s.tarefaSetor}>{tarefa.setorNome}</p>}
                        </div>
                        <div>
                          <button style={s.btnEdit} onClick={() => setEditando({...tarefa})}>✏️ Editar</button>
                          <button style={s.btnDel} onClick={() => excluir(tarefa.id)}>🗑️ Excluir</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
