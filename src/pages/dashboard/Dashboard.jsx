
import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../services/firebase'
import {
  collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp
} from 'firebase/firestore'

const TURNOS = ['Abertura', 'Meio do dia', 'Fechamento']

export default function Dashboard() {
  const { user } = useAuth()
  const [turnoAtivo, setTurnoAtivo] = useState('Abertura')
  const [tarefas, setTarefas] = useState([])
  const [respostas, setRespostas] = useState({})
  const [checklistId, setChecklistId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [concluido, setConcluido] = useState(false)

  const hoje = new Date().toISOString().split('T')[0]

  useEffect(() => { carregarDados() }, [turnoAtivo])

  async function carregarDados() {
    setLoading(true)
    setConcluido(false)
    setRespostas({})
    setChecklistId(null)

    try {
      const tarefasRef = collection(db, 'restaurants', user.uid, 'tarefas')
      const qTarefas = query(tarefasRef, where('turno', '==', turnoAtivo))
      const snapTarefas = await getDocs(qTarefas)
      const listaTarefas = snapTarefas.docs.map(d => ({ id: d.id, ...d.data() }))
      setTarefas(listaTarefas)

      const checkRef = collection(db, 'restaurants', user.uid, 'checklists')
      const qCheck = query(checkRef, where('data', '==', hoje), where('turno', '==', turnoAtivo))
      const snapCheck = await getDocs(qCheck)

      if (!snapCheck.empty) {
        const cl = snapCheck.docs[0]
        setChecklistId(cl.id)
        setRespostas(cl.data().respostas || {})
        setConcluido(cl.data().concluido || false)
      }
    } catch(e) {
      console.error('Erro ao carregar:', e)
    }

    setLoading(false)
  }

  async function salvarResposta(tarefaId, valor) {
    const novasRespostas = { ...respostas, [tarefaId]: valor }
    setRespostas(novasRespostas)

    try {
      if (!checklistId) {
        const ref = await addDoc(collection(db, 'restaurants', user.uid, 'checklists'), {
          data: hoje,
          turno: turnoAtivo,
          respostas: novasRespostas,
          concluido: false,
          criadoEm: serverTimestamp()
        })
        setChecklistId(ref.id)
      } else {
        await updateDoc(doc(db, 'restaurants', user.uid, 'checklists', checklistId), {
          respostas: novasRespostas
        })
      }
    } catch(e) {
      console.error('Erro ao salvar:', e)
    }
  }

  async function concluirChecklist() {
    if (!checklistId) return
    setSalvando(true)
    await updateDoc(doc(db, 'restaurants', user.uid, 'checklists', checklistId), {
      concluido: true,
      concluidoEm: serverTimestamp()
    })
    setConcluido(true)
    setSalvando(false)
  }

  const totalRespondidas = Object.keys(respostas).length
  const totalTarefas = tarefas.length
  const todasRespondidas = totalTarefas > 0 && totalRespondidas === totalTarefas
  const progresso = totalTarefas > 0 ? Math.round((totalRespondidas / totalTarefas) * 100) : 0

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p style={{ color: '#64748b' }}>Carregando...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: '80px' }}>
      <div style={{ backgroundColor: '#2563eb', color: 'white', padding: '20px 24px' }}>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700' }}>Gestop</h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', opacity: 0.85 }}>
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '8px', padding: '16px 24px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0' }}>
        {TURNOS.map(t => (
          <button key={t} onClick={() => setTurnoAtivo(t)} style={{
            padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
            fontSize: '13px', fontWeight: '600',
            backgroundColor: turnoAtivo === t ? '#2563eb' : '#f1f5f9',
            color: turnoAtivo === t ? 'white' : '#64748b'
          }}>{t}</button>
        ))}
      </div>

      <div style={{ padding: '20px 24px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>Progresso do turno</span>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#2563eb' }}>{totalRespondidas}/{totalTarefas}</span>
          </div>
          <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: progresso + '%', backgroundColor: progresso === 100 ? '#16a34a' : '#2563eb', borderRadius: '4px', transition: 'width 0.3s' }} />
          </div>
        </div>

        {concluido && (
          <div style={{ backgroundColor: '#dcfce7', border: '1px solid #86efac', borderRadius: '12px', padding: '16px', marginBottom: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px' }}>✅</div>
            <p style={{ margin: '8px 0 0 0', fontWeight: '700', color: '#16a34a' }}>Turno concluído!</p>
          </div>
        )}

        {tarefas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
            <p style={{ fontSize: '32px' }}>📋</p>
            <p>Nenhuma tarefa para {turnoAtivo}.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {tarefas.map(tarefa => {
              const resp = respostas[tarefa.id]
              return (
                <div key={tarefa.id} style={{
                  backgroundColor: 'white', borderRadius: '12px', padding: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  borderLeft: resp === 'sim' ? '4px solid #16a34a' : resp === 'nao' ? '4px solid #dc2626' : '4px solid #e2e8f0'
                }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#1e293b', fontWeight: '500' }}>{tarefa.texto}</p>
                  {tarefa.setorNome && (
                    <span style={{ fontSize: '11px', color: '#94a3b8', backgroundColor: '#f8fafc', padding: '2px 8px', borderRadius: '10px' }}>
                      {tarefa.setorNome}
                    </span>
                  )}
                  {!concluido && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <button onClick={() => salvarResposta(tarefa.id, 'sim')} style={{
                        flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                        fontSize: '14px', fontWeight: '700',
                        backgroundColor: resp === 'sim' ? '#16a34a' : '#f0fdf4',
                        color: resp === 'sim' ? 'white' : '#16a34a'
                      }}>✓ Sim</button>
                      <button onClick={() => salvarResposta(tarefa.id, 'nao')} style={{
                        flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                        fontSize: '14px', fontWeight: '700',
                        backgroundColor: resp === 'nao' ? '#dc2626' : '#fef2f2',
                        color: resp === 'nao' ? 'white' : '#dc2626'
                      }}>✗ Não</button>
                    </div>
                  )}
                  {concluido && resp && (
                    <p style={{ marginTop: '8px', fontWeight: '700', color: resp === 'sim' ? '#16a34a' : '#dc2626' }}>
                      {resp === 'sim' ? '✓ Sim' : '✗ Não'}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {!concluido && todasRespondidas && (
          <button onClick={concluirChecklist} disabled={salvando} style={{
            width: '100%', padding: '16px', marginTop: '24px',
            backgroundColor: '#16a34a', color: 'white',
            border: 'none', borderRadius: '12px',
            fontSize: '16px', fontWeight: '700', cursor: 'pointer'
          }}>
            {salvando ? 'Salvando...' : '✅ Concluir Turno'}
          </button>
        )}
      </div>
    </div>
  )
}
