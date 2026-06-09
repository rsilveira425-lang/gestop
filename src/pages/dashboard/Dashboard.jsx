
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { db, auth } from '../../services/firebase'
import { signOut } from 'firebase/auth'
import {
  collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp
} from 'firebase/firestore'
import Historico from '../historico/Historico'

const TURNOS = ['Abertura', 'Pré pico', 'Fechamento']

export default function Dashboard() {
  const { user } = useAuth()
  const [turnoAtivo, setTurnoAtivo] = useState('Abertura')
  const [tarefas, setTarefas] = useState([])
  const [respostas, setRespostas] = useState({})
  const [comentarios, setComentarios] = useState({})
  const [fotos, setFotos] = useState({})
  const [checklistId, setChecklistId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [concluido, setConcluido] = useState(false)
  const [verHistorico, setVerHistorico] = useState(false)
  const fileRefs = useRef({})

  const hoje = new Date().toISOString().split('T')[0]

  useEffect(() => { carregarDados() }, [turnoAtivo])

  async function carregarDados() {
    setLoading(true)
    setConcluido(false)
    setRespostas({})
    setComentarios({})
    setFotos({})
    setChecklistId(null)
    try {
      const tarefasRef = collection(db, 'restaurants', user.uid, 'tarefas')
      const qTarefas = query(tarefasRef, where('turno', '==', turnoAtivo))
      const snapTarefas = await getDocs(qTarefas)
      setTarefas(snapTarefas.docs.map(d => ({ id: d.id, ...d.data() })))

      const checkRef = collection(db, 'restaurants', user.uid, 'checklists')
      const qCheck = query(checkRef, where('data', '==', hoje), where('turno', '==', turnoAtivo))
      const snapCheck = await getDocs(qCheck)
      if (!snapCheck.empty) {
        const cl = snapCheck.docs[0]
        const data = cl.data()
        setChecklistId(cl.id)
        setRespostas(data.respostas || {})
        setComentarios(data.comentarios || {})
        setFotos(data.fotos || {})
        setConcluido(data.concluido || false)
      }
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  async function salvarResposta(tarefaId, valor) {
    const novasRespostas = { ...respostas, [tarefaId]: valor }
    setRespostas(novasRespostas)
    await persistir(novasRespostas, comentarios, fotos)
  }

  async function salvarComentario(tarefaId, texto) {
    const novosComentarios = { ...comentarios, [tarefaId]: texto }
    setComentarios(novosComentarios)
    await persistir(respostas, novosComentarios, fotos)
  }

  async function handleFoto(tarefaId, file) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = await comprimirImagem(e.target.result)
      const novasFotos = { ...fotos, [tarefaId]: base64 }
      setFotos(novasFotos)
      await persistir(respostas, comentarios, novasFotos)
    }
    reader.readAsDataURL(file)
  }

  function comprimirImagem(base64) {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxW = 800
        const ratio = Math.min(maxW / img.width, 1)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.6))
      }
      img.src = base64
    })
  }

  async function persistir(resp, coment, fts) {
    try {
      if (!checklistId) {
        const ref = await addDoc(collection(db, 'restaurants', user.uid, 'checklists'), {
          data: hoje, turno: turnoAtivo, respostas: resp,
          comentarios: coment, fotos: fts,
          concluido: false, criadoEm: serverTimestamp()
        })
        setChecklistId(ref.id)
      } else {
        await updateDoc(doc(db, 'restaurants', user.uid, 'checklists', checklistId), {
          respostas: resp, comentarios: coment, fotos: fts
        })
      }
    } catch(e) { console.error(e) }
  }

  async function concluirChecklist() {
    if (!checklistId) return
    setSalvando(true)
    await updateDoc(doc(db, 'restaurants', user.uid, 'checklists', checklistId), {
      concluido: true, concluidoEm: serverTimestamp()
    })
    setConcluido(true)
    setSalvando(false)
  }

  if (verHistorico) return <Historico onVoltar={() => setVerHistorico(false)} />

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
      <div style={{ backgroundColor: '#2563eb', color: 'white', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700' }}>Gestop</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', opacity: 0.85 }}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setVerHistorico(true)} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>
            📋 Histórico
          </button>
          <button onClick={() => signOut(auth)} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '13px', cursor: 'pointer' }}>
            Sair
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', padding: '16px 24px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', overflowX: 'auto' }}>
        {TURNOS.map(t => (
          <button key={t} onClick={() => setTurnoAtivo(t)} style={{
            padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
            fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap',
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
              const coment = comentarios[tarefa.id] || ''
              const foto = fotos[tarefa.id]
              return (
                <div key={tarefa.id} style={{
                  backgroundColor: 'white', borderRadius: '12px', padding: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  borderLeft: resp === 'sim' ? '4px solid #16a34a' : resp === 'nao' ? '4px solid #dc2626' : '4px solid #e2e8f0'
                }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#1e293b', fontWeight: '500' }}>{tarefa.texto}</p>
                  {tarefa.setorNome && <span style={{ fontSize: '11px', color: '#94a3b8', backgroundColor: '#f8fafc', padding: '2px 8px', borderRadius: '10px' }}>{tarefa.setorNome}</span>}

                  {!concluido && (
                    <>
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

                      <textarea
                        placeholder="Comentário (opcional)..."
                        value={coment}
                        onChange={e => salvarComentario(tarefa.id, e.target.value)}
                        style={{
                          width: '100%', marginTop: '10px', padding: '8px 10px',
                          borderRadius: '8px', border: '1px solid #e2e8f0',
                          fontSize: '13px', color: '#1e293b', resize: 'none',
                          fontFamily: 'inherit', boxSizing: 'border-box', height: '60px'
                        }}
                      />

                      <div style={{ marginTop: '8px' }}>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          style={{ display: 'none' }}
                          ref={el => fileRefs.current[tarefa.id] = el}
                          onChange={e => handleFoto(tarefa.id, e.target.files[0])}
                        />
                        <button
                          onClick={() => fileRefs.current[tarefa.id]?.click()}
                          style={{
                            padding: '8px 14px', borderRadius: '8px', border: '1px solid #e2e8f0',
                            backgroundColor: '#f8fafc', fontSize: '13px', cursor: 'pointer', color: '#475569'
                          }}
                        >📷 {foto ? 'Trocar foto' : 'Tirar foto'}</button>
                        {foto && <span style={{ marginLeft: '8px', fontSize: '12px', color: '#16a34a' }}>✓ Foto salva</span>}
                      </div>

                      {foto && <img src={foto} alt="foto" style={{ marginTop: '8px', width: '100%', borderRadius: '8px', maxHeight: '200px', objectFit: 'cover' }} />}
                    </>
                  )}

                  {concluido && (
                    <div style={{ marginTop: '8px' }}>
                      {resp && <p style={{ margin: 0, fontWeight: '700', color: resp === 'sim' ? '#16a34a' : '#dc2626' }}>{resp === 'sim' ? '✓ Sim' : '✗ Não'}</p>}
                      {coment && <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>💬 {coment}</p>}
                      {foto && <img src={foto} alt="foto" style={{ marginTop: '8px', width: '100%', borderRadius: '8px', maxHeight: '200px', objectFit: 'cover' }} />}
                    </div>
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
