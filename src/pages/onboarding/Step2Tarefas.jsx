import { useState } from 'react'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../../services/firebase'

export default function Step2Tarefas({ restaurantId, setores, onNext, onBack }) {
  const [setorAtivo, setSetorAtivo] = useState(setores[0]?.id || '')
  const [turnoAtivo, setTurnoAtivo] = useState(setores[0]?.turnos[0] || '')
  const [tarefas, setTarefas] = useState({})
  const [novaTarefa, setNovaTarefa] = useState('')
  const [loading, setLoading] = useState(false)

  const key = `${setorAtivo}__${turnoAtivo}`
  const listaTarefas = tarefas[key] || []

  function adicionar() {
    const texto = novaTarefa.trim()
    if (!texto) return
    setTarefas({ ...tarefas, [key]: [...listaTarefas, texto] })
    setNovaTarefa('')
  }

  function remover(idx) {
    setTarefas({ ...tarefas, [key]: listaTarefas.filter((_, i) => i !== idx) })
  }

  function selecionarSetor(setor) {
    setSetorAtivo(setor.id)
    setTurnoAtivo(setor.turnos[0])
  }

  async function salvar() {
    setLoading(true)
    const col = collection(db, 'restaurants', restaurantId, 'tarefas')
    for (const [k, lista] of Object.entries(tarefas)) {
      const [setorId, turno] = k.split('__')
      const setor = setores.find(s => s.id === setorId)
      for (let i = 0; i < lista.length; i++) {
        await addDoc(col, { texto: lista[i], setorId, setorNome: setor?.nome || '', turno, ordem: i, criadoEm: new Date().toISOString() })
      }
    }
    onNext()
  }

  const totalTarefas = Object.values(tarefas).flat().length
  const setorAtual = setores.find(s => s.id === setorAtivo)

  return (
    <div style={styles.wrap}>
      <h2 style={styles.title}>Cadastre as tarefas por setor</h2>
      <p style={styles.desc}>Selecione um setor e turno, depois adicione as tarefas.</p>

      <div style={styles.setorTabs}>
        {setores.map(s => (
          <button key={s.id} style={{ ...styles.tab, ...(s.id === setorAtivo ? styles.tabOn : {}) }}
            onClick={() => selecionarSetor(s)}>{s.nome}</button>
        ))}
      </div>

      {setorAtual && (
        <div style={styles.turnoTabs}>
          {setorAtual.turnos.map(t => (
            <button key={t} style={{ ...styles.turnoBtn, ...(t === turnoAtivo ? styles.turnoBtnOn : {}) }}
              onClick={() => setTurnoAtivo(t)}>{t}</button>
          ))}
        </div>
      )}

      <div style={styles.addRow}>
        <input style={styles.input} placeholder="Descreva a tarefa..." value={novaTarefa}
          onChange={e => setNovaTarefa(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && adicionar()} />
        <button style={styles.addBtn} onClick={adicionar}>+</button>
      </div>

      {listaTarefas.length === 0 && (
        <p style={styles.empty}>Nenhuma tarefa neste turno ainda.</p>
      )}
      {listaTarefas.map((t, idx) => (
        <div key={idx} style={styles.tarefaItem}>
          <span style={styles.tarefaNum}>{idx + 1}</span>
          <span style={styles.tarefaTexto}>{t}</span>
          <button style={styles.removeBtn} onClick={() => remover(idx)}>✕</button>
        </div>
      ))}

      <div style={styles.footer}>
        <button style={styles.back} onClick={onBack}>← Voltar</button>
        <button style={{ ...styles.next, opacity: totalTarefas === 0 ? 0.5 : 1 }}
          onClick={salvar} disabled={loading}>
          {loading ? 'Salvando...' : `Próximo → (${totalTarefas} tarefa${totalTarefas !== 1 ? 's' : ''})`}
        </button>
      </div>
    </div>
  )
}

const styles = {
  wrap: { padding:'24px' },
  title: { margin:'0 0 8px', fontSize:'20px', fontWeight:700, color:'#0f172a' },
  desc: { margin:'0 0 16px', fontSize:'14px', color:'#64748b' },
  setorTabs: { display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'12px' },
  tab: { padding:'8px 14px', border:'2px solid #e2e8f0', borderRadius:'20px', background:'#fff', fontSize:'13px', cursor:'pointer', color:'#64748b' },
  tabOn: { border:'2px solid #2563eb', background:'#eff6ff', color:'#2563eb', fontWeight:600 },
  turnoTabs: { display:'flex', gap:'6px', marginBottom:'16px' },
  turnoBtn: { padding:'6px 12px', border:'1px solid #e2e8f0', borderRadius:'6px', background:'#f8fafc', fontSize:'12px', cursor:'pointer', color:'#64748b' },
  turnoBtnOn: { background:'#0f172a', color:'#fff', border:'1px solid #0f172a', fontWeight:600 },
  addRow: { display:'flex', gap:'8px', marginBottom:'12px' },
  input: { flex:1, padding:'11px', border:'2px solid #e2e8f0', borderRadius:'8px', fontSize:'14px', outline:'none' },
  addBtn: { padding:'11px 18px', background:'#2563eb', color:'#fff', border:'none', borderRadius:'8px', fontWeight:700, cursor:'pointer', fontSize:'18px' },
  empty: { color:'#94a3b8', fontSize:'13px', textAlign:'center', padding:'16px 0' },
  tarefaItem: { display:'flex', alignItems:'center', gap:'10px', padding:'10px', border:'1px solid #e2e8f0', borderRadius:'8px', marginBottom:'6px' },
  tarefaNum: { fontSize:'12px', color:'#94a3b8', minWidth:'20px' },
  tarefaTexto: { flex:1, fontSize:'14px', color:'#0f172a' },
  removeBtn: { background:'none', border:'none', color:'#94a3b8', cursor:'pointer', fontSize:'14px' },
  footer: { display:'flex', gap:'8px', marginTop:'20px' },
  back: { padding:'13px 20px', background:'#f1f5f9', color:'#64748b', border:'none', borderRadius:'8px', fontSize:'14px', cursor:'pointer' },
  next: { flex:1, padding:'13px', background:'#2563eb', color:'#fff', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:600, cursor:'pointer' },
}
