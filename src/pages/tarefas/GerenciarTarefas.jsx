import { useState, useEffect } from 'react'
import { db } from '../../services/firebase'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, writeBatch } from 'firebase/firestore'
import { DndContext, PointerSensor, TouchSensor, KeyboardSensor, useSensor, useSensors, closestCenter, DragOverlay } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { DEFAULT_TURNOS } from '../../config/turnos'
import { ordenarTarefas, proximaOrdem, calcularBackfill, tarefasDoGrupo, aplicarNovaOrdem, moverTarefa, chaveGrupo } from '../../config/tarefas'

// Largura a partir da qual cabem colunas lado a lado. Abaixo disso o kanban
// vira lista, porque coluna estreita no celular erra o alvo do dedo.
const LARGURA_KANBAN = 900

function useKanban() {
  const [amplo, setAmplo] = useState(() => typeof window !== 'undefined' && window.innerWidth >= LARGURA_KANBAN)
  useEffect(() => {
    const aoRedimensionar = () => setAmplo(window.innerWidth >= LARGURA_KANBAN)
    window.addEventListener('resize', aoRedimensionar)
    return () => window.removeEventListener('resize', aoRedimensionar)
  }, [])
  return amplo
}

const idColuna = (setor, turno) => `col::${setor}::${turno}`
const ehColuna = id => typeof id === 'string' && id.startsWith('col::')
const leColuna = id => { const [, setor, turno] = id.split('::'); return { setor, turno } }

// Uma tarefa arrastável. O arrastar só começa pela alça — assim rolar a
// página continua funcionando normalmente no celular.
function TarefaArrastavel({ tarefa, children, alcaEstilo }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tarefa.id })
  return (
    <div ref={setNodeRef} style={{
      transform: CSS.Transform.toString(transform), transition,
      opacity: isDragging ? 0.4 : 1,
      display:'flex', alignItems:'center', gap:'8px',
      backgroundColor:'white', borderBottom:'1px solid #f1f5f9'
    }}>
      <button {...attributes} {...listeners} aria-label={`Arrastar ${tarefa.texto}`} style={{
        cursor:'grab', touchAction:'none', border:'none', background:'none',
        color:'#cbd5e1', fontSize:'16px', padding:'12px 4px 12px 12px', lineHeight:1, ...alcaEstilo
      }}>⠿</button>
      {children}
    </div>
  )
}

function Coluna({ setor, turno, children, vazia }) {
  const { setNodeRef, isOver } = useDroppable({ id: idColuna(setor, turno) })
  return (
    <div ref={setNodeRef} style={{
      backgroundColor: isOver ? '#eff6ff' : 'white', borderRadius:'12px',
      boxShadow:'0 1px 3px rgba(0,0,0,0.08)', overflow:'hidden',
      border: isOver ? '2px dashed #93c5fd' : '2px solid transparent', minHeight:'80px'
    }}>
      {children}
      {vazia && <p style={{ margin:0, padding:'20px', textAlign:'center', color:'#cbd5e1', fontSize:'13px' }}>Solte uma tarefa aqui</p>}
    </div>
  )
}

