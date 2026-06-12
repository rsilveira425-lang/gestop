import { useState } from 'react'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../../services/firebase'

const TURNOS = ['Abertura', 'Pré pico', 'Fechamento']

export default function Step1Setores({ restaurantId, nomeRestaurante, onNext }) {
  const [setores, setSetores] = useState([])
  const [novoSetor, setNovoSetor] = useState('')
  const [loading, setLoading] = useState(false)

  function adicionar() {
    const nome = novoSetor.trim()
    if (!nome || setores.find(s => s.nome.toLowerCase() === nome.toLowerCase())) return
    setSetores([...setores, { nome, turnos: ['Abertura', 'Fechamento'] }])
    setNovoSetor('')
  }

  function toggleTurno(idx, turno) {
    const updated = [...setores]
    const t = updated[idx].turnos
    updated[idx].turnos = t.includes(turno) ? t.filter(x => x !== turno) : [...t, turno]
    setSetores(updated)
  }

  function remover(idx) {
    setSetores(setores.filter((_, i) => i !== idx))
  }

  async function salvar() {
    if (setores.length === 0) return
    setLoading(true)
    try {
      const col = collection(db, 'restaurants', restaurantId, 'setores')
      const saved = []
      for (const s of setores) {
        const ref = await addDoc(col, { nome: s.nome, turnos: s.turnos, criadoEm: new Date().toISOString() })
        saved.push({ id: ref.id, ...s })
      }
      onNext(saved)
    } catch(e) {
      console.error('Erro ao salvar setores:', e)
      alert('Erro ao salvar: ' + e.message)
      setLoading(false)
    }
  }

  return (
    <div style={styles.wrap}>
      <h2 style={styles.title}>Quais são os setores do seu restaurante?</h2>
      <p style={styles.desc}>Ex: Cozinha, Salão, Bar, Delivery. Você poderá adicionar mais depois.</p>

      <div style={styles.addRow}>
        <input style={styles.input} placeholder="Nome do setor" value={novoSetor}
          onChange={e => setNovoSetor(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && adicionar()} />
        <button style={styles.addBtn} onClick={adicionar}>Adicionar</button>
      </div>

      {setores.length === 0 && (
        <p style={styles.empty}>Nenhum setor adicionado ainda.</p>
      )}

      {setores.map((s, idx) => (
        <div key={idx} style={styles.card}>
          <div style={styles.cardTop}>
            <span style={styles.cardNome}>{s.nome}</span>
            <button style={styles.removeBtn} onClick={() => remover(idx)}>✕</button>
          </div>
          <p style={styles.turnoLabel}>Turnos deste setor:</p>
          <div style={styles.turnoRow}>
            {TURNOS.map(t => (
              <button key={t} style={{ ...styles.turnoBtn, ...(s.turnos.includes(t) ? styles.turnoBtnOn : {}) }}
                onClick={() => toggleTurno(idx, t)}>{t}</button>
            ))}
          </div>
        </div>
      ))}

      <button style={{ ...styles.next, opacity: setores.length === 0 ? 0.5 : 1 }}
        onClick={salvar} disabled={setores.length === 0 || loading}>
        {loading ? 'Salvando...' : 'Próximo →'}
      </button>
    </div>
  )
}

const styles = {
  wrap: { padding:'24px' },
  title: { margin:'0 0 8px', fontSize:'20px', fontWeight:700, color:'#0f172a' },
  desc: { margin:'0 0 20px', fontSize:'14px', color:'#64748b' },
  addRow: { display:'flex', gap:'8px', marginBottom:'16px' },
  input: { flex:1, padding:'11px', border:'2px solid #e2e8f0', borderRadius:'8px', fontSize:'14px', outline:'none' },
  addBtn: { padding:'11px 18px', background:'#2563eb', color:'#fff', border:'none', borderRadius:'8px', fontWeight:600, cursor:'pointer', fontSize:'14px' },
  empty: { color:'#94a3b8', fontSize:'13px', textAlign:'center', padding:'20px 0' },
  card: { border:'1px solid #e2e8f0', borderRadius:'10px', padding:'14px', marginBottom:'10px' },
  cardTop: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' },
  cardNome: { fontWeight:600, fontSize:'15px', color:'#0f172a' },
  removeBtn: { background:'none', border:'none', color:'#94a3b8', cursor:'pointer', fontSize:'16px' },
  turnoLabel: { margin:'0 0 8px', fontSize:'12px', color:'#64748b' },
  turnoRow: { display:'flex', gap:'6px', flexWrap:'wrap' },
  turnoBtn: { padding:'6px 12px', border:'2px solid #e2e8f0', borderRadius:'20px', background:'#fff', fontSize:'12px', cursor:'pointer', color:'#64748b' },
  turnoBtnOn: { border:'2px solid #2563eb', background:'#eff6ff', color:'#2563eb', fontWeight:600 },
  next: { width:'100%', padding:'13px', background:'#2563eb', color:'#fff', border:'none', borderRadius:'8px', fontSize:'15px', fontWeight:600, cursor:'pointer', marginTop:'20px' },
}
