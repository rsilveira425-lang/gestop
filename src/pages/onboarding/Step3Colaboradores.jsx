import { useState } from 'react'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../../services/firebase'

const PERFIS = ['Colaborador', 'Líder', 'Admin']

export default function Step3Colaboradores({ restaurantId, onConcluir, onBack }) {
  const [colaboradores, setColaboradores] = useState([])
  const [form, setForm] = useState({ nome: '', perfil: 'Colaborador' })
  const [loading, setLoading] = useState(false)

  function adicionar() {
    if (!form.nome.trim()) return
    setColaboradores([...colaboradores, { ...form }])
    setForm({ nome: '', perfil: 'Colaborador' })
  }

  function remover(idx) {
    setColaboradores(colaboradores.filter((_, i) => i !== idx))
  }

  async function salvar() {
    setLoading(true)
    if (colaboradores.length > 0) {
      const col = collection(db, 'restaurants', restaurantId, 'colaboradores')
      for (const c of colaboradores) {
        await addDoc(col, { ...c, criadoEm: new Date().toISOString() })
      }
    }
    onConcluir()
  }

  return (
    <div style={styles.wrap}>
      <h2 style={styles.title}>Cadastre seus colaboradores</h2>
      <p style={styles.desc}>Adicione quem vai usar o sistema. Você pode pular e adicionar depois.</p>

      <div style={styles.formRow}>
        <input style={styles.input} placeholder="Nome do colaborador" value={form.nome}
          onChange={e => setForm({ ...form, nome: e.target.value })}
          onKeyDown={e => e.key === 'Enter' && adicionar()} />
        <select style={styles.select} value={form.perfil} onChange={e => setForm({ ...form, perfil: e.target.value })}>
          {PERFIS.map(p => <option key={p}>{p}</option>)}
        </select>
        <button style={styles.addBtn} onClick={adicionar}>+</button>
      </div>

      {colaboradores.length === 0 && (
        <p style={styles.empty}>Nenhum colaborador adicionado ainda.</p>
      )}
      {colaboradores.map((c, idx) => (
        <div key={idx} style={styles.item}>
          <div>
            <div style={styles.nome}>{c.nome}</div>
            <div style={styles.perfil}>{c.perfil}</div>
          </div>
          <button style={styles.removeBtn} onClick={() => remover(idx)}>✕</button>
        </div>
      ))}

      <div style={styles.footer}>
        <button style={styles.back} onClick={onBack}>← Voltar</button>
        <button style={styles.next} onClick={salvar} disabled={loading}>
          {loading ? 'Finalizando...' : '✓ Concluir configuração'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  wrap: { padding:'24px' },
  title: { margin:'0 0 8px', fontSize:'20px', fontWeight:700, color:'#0f172a' },
  desc: { margin:'0 0 20px', fontSize:'14px', color:'#64748b' },
  formRow: { display:'flex', gap:'8px', marginBottom:'16px', flexWrap:'wrap' },
  input: { flex:2, minWidth:'140px', padding:'11px', border:'2px solid #e2e8f0', borderRadius:'8px', fontSize:'14px', outline:'none' },
  select: { flex:1, minWidth:'110px', padding:'11px', border:'2px solid #e2e8f0', borderRadius:'8px', fontSize:'14px', outline:'none' },
  addBtn: { padding:'11px 18px', background:'#2563eb', color:'#fff', border:'none', borderRadius:'8px', fontWeight:700, cursor:'pointer', fontSize:'18px' },
  empty: { color:'#94a3b8', fontSize:'13px', textAlign:'center', padding:'16px 0' },
  item: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px', border:'1px solid #e2e8f0', borderRadius:'8px', marginBottom:'8px' },
  nome: { fontWeight:600, fontSize:'14px', color:'#0f172a' },
  perfil: { fontSize:'12px', color:'#64748b', marginTop:'2px' },
  removeBtn: { background:'none', border:'none', color:'#94a3b8', cursor:'pointer', fontSize:'14px' },
  footer: { display:'flex', gap:'8px', marginTop:'20px' },
  back: { padding:'13px 20px', background:'#f1f5f9', color:'#64748b', border:'none', borderRadius:'8px', fontSize:'14px', cursor:'pointer' },
  next: { flex:1, padding:'13px', background:'#16a34a', color:'#fff', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:600, cursor:'pointer' },
}