export default function GerenciarTarefas({ restaurantId, turnos = DEFAULT_TURNOS, onTurnosAtualizados = () => {}, onVoltar }) {
  const TURNOS = turnos.map(t => t.nome)
  const kanban = useKanban()
  const [setores, setSetores] = useState([])
  const [tarefas, setTarefas] = useState([])
  const [setorAtivo, setSetorAtivo] = useState(null)
  const [turnoAtivo, setTurnoAtivo] = useState(TURNOS[0] || '')
  const [loading, setLoading] = useState(true)
  const [adicionando, setAdicionando] = useState(null)
  const [novoTexto, setNovoTexto] = useState('')
  const [editando, setEditando] = useState(null)
  const [saving, setSaving] = useState(false)
  const [verSetores, setVerSetores] = useState(false)
  const [novoSetor, setNovoSetor] = useState('')
  const [verTurnos, setVerTurnos] = useState(false)
  const [turnosEdit, setTurnosEdit] = useState(null)
  const [arrastando, setArrastando] = useState(null)
  const [movendo, setMovendo] = useState(null)

  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => { carregar() }, [])

  // Nomes de setor vindos do cadastro e também das tarefas, para nenhuma
  // tarefa ficar invisível se o setor dela tiver sido removido do cadastro.
  const nomesSetores = (() => {
    const vistos = new Map()
    for (const s of setores) vistos.set(s.nome.trim().toLowerCase(), s.nome)
    for (const t of tarefas) {
      const n = (t.setorNome || '').trim()
      if (n && !vistos.has(n.toLowerCase())) vistos.set(n.toLowerCase(), n)
    }
    return [...vistos.values()]
  })()

  async function carregar() {
    setLoading(true)
    const [sSnap, tSnap] = await Promise.all([
      getDocs(collection(db, 'restaurants', restaurantId, 'setores')),
      getDocs(collection(db, 'restaurants', restaurantId, 'tarefas'))
    ])
    const s = sSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    let t = tSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    // Tarefas criadas antes da ordenação existir não têm `ordem`. Esta tela é
    // do dono (único papel com permissão de escrita), então é aqui que elas
    // ganham número — sem isso o arrastar não teria em que se apoiar.
    const pendentes = calcularBackfill(t)
    if (pendentes.length > 0) {
      try {
        await Promise.all(pendentes.map(p =>
          updateDoc(doc(db, 'restaurants', restaurantId, 'tarefas', p.id), { ordem: p.ordem })
        ))
        const mapa = Object.fromEntries(pendentes.map(p => [p.id, p.ordem]))
        t = t.map(tarefa => (mapa[tarefa.id] !== undefined ? { ...tarefa, ordem: mapa[tarefa.id] } : tarefa))
      } catch(e) { console.error(e) }
    }
    setSetores(s)
    setTarefas(ordenarTarefas(t))
    if (s.length > 0) setSetorAtivo(prev => prev || s[0].nome)
    setLoading(false)
  }

  // Grava a nova ordem numa escrita só. Atualiza a tela antes de confirmar e
  // desfaz se o Firestore recusar — arrastar precisa responder na hora.
  async function persistirMudancas(mudancas) {
    if (mudancas.length === 0) return
    const anterior = tarefas
    const mapa = Object.fromEntries(mudancas.map(m => [m.id, m]))
    setTarefas(ordenarTarefas(tarefas.map(t => (mapa[t.id] ? { ...t, ...mapa[t.id] } : t))))
    try {
      const lote = writeBatch(db)
      for (const { id, ...campos } of mudancas) {
        lote.update(doc(db, 'restaurants', restaurantId, 'tarefas', id), campos)
      }
      await lote.commit()
    } catch(e) {
      console.error(e)
      setTarefas(anterior)
      alert('Não foi possível salvar a nova ordem: ' + e.message)
    }
  }

  function aoSoltar({ active, over }) {
    setArrastando(null)
    if (!over || active.id === over.id) return
    const ativa = tarefas.find(t => t.id === active.id)
    if (!ativa) return

    const destino = ehColuna(over.id)
      ? { ...leColuna(over.id), sobreTarefa: null }
      : (() => {
          const alvo = tarefas.find(t => t.id === over.id)
          return alvo ? { setor: alvo.setorNome, turno: alvo.turno, sobreTarefa: alvo.id } : null
        })()
    if (!destino) return

    const mesmoGrupo = chaveGrupo(ativa.setorNome, ativa.turno) === chaveGrupo(destino.setor, destino.turno)
    let mudancas
    if (mesmoGrupo) {
      const ids = tarefasDoGrupo(tarefas, destino.setor, destino.turno).map(t => t.id)
      const de = ids.indexOf(active.id)
      const para = destino.sobreTarefa ? ids.indexOf(destino.sobreTarefa) : ids.length - 1
      if (de === -1 || para === -1 || de === para) return
      mudancas = aplicarNovaOrdem(tarefas, { setor: destino.setor, turno: destino.turno, ids: arrayMove(ids, de, para) })
    } else {
      const lista = tarefasDoGrupo(tarefas, destino.setor, destino.turno)
      const pos = destino.sobreTarefa ? lista.findIndex(t => t.id === destino.sobreTarefa) : null
      mudancas = moverTarefa(tarefas, {
        tarefaId: active.id, paraSetor: destino.setor, paraTurno: destino.turno,
        posicao: pos === -1 ? null : pos
      })
    }
    persistirMudancas(mudancas)
  }

  async function moverParaSetor(tarefaId, setorDestino) {
    setMovendo(null)
    await persistirMudancas(moverTarefa(tarefas, { tarefaId, paraSetor: setorDestino }))
  }

  async function adicionarTarefa() {
    if (!novoTexto.trim() || !adicionando) return
    setSaving(true)
    const ctx = { ...adicionando }
    await addDoc(collection(db, 'restaurants', restaurantId, 'tarefas'), {
      texto: novoTexto.trim(),
      setorNome: ctx.setor,
      turno: ctx.turno,
      ordem: proximaOrdem(tarefas, ctx.setor, ctx.turno),
      criadoEm: new Date().toISOString()
    })
    setNovoTexto('')
    await carregar()
    setAdicionando(ctx)
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
    tabs: { display:'flex', flexWrap:'wrap', gap:'0', backgroundColor:'white', borderBottom:'2px solid #e2e8f0', padding:'0 12px' },
    tab: (ativo) => ({ padding:'12px 18px', border:'none', background:'none', fontSize:'15px', fontWeight:'600', cursor:'pointer', whiteSpace:'nowrap', color: ativo ? '#2563eb' : '#64748b', borderBottom: ativo ? '2px solid #2563eb' : '2px solid transparent', marginBottom:'-2px' }),
    body: { padding:'20px 24px', maxWidth: kanban ? '1400px' : '700px', margin:'0 auto' },
    turnoCard: { backgroundColor:'white', borderRadius:'12px', marginBottom:'16px', boxShadow:'0 1px 3px rgba(0,0,0,0.08)', overflow:'hidden' },
    turnoHeader: { padding:'14px 20px', backgroundColor:'#f8fafc', borderBottom:'1px solid #e2e8f0', fontSize:'14px', fontWeight:'700', color:'#475569' },
    tarefaTexto: { fontSize:'14px', color:'#1e293b', flex:1, padding:'12px 0' },
    btnEdit: { padding:'4px 10px', backgroundColor:'#f1f5f9', border:'none', borderRadius:'6px', fontSize:'12px', cursor:'pointer', marginRight:'6px', color:'#475569' },
    btnMover: { padding:'4px 10px', backgroundColor:'#eff6ff', border:'none', borderRadius:'6px', fontSize:'12px', cursor:'pointer', marginRight:'6px', color:'#2563eb' },
    btnDel: { padding:'4px 10px', backgroundColor:'#fef2f2', border:'none', borderRadius:'6px', fontSize:'12px', cursor:'pointer', color:'#dc2626', marginRight:'12px' },
    addRow: { padding:'12px 20px', display:'flex', gap:'8px', alignItems:'center' },
    addInput: { flex:1, padding:'8px 12px', border:'1px solid #e2e8f0', borderRadius:'8px', fontSize:'16px', outline:'none' },
    btnConfirm: { padding:'8px 14px', backgroundColor:'#2563eb', color:'white', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:'600', cursor:'pointer' },
    btnCancel: { padding:'8px 12px', backgroundColor:'#f1f5f9', border:'none', borderRadius:'8px', fontSize:'13px', cursor:'pointer' },
    btnAdd: { width:'100%', padding:'10px', backgroundColor:'#f8fafc', border:'1px dashed #cbd5e1', borderRadius:'0', fontSize:'13px', color:'#64748b', cursor:'pointer', textAlign:'left' },
    editBox: { padding:'12px 20px', backgroundColor:'#eff6ff', borderBottom:'1px solid #bfdbfe', display:'flex', gap:'8px', alignItems:'center' },
    dica: { margin:'0 0 14px', fontSize:'13px', color:'#64748b', backgroundColor:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:'8px', padding:'10px 14px' },
  }

  async function adicionarSetor() {
    if (!novoSetor.trim()) return
    setSaving(true)
    await addDoc(collection(db, 'restaurants', restaurantId, 'setores'), { nome: novoSetor.trim() })
    setNovoSetor('')
    await carregar()
    setSaving(false)
  }

  async function salvarTurnos() {
    const limpos = turnosEdit
      .map(t => ({ _orig: t._orig, nome: String(t.nome || '').trim(), horaLimite: Math.min(23, Math.max(0, parseInt(t.horaLimite, 10) || 0)) }))
      .filter(t => t.nome)
    if (limpos.length === 0) { alert('Cadastre pelo menos um turno.'); return }
    const nomes = limpos.map(t => t.nome.toLowerCase())
    if (new Set(nomes).size !== nomes.length) { alert('Os nomes dos turnos precisam ser diferentes entre si.'); return }

    // Turnos removidos não podem ter tarefas
    const origsRestantes = limpos.map(t => t._orig).filter(Boolean)
    for (const t of turnos) {
      if (!origsRestantes.includes(t.nome) && tarefas.some(tf => tf.turno === t.nome)) {
        alert(`O turno "${t.nome}" tem tarefas. Mova ou exclua as tarefas antes de removê-lo.`)
        return
      }
    }

    setSaving(true)
    try {
      // Renomeações: propagar o novo nome para as tarefas existentes
      for (const t of limpos) {
        if (t._orig && t._orig !== t.nome) {
          const snap = await getDocs(query(collection(db, 'restaurants', restaurantId, 'tarefas'), where('turno', '==', t._orig)))
          for (const d of snap.docs) {
            await updateDoc(doc(db, 'restaurants', restaurantId, 'tarefas', d.id), { turno: t.nome })
          }
        }
      }
      const finais = limpos.map(({ nome, horaLimite }) => ({ nome, horaLimite }))
      await updateDoc(doc(db, 'restaurants', restaurantId), { turnos: finais })
      onTurnosAtualizados(finais)
      setVerTurnos(false)
      setTurnosEdit(null)
      await carregar()
    } catch(e) { alert('Erro: ' + e.message) }
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

  // Linha de tarefa: o miolo é igual nos dois layouts
  const linhaTarefa = (tarefa, setorDaLinha) => (
    editando?.id === tarefa.id ? (
      <div key={tarefa.id} style={s.editBox}>
        <input style={s.addInput} value={editando.texto} onChange={e => setEditando({...editando, texto: e.target.value})} autoFocus />
        <button style={s.btnConfirm} onClick={salvarEdicao} disabled={saving}>Salvar</button>
        <button style={s.btnCancel} onClick={() => setEditando(null)}>{String.fromCharCode(215)}</button>
      </div>
    ) : (
      <TarefaArrastavel key={tarefa.id} tarefa={tarefa}>
        <span style={s.tarefaTexto}>{tarefa.texto}</span>
        <button style={s.btnEdit} onClick={() => setEditando({...tarefa})}>editar</button>
        {!kanban && nomesSetores.length > 1 && (
          <button style={s.btnMover} onClick={() => setMovendo({ id: tarefa.id, setor: setorDaLinha })}>mover</button>
        )}
        <button style={s.btnDel} onClick={() => excluir(tarefa.id)}>excluir</button>
      </TarefaArrastavel>
    )
  )

  const blocoAdicionar = (setor, turno) => {
    const esteAdicionando = adicionando?.setor === setor && adicionando?.turno === turno
    return esteAdicionando ? (
      <div style={s.addRow}>
        <input style={s.addInput} placeholder="Nome da tarefa..." value={novoTexto} onChange={e => setNovoTexto(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') adicionarTarefa() }} autoFocus />
        <button style={s.btnConfirm} onClick={adicionarTarefa} disabled={saving}>Salvar</button>
        <button style={s.btnCancel} onClick={() => { setAdicionando(null); setNovoTexto('') }}>{String.fromCharCode(215)}</button>
      </div>
    ) : (
      <button style={s.btnAdd} onClick={() => { setAdicionando({ setor, turno }); setNovoTexto('') }}>
        + Adicionar Tarefa
      </button>
    )
  }

  const tarefaArrastada = arrastando ? tarefas.find(t => t.id === arrastando) : null

  return (
    <div style={s.screen}>
      <div style={s.header}>
        <button style={s.back} onClick={onVoltar}>{String.fromCharCode(8592)}</button>
        <h1 style={{ margin:0, fontSize:'20px', fontWeight:'700' }}>Gerenciar Tarefas</h1>
          <button onClick={() => setVerSetores(p => !p)} style={{ marginLeft:'auto', padding:'6px 12px', backgroundColor: verSetores ? '#2563eb' : '#f1f5f9', color: verSetores ? 'white' : '#475569', border:'none', borderRadius:'8px', fontSize:'12px', cursor:'pointer', fontWeight:'600' }}>Setores</button>
          <button onClick={() => { setVerTurnos(p => !p); setTurnosEdit(turnos.map(t => ({ ...t, _orig: t.nome }))) }} style={{ padding:'6px 12px', backgroundColor: verTurnos ? '#2563eb' : '#f1f5f9', color: verTurnos ? 'white' : '#475569', border:'none', borderRadius:'8px', fontSize:'12px', cursor:'pointer', fontWeight:'600' }}>Turnos</button>
      </div>

      {verTurnos && turnosEdit && (
        <div style={{ padding:'16px 20px', backgroundColor:'#f8fafc', borderBottom:'1px solid #e2e8f0', marginBottom:'8px' }}>
          <p style={{ margin:'0 0 4px', fontWeight:'600', fontSize:'14px', color:'#1e293b' }}>Turnos do restaurante</p>
          <p style={{ margin:'0 0 12px', fontSize:'12px', color:'#94a3b8' }}>Hora limite = horário em que o turno deve estar concluído (gera alerta).</p>
          {turnosEdit.map((t, i) => (
            <div key={i} style={{ display:'flex', gap:'8px', alignItems:'center', marginBottom:'8px' }}>
              <input value={t.nome} onChange={e => setTurnosEdit(prev => prev.map((x, j) => j === i ? { ...x, nome: e.target.value } : x))}
                placeholder="Nome do turno" style={{ flex:1, padding:'8px 12px', border:'1px solid #e2e8f0', borderRadius:'8px', fontSize:'16px', outline:'none', minWidth:0 }} />
              <input type="number" min={0} max={23} value={t.horaLimite} onChange={e => setTurnosEdit(prev => prev.map((x, j) => j === i ? { ...x, horaLimite: e.target.value } : x))}
                style={{ width:'60px', padding:'8px', border:'1px solid #e2e8f0', borderRadius:'8px', fontSize:'16px', outline:'none', textAlign:'center' }} />
              <span style={{ fontSize:'12px', color:'#94a3b8' }}>h</span>
              <button onClick={() => setTurnosEdit(prev => prev.filter((_, j) => j !== i))} style={{ padding:'6px 10px', backgroundColor:'#fef2f2', border:'none', borderRadius:'6px', color:'#dc2626', fontSize:'12px', cursor:'pointer' }}>remover</button>
            </div>
          ))}
          <div style={{ display:'flex', gap:'8px', marginTop:'12px' }}>
            <button onClick={() => setTurnosEdit(prev => [...prev, { nome:'', horaLimite: 12, _orig: null }])} style={{ padding:'8px 14px', backgroundColor:'#f1f5f9', border:'1px dashed #cbd5e1', borderRadius:'8px', fontSize:'13px', color:'#475569', cursor:'pointer' }}>+ Turno</button>
            <button onClick={salvarTurnos} disabled={saving} style={{ marginLeft:'auto', padding:'8px 14px', backgroundColor:'#2563eb', color:'white', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:'600', cursor:'pointer' }}>{saving ? 'Salvando...' : 'Salvar turnos'}</button>
          </div>
        </div>
      )}

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

      {/* Celular: abas por setor. Computador: abas por turno, com um setor por coluna. */}
      <div style={s.tabs}>
        {kanban
          ? TURNOS.map(turno => (
              <button key={turno} style={s.tab(turnoAtivo === turno)} onClick={() => setTurnoAtivo(turno)}>{turno}</button>
            ))
          : setores.map(setor => (
              <button key={setor.id} style={s.tab(setorAtivo === setor.nome)} onClick={() => setSetorAtivo(setor.nome)}>{setor.nome}</button>
            ))}
      </div>

      <DndContext sensors={sensores} collisionDetection={closestCenter}
        onDragStart={({ active }) => setArrastando(active.id)}
        onDragCancel={() => setArrastando(null)}
        onDragEnd={aoSoltar}>

        <div style={s.body}>
          <p style={s.dica}>
            {kanban
              ? 'Segure o ⠿ para arrastar uma tarefa — para cima ou para baixo dentro da coluna, ou de uma coluna para outra para trocar de setor.'
              : 'Segure o ⠿ para arrastar a tarefa e mudar a ordem. Use "mover" para trocar a tarefa de setor.'}
          </p>

          {kanban ? (
            <div style={{ display:'grid', gridTemplateColumns:`repeat(${Math.max(1, nomesSetores.length)}, minmax(260px, 1fr))`, gap:'16px', alignItems:'start' }}>
              {nomesSetores.map(setor => {
                const lista = tarefasDoGrupo(tarefas, setor, turnoAtivo)
                return (
                  <Coluna key={setor} setor={setor} turno={turnoAtivo} vazia={lista.length === 0}>
                    <div style={s.turnoHeader}>{setor} <span style={{ fontWeight:400, color:'#94a3b8' }}>({lista.length})</span></div>
                    <SortableContext items={lista.map(t => t.id)} strategy={verticalListSortingStrategy}>
                      {lista.map(tarefa => linhaTarefa(tarefa, setor))}
                    </SortableContext>
                    {blocoAdicionar(setor, turnoAtivo)}
                  </Coluna>
                )
              })}
            </div>
          ) : (
            TURNOS.map(turno => {
              const lista = tarefasDoGrupo(tarefas, setorAtivo, turno)
              return (
                <div key={turno} style={s.turnoCard}>
                  <div style={s.turnoHeader}>{turno} <span style={{ fontWeight:400, color:'#94a3b8' }}>({lista.length})</span></div>
                  <SortableContext items={lista.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {lista.map(tarefa => linhaTarefa(tarefa, setorAtivo))}
                  </SortableContext>
                  {blocoAdicionar(setorAtivo, turno)}
                </div>
              )
            })
          )}
        </div>

        <DragOverlay>
          {tarefaArrastada && (
            <div style={{ backgroundColor:'white', borderRadius:'8px', padding:'12px 16px', boxShadow:'0 8px 24px rgba(0,0,0,0.18)', fontSize:'14px', color:'#1e293b', border:'2px solid #2563eb' }}>
              {tarefaArrastada.texto}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Celular: escolher o setor de destino sem precisar arrastar entre colunas */}
      {movendo && (
        <div onClick={() => setMovendo(null)} style={{ position:'fixed', inset:0, backgroundColor:'rgba(15,23,42,0.45)', display:'flex', alignItems:'flex-end', zIndex:50 }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor:'white', width:'100%', borderRadius:'16px 16px 0 0', padding:'20px' }}>
            <p style={{ margin:'0 0 14px', fontWeight:'700', fontSize:'15px', color:'#1e293b' }}>Mover para qual setor?</p>
            {nomesSetores.filter(n => n.trim().toLowerCase() !== (movendo.setor || '').trim().toLowerCase()).map(nome => (
              <button key={nome} onClick={() => moverParaSetor(movendo.id, nome)} style={{ display:'block', width:'100%', textAlign:'left', padding:'14px', marginBottom:'8px', backgroundColor:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'10px', fontSize:'15px', color:'#1e293b', cursor:'pointer' }}>
                {nome}
              </button>
            ))}
            <button onClick={() => setMovendo(null)} style={{ width:'100%', padding:'14px', marginTop:'4px', backgroundColor:'#f1f5f9', border:'none', borderRadius:'10px', fontSize:'15px', color:'#475569', cursor:'pointer' }}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  )
}
