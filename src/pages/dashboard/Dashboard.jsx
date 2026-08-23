import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { db, auth } from '../../services/firebase'
import { signOut, sendEmailVerification } from 'firebase/auth'
import { collection, query, where, getDocs, addDoc, updateDoc, setDoc, doc, serverTimestamp } from 'firebase/firestore'
import GestorView from '../gestor/GestorView'
import GerenciarTarefas from '../tarefas/GerenciarTarefas'
import Equipe from '../equipe/Equipe'
import { DEFAULT_TURNOS } from '../../config/turnos'
import { ordenarTarefas } from '../../config/tarefas'
import { pushDisponivel, permissaoAtual, ativarNotificacoes, jaAtivouNesteAparelho, ehIOS, instaladoNaTelaInicial, registrarServiceWorker } from '../../services/push'

export default function Dashboard({ restaurantId, userRole, userName, codigoAcesso, turnos = DEFAULT_TURNOS, diasTrial = null, onRestaurantUpdate = () => {} }) {
  const { user } = useAuth()
  const TURNOS = turnos.map(t => t.nome)
  const HORARIO_LIMITE = Object.fromEntries(turnos.map(t => [t.nome, t.horaLimite]))
  const localDate = (d=new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  const [turnoAtivo, setTurnoAtivo] = useState(TURNOS[0] || 'Abertura')
  const [tarefas, setTarefas] = useState([])
  const [respostas, setRespostas] = useState({})
  const [comentarios, setComentarios] = useState({})
  const [fotos, setFotos] = useState({})
  const [checklistId, setChecklistId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [concluido, setConcluido] = useState(false)
  const [setoresConcluidos, setSetoresConcluidos] = useState({})
  const [celebrar, setCelebrar] = useState(null) // { titulo, sub } ou null
  const [ultimaResp, setUltimaResp] = useState(null)
  const [alertas, setAlertas] = useState([])
  const [verGestor, setVerGestor] = useState(false)
  const [verTarefas, setVerTarefas] = useState(false)
  const [verEquipe, setVerEquipe] = useState(false)
  const [fotoAmpliada, setFotoAmpliada] = useState(null)
  const [setorAtivo, setSetorAtivo] = useState(null)
  const [emailReenviado, setEmailReenviado] = useState(false)
  const [avisoPush, setAvisoPush] = useState({ mostrar: false, estado: 'convite' })
  const fileRefs = useRef({})
  const checklistIdRef = useRef(null)
  const criandoChecklistRef = useRef(null)
  const hoje = localDate()

  // Confete sóbrio ao concluir o turno
  useEffect(() => {
    if (!celebrar) return
    const cores = ['#2563eb', '#16a34a', '#f59e0b', '#ffffff', '#60a5fa']
    const nodes = []
    for (let i = 0; i < 40; i++) {
      const c = document.createElement('div')
      c.style.cssText = `position:fixed;top:-12px;left:${Math.random()*100}%;width:8px;height:13px;border-radius:2px;z-index:2001;pointer-events:none;background:${cores[i%cores.length]}`
      document.body.appendChild(c); nodes.push(c)
      const x = (Math.random()*2-1)*140, rot = Math.random()*720
      c.animate(
        [{ transform:'translate(0,0) rotate(0)', opacity:1 }, { transform:`translate(${x}px,${window.innerHeight+60}px) rotate(${rot}deg)`, opacity:0.85 }],
        { duration: 1800 + Math.random()*900, delay: Math.random()*300, easing:'cubic-bezier(.2,.6,.4,1)' }
      )
    }
    const t = setTimeout(() => nodes.forEach(n => n.remove()), 3600)
    return () => { clearTimeout(t); nodes.forEach(n => n.remove()) }
  }, [celebrar])

  // Registra o service worker sempre (é ele que faz o app abrir sem internet)
  // e só oferece os lembretes a quem ainda não ativou neste aparelho.
  async function registrarPush() {
    registrarServiceWorker().catch(e => console.error(e))
    if (!(await pushDisponivel())) return
    if (jaAtivouNesteAparelho() || permissaoAtual() === 'denied') return
    if (ehIOS() && !instaladoNaTelaInicial()) { setAvisoPush({ mostrar: true, estado: 'ios' }); return }
    setAvisoPush({ mostrar: true, estado: 'convite' })
  }

  async function ligarLembretes() {
    setAvisoPush(p => ({ ...p, estado: 'ativando' }))
    const r = await ativarNotificacoes({ restaurantId, uid: user.uid, nome: userName })
    if (r.ok) { setAvisoPush({ mostrar: true, estado: 'pronto' }); return }
    if (r.motivo === 'ios-sem-instalar') { setAvisoPush({ mostrar: true, estado: 'ios' }); return }
    setAvisoPush({ mostrar: true, estado: r.motivo === 'negada' ? 'negada' : 'erro' })
  }

  async function verificarAlertas() {
    const hora = new Date().getHours()
    const novos = []
    try {
      const ref = collection(db, 'restaurants', restaurantId, 'checklists')
      for (const t of TURNOS) {
        if (hora >= HORARIO_LIMITE[t]) {
          const q = query(ref, where('data', '==', hoje), where('turno', '==', t), where('concluido', '==', true))
          const s = await getDocs(q)
          if (s.empty) novos.push(t)
        }
      }
    } catch(e) { console.error(e) }
    setAlertas(novos)
  }

  async function carregarDados() {
    setLoading(true); setConcluido(false); setRespostas({}); setComentarios({}); setFotos({}); setSetoresConcluidos({}); setChecklistId(null); checklistIdRef.current = null
    try {
      const tRef = collection(db, 'restaurants', restaurantId, 'tarefas')
      const tSnap = await getDocs(query(tRef, where('turno', '==', turnoAtivo)))
      setTarefas(ordenarTarefas(tSnap.docs.map(d => ({ id: d.id, ...d.data() }))))
      // Checklist compartilhado pelo turno: busca por dia/turno (sem filtrar por funcionário)
      const cRef = collection(db, 'restaurants', restaurantId, 'checklists')
      const cSnap = await getDocs(query(cRef, where('data', '==', hoje), where('turno', '==', turnoAtivo)))
      if (!cSnap.empty) {
        // Se houver documentos duplicados (corrida/versão antiga por funcionário), mescla tudo
        const docs = cSnap.docs.slice().sort((a, b) => (a.data().criadoEm?.seconds || 0) - (b.data().criadoEm?.seconds || 0))
        const principal = docs[0]
        checklistIdRef.current = principal.id; setChecklistId(principal.id)
        const resp = {}, coment = {}, f = {}, sc = {}
        let conc = false
        for (const cl of docs) {
          const d = cl.data()
          Object.assign(resp, d.respostas || {})
          Object.assign(coment, d.comentarios || {})
          Object.assign(f, d.fotos || {}) // formato antigo
          Object.assign(sc, d.setoresConcluidos || {})
          if (d.concluido) conc = true
          const fSnap = await getDocs(collection(db, 'restaurants', restaurantId, 'checklists', cl.id, 'fotos'))
          fSnap.docs.forEach(fd => { f[fd.id] = fd.data().b64 })
        }
        setRespostas(resp); setComentarios(coment); setConcluido(conc); setFotos(f); setSetoresConcluidos(sc)
        // Consolida as respostas mescladas no documento principal
        if (docs.length > 1) {
          try { await updateDoc(doc(db, 'restaurants', restaurantId, 'checklists', principal.id), { respostas: resp, comentarios: coment }) } catch(e) { console.error(e) }
        }
      }
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  // Ficam depois das funções acima de propósito: efeito que chama função
  // declarada abaixo dele engana o linter e esconde closure velha.
  useEffect(() => { carregarDados() }, [turnoAtivo])
  useEffect(() => { verificarAlertas() }, [])
  useEffect(() => { registrarPush() }, [])

  async function salvarResposta(id, val) {
    setUltimaResp(id)
    setRespostas(prev => ({ ...prev, [id]: val }))
    await persistir(`respostas.${id}`, val)
  }
  async function salvarComentario(id, txt) {
    setComentarios(prev => ({ ...prev, [id]: txt }))
    await persistir(`comentarios.${id}`, txt)
  }
  async function handleFoto(id, file) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const b64 = await comprimirImagem(e.target.result)
        const clId = await garantirChecklist()
        // Foto vai num subdocumento próprio para não estourar o limite de 1MB do checklist
        await setDoc(doc(db, 'restaurants', restaurantId, 'checklists', clId, 'fotos', id), { b64 })
        setFotos(prev => ({ ...prev, [id]: b64 }))
      } catch(err) { console.error(err); alert('Erro ao salvar foto: ' + err.message) }
    }
    reader.readAsDataURL(file)
  }
  function comprimirImagem(b64) {
    return new Promise(resolve => {
      const img = new Image()
      img.onload = () => {
        const c = document.createElement('canvas'); const r = Math.min(800/img.width, 1)
        c.width = img.width*r; c.height = img.height*r
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
        resolve(c.toDataURL('image/jpeg', 0.6))
      }
      img.src = b64
    })
  }
  async function garantirChecklist() {
    if (checklistIdRef.current) return checklistIdRef.current
    // Trava: chamadas simultâneas (resposta + foto) esperam a mesma criação
    if (criandoChecklistRef.current) return criandoChecklistRef.current
    criandoChecklistRef.current = (async () => {
      // Revalida no servidor: outro celular pode já ter criado o checklist deste turno
      const cRef = collection(db, 'restaurants', restaurantId, 'checklists')
      const cSnap = await getDocs(query(cRef, where('data', '==', hoje), where('turno', '==', turnoAtivo)))
      if (!cSnap.empty) {
        const docs = cSnap.docs.slice().sort((a, b) => (a.data().criadoEm?.seconds || 0) - (b.data().criadoEm?.seconds || 0))
        checklistIdRef.current = docs[0].id
        setChecklistId(docs[0].id)
        return docs[0].id
      }
      const ref = await addDoc(cRef, {
        data: hoje, turno: turnoAtivo, respostas: {}, comentarios: {},
        concluido: false, funcionarioId: user.uid, funcionarioNome: userName, criadoEm: serverTimestamp()
      })
      checklistIdRef.current = ref.id
      setChecklistId(ref.id)
      return ref.id
    })()
    try { return await criandoChecklistRef.current } finally { criandoChecklistRef.current = null }
  }
  async function persistir(campo, valor) {
    try {
      const id = await garantirChecklist()
      await updateDoc(doc(db, 'restaurants', restaurantId, 'checklists', id), { [campo]: valor })
    } catch(e) { console.error(e) }
  }
  async function concluirChecklist() {
    if (!checklistIdRef.current) return; setSalvando(true)
    await updateDoc(doc(db, 'restaurants', restaurantId, 'checklists', checklistIdRef.current), { concluido: true, concluidoEm: serverTimestamp() })
    setConcluido(true); setCelebrar({ titulo:'Turno concluído!', sub:'Tudo verificado e registrado.' }); setSalvando(false); verificarAlertas()
  }

  // Setores: nomes vêm das tarefas, então setores novos entram automaticamente
  const normSetor = s => (s || '').trim().toLowerCase()
  const chaveSetor = s => normSetor(s).replace(/[.~*/[\]]/g, '_') // caracteres proibidos em nomes de campo do Firestore
  const tarefasDoSetor = s => tarefas.filter(t => normSetor(t.setorNome) === normSetor(s))
  const setorCompleto = s => { const ts = tarefasDoSetor(s); return ts.length > 0 && ts.every(t => respostas[t.id] === 'sim' || respostas[t.id] === 'nao') }

  async function concluirSetor(nome) {
    setSalvando(true)
    try {
      const id = await garantirChecklist()
      await updateDoc(doc(db, 'restaurants', restaurantId, 'checklists', id), {
        [`setoresConcluidos.${chaveSetor(nome)}`]: { nome, por: userName || user.email || '', em: serverTimestamp() }
      })
      const novo = { ...setoresConcluidos, [chaveSetor(nome)]: { nome, por: userName || '' } }
      setSetoresConcluidos(novo)
      // Se todas as tarefas do turno estão respondidas e todos os setores concluídos, fecha o turno
      const setores = [...new Set(tarefas.map(t => t.setorNome).filter(Boolean))]
      const tudoRespondido = tarefas.length > 0 && tarefas.every(t => respostas[t.id] === 'sim' || respostas[t.id] === 'nao')
      const todosSetores = setores.every(s => novo[chaveSetor(s)])
      if (tudoRespondido && todosSetores) {
        await updateDoc(doc(db, 'restaurants', restaurantId, 'checklists', id), { concluido: true, concluidoEm: serverTimestamp() })
        setConcluido(true); setCelebrar({ titulo:'Turno concluído!', sub:'Todos os setores fechados. Tudo registrado.' }); verificarAlertas()
      } else {
        setCelebrar({ titulo:`${nome} concluído!`, sub:'Setor registrado. Bora pro próximo!' })
      }
    } catch(e) { console.error(e); alert('Erro ao concluir setor: ' + e.message) }
    setSalvando(false)
  }

  if (verGestor) return <GestorView restaurantId={restaurantId} codigoAcesso={codigoAcesso} turnos={turnos} onVoltar={() => setVerGestor(false)} />
  if (verTarefas) return <GerenciarTarefas restaurantId={restaurantId} turnos={turnos} onTurnosAtualizados={t => onRestaurantUpdate({ turnos: t })} onVoltar={() => setVerTarefas(false)} />
  if (verEquipe) return <Equipe restaurantId={restaurantId} codigoAcesso={codigoAcesso} onCodigoAtualizado={c => onRestaurantUpdate({ codigoAcesso: c })} onVoltar={() => setVerEquipe(false)} />

  // Conta apenas respostas de tarefas que ainda existem (ignora IDs de tarefas editadas/excluídas)
  const totalResp = tarefas.filter(t => respostas[t.id] === 'sim' || respostas[t.id] === 'nao').length
  const total = tarefas.length
  const todas = total > 0 && totalResp === total
  const prog = total > 0 ? Math.round((totalResp/total)*100) : 0

  if (loading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh' }}><p style={{ color:'#64748b' }}>Carregando...</p></div>

  return (
    <div style={{ minHeight:'100vh', backgroundColor:'#f8fafc', paddingBottom:'80px' }}>
      <style>{`
        @keyframes gestopPop { 0%{transform:scale(1)} 40%{transform:scale(1.03)} 100%{transform:scale(1)} }
        @keyframes gestopBigRing { from{stroke-dashoffset:326.73} to{stroke-dashoffset:0} }
        @keyframes gestopCheck { from{stroke-dashoffset:60} to{stroke-dashoffset:0} }
        @keyframes gestopFade { from{opacity:0} to{opacity:1} }
      `}</style>

      {celebrar && (
        <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, backgroundColor:'rgba(15,23,42,0.78)', backdropFilter:'blur(3px)', zIndex:2000, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px', animation:'gestopFade 0.25s ease' }}>
          <svg width="130" height="130" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="8" />
            <circle cx="60" cy="60" r="52" fill="none" stroke="#22c55e" strokeWidth="8" strokeLinecap="round" strokeDasharray="326.73" strokeDashoffset="326.73" transform="rotate(-90 60 60)" style={{ animation:'gestopBigRing 1s cubic-bezier(.4,0,.2,1) forwards' }} />
            <path d="M40 62 l13 13 27 -29" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="60" strokeDashoffset="60" style={{ animation:'gestopCheck 0.5s ease 0.9s forwards' }} />
          </svg>
          <h2 style={{ color:'white', margin:'18px 0 0 0', fontSize:'22px', fontWeight:'700', textAlign:'center' }}>{celebrar.titulo}</h2>
          <p style={{ color:'rgba(255,255,255,0.85)', margin:'6px 0 22px 0', fontSize:'14px', textAlign:'center' }}>{celebrar.sub}</p>
          <button onClick={() => setCelebrar(null)} style={{ backgroundColor:'white', color:'#16a34a', border:'none', borderRadius:'12px', padding:'12px 30px', fontSize:'15px', fontWeight:'700', cursor:'pointer' }}>Continuar</button>
        </div>
      )}

      {fotoAmpliada && (
        <div onClick={() => setFotoAmpliada(null)} style={{ position:'fixed', top:0, left:0, right:0, bottom:0, backgroundColor:'rgba(0,0,0,0.92)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
          <img src={fotoAmpliada} alt="foto" style={{ maxWidth:'96vw', maxHeight:'96vh', objectFit:'contain', borderRadius:'8px' }} />
        </div>
      )}
      <div style={{ backgroundColor:'#2563eb', color:'white', padding:'20px 24px', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <h1 style={{ margin:0, fontSize:'22px', fontWeight:'700' }}>Gestop</h1>
          <p style={{ margin:'4px 0 0 0', fontSize:'13px', opacity:0.85 }}>{new Date().toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long' })}</p>
          {userName && <p style={{ margin:'2px 0 0 0', fontSize:'12px', opacity:0.7 }}>{userName}</p>}
        </div>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', justifyContent:'flex-end' }}>
          {userRole === 'dono' && (
            <>
              <button onClick={() => setVerTarefas(true)} style={{ padding:'8px 12px', borderRadius:'8px', border:'none', backgroundColor:'rgba(255,255,255,0.2)', color:'white', fontSize:'13px', cursor:'pointer', fontWeight:'600' }}>Tarefas</button>
              <button onClick={() => setVerGestor(true)} style={{ padding:'8px 12px', borderRadius:'8px', border:'none', backgroundColor:'rgba(255,255,255,0.2)', color:'white', fontSize:'13px', cursor:'pointer', fontWeight:'600' }}>Gestor</button>
              <button onClick={() => setVerEquipe(true)} style={{ padding:'8px 12px', borderRadius:'8px', border:'none', backgroundColor:'rgba(255,255,255,0.2)', color:'white', fontSize:'13px', cursor:'pointer', fontWeight:'600' }}>Equipe</button>
            </>
          )}
          <button onClick={() => signOut(auth)} style={{ padding:'8px 12px', borderRadius:'8px', border:'none', backgroundColor:'rgba(255,255,255,0.2)', color:'white', fontSize:'13px', cursor:'pointer' }}>Sair</button>
        </div>
      </div>

      {userRole === 'dono' && typeof diasTrial === 'number' && isFinite(diasTrial) && diasTrial > 0 && (
        <div style={{ backgroundColor:'#f0fdf4', borderBottom:'1px solid #86efac', padding:'10px 24px' }}>
          <p style={{ margin:0, fontSize:'13px', color:'#166534' }}>
            <strong>Teste grátis:</strong> {diasTrial === 1 ? 'último dia' : `${diasTrial} dias restantes`}
          </p>
        </div>
      )}

      {user && !user.emailVerified && (
        <div style={{ backgroundColor:'#eff6ff', borderBottom:'1px solid #bfdbfe', padding:'10px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
          <p style={{ margin:0, fontSize:'13px', color:'#1e40af' }}>Confirme seu e-mail pelo link que enviamos para <strong>{user.email}</strong></p>
          <button disabled={emailReenviado} onClick={async () => { try { await sendEmailVerification(user); setEmailReenviado(true) } catch(e) { alert('Aguarde alguns minutos antes de reenviar.') } }}
            style={{ padding:'6px 12px', borderRadius:'8px', border:'none', backgroundColor: emailReenviado ? '#cbd5e1' : '#2563eb', color:'white', fontSize:'12px', cursor:'pointer', fontWeight:'600' }}>
            {emailReenviado ? 'Enviado ✓' : 'Reenviar'}
          </button>
        </div>
      )}

      {avisoPush.mostrar && (
        <div style={{ backgroundColor:'#eff6ff', borderBottom:'1px solid #bfdbfe', padding:'10px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
          {avisoPush.estado === 'ios' ? (
            <p style={{ margin:0, fontSize:'13px', color:'#1e40af' }}>
              <strong>Para receber os lembretes no iPhone:</strong> toque em Compartilhar no Safari e escolha "Adicionar à Tela de Início". Depois abra o Gestop por esse ícone.
            </p>
          ) : avisoPush.estado === 'pronto' ? (
            <p style={{ margin:0, fontSize:'13px', color:'#166534' }}>Lembretes ativados neste aparelho ✓</p>
          ) : avisoPush.estado === 'negada' ? (
            <p style={{ margin:0, fontSize:'13px', color:'#1e40af' }}>
              Notificação bloqueada neste aparelho. Para liberar, ajuste nas configurações do navegador para este site.
            </p>
          ) : avisoPush.estado === 'erro' ? (
            <p style={{ margin:0, fontSize:'13px', color:'#991b1b' }}>Não consegui ativar os lembretes agora. Tente de novo mais tarde.</p>
          ) : (
            <p style={{ margin:0, fontSize:'13px', color:'#1e40af' }}>Quer ser avisado no celular quando o checklist estiver perto do prazo?</p>
          )}
          <div style={{ display:'flex', gap:'8px' }}>
            {(avisoPush.estado === 'convite' || avisoPush.estado === 'ativando') && (
              <button disabled={avisoPush.estado === 'ativando'} onClick={ligarLembretes}
                style={{ padding:'6px 12px', borderRadius:'8px', border:'none', backgroundColor: avisoPush.estado === 'ativando' ? '#cbd5e1' : '#2563eb', color:'white', fontSize:'12px', cursor:'pointer', fontWeight:'600' }}>
                {avisoPush.estado === 'ativando' ? 'Ativando...' : 'Ativar lembretes'}
              </button>
            )}
            <button onClick={() => setAvisoPush({ mostrar: false, estado: 'convite' })}
              style={{ padding:'6px 12px', borderRadius:'8px', border:'none', backgroundColor:'#e2e8f0', color:'#475569', fontSize:'12px', cursor:'pointer', fontWeight:'600' }}>
              {avisoPush.estado === 'pronto' ? 'Fechar' : 'Agora não'}
            </button>
          </div>
        </div>
      )}

      {alertas.length > 0 && (
        <div style={{ backgroundColor:'#fef3c7', borderBottom:'1px solid #fcd34d', padding:'12px 24px' }}>
          <p style={{ margin:0, fontSize:'13px', color:'#92400e', fontWeight:'600' }}>Turno(s) nao concluido(s) hoje: {alertas.join(', ')}</p>
        </div>
      )}

      <div style={{ display:'flex', gap:'8px', padding:'16px 24px', backgroundColor:'white', borderBottom:'1px solid #e2e8f0', overflowX:'auto' }}>
        {TURNOS.map(t => (
          <button key={t} onClick={() => setTurnoAtivo(t)} style={{ padding:'8px 16px', borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'13px', fontWeight:'600', whiteSpace:'nowrap', backgroundColor: turnoAtivo===t ? '#2563eb' : '#f1f5f9', color: turnoAtivo===t ? 'white' : '#64748b' }}>{t}</button>
        ))}
      </div>

      <div style={{ padding:'20px 24px' }}>
        <div style={{ backgroundColor:'white', borderRadius:'12px', padding:'16px', marginBottom:'20px', boxShadow:'0 1px 3px rgba(0,0,0,0.08)', display:'flex', alignItems:'center', gap:'16px' }}>
          <div style={{ position:'relative', width:'62px', height:'62px', flexShrink:0 }}>
            <svg width="62" height="62" viewBox="0 0 62 62">
              <circle cx="31" cy="31" r="26" fill="none" stroke="#f1f5f9" strokeWidth="7" />
              <circle cx="31" cy="31" r="26" fill="none" stroke={prog===100 ? '#16a34a' : '#2563eb'} strokeWidth="7" strokeLinecap="round"
                strokeDasharray={163.36} strokeDashoffset={163.36 * (1 - prog/100)} transform="rotate(-90 31 31)"
                style={{ transition:'stroke-dashoffset 0.4s ease, stroke 0.3s' }} />
            </svg>
            <span style={{ position:'absolute', top:0, left:0, width:'62px', height:'62px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:'700', color: prog===100 ? '#16a34a' : '#2563eb' }}>{prog}%</span>
          </div>
          <div>
            <p style={{ margin:0, fontSize:'13px', color:'#64748b' }}>Progresso do turno</p>
            <p style={{ margin:'2px 0 0 0', fontSize:'15px', fontWeight:'700', color:'#1e293b' }}>{totalResp} de {total} tarefas</p>
          </div>
        </div>

        {concluido && (
          <div style={{ backgroundColor:'#dcfce7', border:'1px solid #86efac', borderRadius:'12px', padding:'16px', marginBottom:'20px', textAlign:'center' }}>
            <p style={{ margin:0, fontWeight:'700', color:'#16a34a', fontSize:'18px' }}>Turno concluido!</p>
          </div>
        )}

        {(() => {
          const su = [...new Set(tarefas.map(t => t.setorNome).filter(Boolean))]
          const tf = setorAtivo ? tarefas.filter(t => t.setorNome?.trim().toLowerCase() === setorAtivo.trim().toLowerCase()) : tarefas
          return (<>
          {su.length > 1 && (
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'12px' }}>
              <button onClick={() => setSetorAtivo(null)} style={{ padding:'6px 14px', borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'13px', fontWeight: setorAtivo === null ? '700' : '400', backgroundColor: setorAtivo === null ? '#2563eb' : '#f1f5f9', color: setorAtivo === null ? 'white' : '#475569' }}>Todos</button>
              {su.map(s => {
                const ativo = normSetor(setorAtivo) === normSetor(s)
                const fechado = !!setoresConcluidos[chaveSetor(s)]
                const ts = tarefasDoSetor(s)
                const nResp = ts.filter(t => respostas[t.id] === 'sim' || respostas[t.id] === 'nao').length
                return (
                  <button key={s} onClick={() => setSetorAtivo(s)} style={{ padding:'6px 14px', borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'13px', fontWeight: ativo || fechado ? '700' : '400',
                    backgroundColor: ativo ? '#2563eb' : fechado ? '#dcfce7' : '#f1f5f9',
                    color: ativo ? 'white' : fechado ? '#16a34a' : '#475569' }}>
                    {s} {fechado ? '✓' : `${nResp}/${ts.length}`}
                  </button>
                )
              })}
            </div>
          )}
          {tf.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px 20px', color:'#94a3b8' }}><p>Nenhuma tarefa para {turnoAtivo}.</p></div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {tf.map(tarefa => {
              const resp = respostas[tarefa.id]; const coment = comentarios[tarefa.id]||''; const foto = fotos[tarefa.id]
              return (
                <div key={tarefa.id} style={{ backgroundColor:'white', borderRadius:'12px', padding:'16px', boxShadow:'0 1px 3px rgba(0,0,0,0.08)', borderLeft: resp==='sim' ? '4px solid #16a34a' : resp==='nao' ? '4px solid #dc2626' : '4px solid #e2e8f0', animation: tarefa.id === ultimaResp ? 'gestopPop 0.4s ease' : undefined }}>
                  <p style={{ margin:'0 0 4px 0', fontSize:'15px', color:'#1e293b', fontWeight:'500' }}>{tarefa.texto}</p>
                  {tarefa.setorNome && <span style={{ fontSize:'11px', color:'#94a3b8', backgroundColor:'#f8fafc', padding:'2px 8px', borderRadius:'10px' }}>{tarefa.setorNome}</span>}
                  {!concluido && (
                    <>
                      <div style={{ display:'flex', gap:'8px', marginTop:'12px' }}>
                        <button onClick={() => salvarResposta(tarefa.id, 'sim')} style={{ flex:1, padding:'10px', borderRadius:'8px', border:'none', cursor:'pointer', fontSize:'14px', fontWeight:'700', backgroundColor: resp==='sim' ? '#16a34a' : '#f0fdf4', color: resp==='sim' ? 'white' : '#16a34a' }}>Sim</button>
                        <button onClick={() => salvarResposta(tarefa.id, 'nao')} style={{ flex:1, padding:'10px', borderRadius:'8px', border:'none', cursor:'pointer', fontSize:'14px', fontWeight:'700', backgroundColor: resp==='nao' ? '#dc2626' : '#fef2f2', color: resp==='nao' ? 'white' : '#dc2626' }}>Nao</button>
                      </div>
                      <textarea placeholder="Comentario (opcional)..." value={coment} onChange={e => salvarComentario(tarefa.id, e.target.value)}
                        style={{ width:'100%', marginTop:'10px', padding:'8px 10px', borderRadius:'8px', border:'1px solid #e2e8f0', fontSize:'13px', resize:'none', fontFamily:'inherit', boxSizing:'border-box', height:'60px' }} />
                      <div style={{ marginTop:'8px' }}>
                        <input type="file" accept="image/*" capture="environment" style={{ display:'none' }} ref={el => fileRefs.current[tarefa.id]=el} onChange={e => handleFoto(tarefa.id, e.target.files[0])} />
                        <button onClick={() => fileRefs.current[tarefa.id]?.click()} style={{ padding:'8px 14px', borderRadius:'8px', border:'1px solid #e2e8f0', backgroundColor:'#f8fafc', fontSize:'13px', cursor:'pointer', color:'#475569' }}>{foto ? 'Trocar foto' : 'Tirar foto'}</button>
                        {foto && <span style={{ marginLeft:'8px', fontSize:'12px', color:'#16a34a' }}>Foto salva</span>}
                      </div>
                      {foto && <img src={foto} alt="foto" onClick={() => setFotoAmpliada(foto)} style={{ marginTop:'8px', width:'100%', borderRadius:'8px', maxHeight:'200px', objectFit:'cover', cursor:'pointer' }} />}
                    </>
                  )}
                  {concluido && (
                    <div style={{ marginTop:'8px' }}>
                      {resp && <p style={{ margin:0, fontWeight:'700', color: resp==='sim' ? '#16a34a' : '#dc2626' }}>{resp==='sim' ? 'Sim' : 'Nao'}</p>}
                      {coment && <p style={{ margin:'4px 0 0 0', fontSize:'13px', color:'#64748b' }}>{coment}</p>}
                      {foto && <img src={foto} alt="foto" onClick={() => setFotoAmpliada(foto)} style={{ marginTop:'8px', width:'100%', borderRadius:'8px', maxHeight:'200px', objectFit:'cover', cursor:'pointer' }} />}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
        {/* Concluir setor: aparece dentro do filtro quando todas as tarefas do setor foram respondidas */}
        {!concluido && setorAtivo && setorCompleto(setorAtivo) && !setoresConcluidos[chaveSetor(setorAtivo)] && (
          <button onClick={() => concluirSetor(setorAtivo)} disabled={salvando} style={{ width:'100%', padding:'14px', marginTop:'20px', backgroundColor:'#16a34a', color:'white', border:'none', borderRadius:'12px', fontSize:'15px', fontWeight:'700', cursor:'pointer' }}>
            {salvando ? 'Salvando...' : `Concluir ${setorAtivo}`}
          </button>
        )}
        {!concluido && setorAtivo && setoresConcluidos[chaveSetor(setorAtivo)] && (
          <div style={{ backgroundColor:'#dcfce7', border:'1px solid #86efac', borderRadius:'12px', padding:'12px', marginTop:'20px', textAlign:'center' }}>
            <p style={{ margin:0, fontWeight:'700', color:'#16a34a', fontSize:'14px' }}>{setorAtivo} concluído ✓{setoresConcluidos[chaveSetor(setorAtivo)]?.por ? ` · ${setoresConcluidos[chaveSetor(setorAtivo)].por}` : ''}</p>
          </div>
        )}
        </>)
        })()}
        {!concluido && todas && (
          <button onClick={concluirChecklist} disabled={salvando} style={{ width:'100%', padding:'16px', marginTop:'24px', backgroundColor:'#16a34a', color:'white', border:'none', borderRadius:'12px', fontSize:'16px', fontWeight:'700', cursor:'pointer' }}>
            {salvando ? 'Salvando...' : 'Concluir Turno'}
          </button>
        )}
      </div>
    </div>
  )
}
