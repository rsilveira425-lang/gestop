// Dados de UM restaurante para análise externa (Claude).
//
// Lê tudo, mas só escreve em tarefas (sem apagar). Só um restaurante: ele vem da variável ANALISE_RESTAURANT_ID
// (ou do dono em ANALISE_DONO_EMAIL), nunca da requisição — não existe parâmetro que aponte para outra empresa.
// Restaurante novo que se cadastrar no app fica de fora por construção.
//
// GET /api/analise?inicio=AAAA-MM-DD&fim=AAAA-MM-DD   (padrão: mês atual)
// POST /api/analise  { acoes: [...] }  — mexe só em tarefas, nunca apaga:
//   { tipo: 'criar', turno, setor, texto, fotoObrigatoria? }
//   { tipo: 'editar', id, texto?, fotoObrigatoria? }
//   { tipo: 'mover', id, setor }
// Header: Authorization: Bearer <ANALISE_SECRET>
import admin from 'firebase-admin'
import { timingSafeEqual } from 'node:crypto'
import { calcularRanking } from '../aplicativo (src)/ajustes (config)/gamificacao.js'
import { getTurnos, dataOperacional } from '../aplicativo (src)/ajustes (config)/turnos.js'
import { proximaOrdem, moverTarefa } from '../aplicativo (src)/ajustes (config)/tarefas.js'

const FUSO = 'America/Sao_Paulo'
const MAX_DIAS = 93

let inicializado = false
function getAdmin() {
  if (!inicializado) {
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    admin.initializeApp({ credential: admin.credential.cert(sa) })
    inicializado = true
  }
  return admin
}

// O restaurante liberado: pelo id direto ou pelo e-mail de quem é dono dele.
async function restauranteLiberado(adm) {
  if (process.env.ANALISE_RESTAURANT_ID) return process.env.ANALISE_RESTAURANT_ID
  const email = process.env.ANALISE_DONO_EMAIL
  if (!email) return null
  const { uid } = await adm.auth().getUserByEmail(email)
  const perfil = (await adm.firestore().collection('usuarios').doc(uid).get()).data()
  return perfil?.role === 'dono' ? perfil.restaurantId : null
}

function autorizado(req) {
  const esperado = process.env.ANALISE_SECRET
  const recebido = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!esperado || !recebido) return false
  const a = Buffer.from(esperado), b = Buffer.from(recebido)
  return a.length === b.length && timingSafeEqual(a, b)
}

// O mesmo instante, lido no relógio do restaurante. As regras de prazo usam
// `new Date(ano, mes, dia, hora)` no fuso da máquina; o servidor roda em UTC,
// então o horário de conclusão precisa estar no mesmo "relógio" para comparar.
function relogioLocal(d, fuso = FUSO) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: fuso, hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(d).map(x => [x.type, x.value]))
  return new Date(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second)
}

// Timestamp do Firestore vira texto ISO; o resto passa como está.
function limpar(v) {
  if (v?.toDate) return v.toDate().toISOString()
  if (Array.isArray(v)) return v.map(limpar)
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, limpar(x)]))
  return v
}

const DATA_RE = /^\d{4}-\d{2}-\d{2}$/

function periodo(query, fuso) {
  const mes = dataOperacional(relogioLocal(new Date(), fuso)).slice(0, 7)
  const inicio = query.inicio || `${mes}-01`
  const fim = query.fim || `${mes}-31`
  if (!DATA_RE.test(inicio) || !DATA_RE.test(fim) || inicio > fim) return { erro: 'use inicio/fim no formato AAAA-MM-DD, com inicio <= fim' }
  const dias = (Date.parse(fim) - Date.parse(inicio)) / 86400000
  if (!(dias <= MAX_DIAS)) return { erro: `periodo maximo de ${MAX_DIAS} dias` }
  return { inicio, fim }
}

const MAX_ACOES = 50
const mesmoNome = (a, b) => (a || '').trim().toLowerCase() === (b || '').trim().toLowerCase()

// Valida todas as ações contra os dados atuais e devolve as escritas.
// Se qualquer ação for inválida, nada é gravado.
export function planejarAcoes(acoes, { tarefas, setores, turnos }) {
  if (!Array.isArray(acoes) || acoes.length === 0 || acoes.length > MAX_ACOES) {
    throw new Error(`envie de 1 a ${MAX_ACOES} acoes`)
  }
  const lista = tarefas.map(t => ({ ...t }))
  const novas = [], alteradas = new Map()
  const setorValido = nome => setores.find(s => mesmoNome(s.nome, nome))?.nome
  const texto = v => {
    if (typeof v !== 'string' || !v.trim() || v.length > 300) throw new Error('texto invalido')
    return v.trim()
  }
  const alterar = (id, patch) => {
    alteradas.set(id, { ...alteradas.get(id), ...patch })
    Object.assign(lista.find(t => t.id === id), patch)
  }

  acoes.forEach((a, i) => {
    const onde = `acao ${i + 1}: `
    try {
      if (a?.tipo === 'criar') {
        const turno = turnos.find(t => mesmoNome(t.nome, a.turno))?.nome
        const setor = setorValido(a.setor)
        if (!turno) throw new Error('turno inexistente')
        if (!setor) throw new Error('setor inexistente')
        const nova = {
          id: `nova-${novas.length}`,
          texto: texto(a.texto), setorNome: setor, turno,
          ordem: proximaOrdem(lista, setor, turno),
          criadoEm: new Date().toISOString(),
          fotoObrigatoria: !!a.fotoObrigatoria,
        }
        novas.push(nova)
        lista.push(nova)
      } else if (a?.tipo === 'editar') {
        if (!tarefas.some(t => t.id === a.id)) throw new Error('tarefa inexistente')
        const patch = {}
        if (a.texto !== undefined) patch.texto = texto(a.texto)
        if (a.fotoObrigatoria !== undefined) patch.fotoObrigatoria = !!a.fotoObrigatoria
        if (!Object.keys(patch).length) throw new Error('nada para editar')
        alterar(a.id, patch)
      } else if (a?.tipo === 'mover') {
        if (!tarefas.some(t => t.id === a.id)) throw new Error('tarefa inexistente')
        const setor = setorValido(a.setor)
        if (!setor) throw new Error('setor inexistente')
        moverTarefa(lista, { tarefaId: a.id, paraSetor: setor }).forEach(({ id, ...patch }) => alterar(id, patch))
      } else {
        throw new Error('tipo deve ser criar, editar ou mover')
      }
    } catch (e) {
      throw new Error(onde + e.message, { cause: e })
    }
  })
  return { novas, alteradas }
}

async function aplicarAcoes(req, res, db, restRef, turnos) {
  const [tSnap, sSnap] = await Promise.all([restRef.collection('tarefas').get(), restRef.collection('setores').get()])
  let plano
  try {
    plano = planejarAcoes(req.body?.acoes, {
      tarefas: tSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      setores: sSnap.docs.map(d => d.data()),
      turnos,
    })
  } catch (e) {
    return res.status(400).json({ error: e.message })
  }
  const lote = db.batch()
  const criadas = plano.novas.map(nova => {
    const dados = { ...nova }
    delete dados.id // o id provisório só servia para calcular a ordem
    const ref = restRef.collection('tarefas').doc()
    lote.set(ref, dados)
    return { id: ref.id, ...dados }
  })
  for (const [id, patch] of plano.alteradas) lote.update(restRef.collection('tarefas').doc(id), patch)
  await lote.commit()
  return res.status(200).json({ ok: true, criadas, alteradas: Object.fromEntries(plano.alteradas) })
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'somente GET ou POST' })
  if (!autorizado(req)) return res.status(401).json({ error: 'nao autorizado' })
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    return res.status(500).json({ error: 'FIREBASE_SERVICE_ACCOUNT ausente' })
  }

  try {
    const adm = getAdmin()
    const rid = await restauranteLiberado(adm)
    if (!rid) return res.status(500).json({ error: 'defina ANALISE_RESTAURANT_ID ou ANALISE_DONO_EMAIL (de uma conta dona)' })
    const db = adm.firestore()
    const restRef = db.collection('restaurants').doc(rid)
    const restSnap = await restRef.get()
    if (!restSnap.exists) return res.status(404).json({ error: 'restaurante nao encontrado' })
    // O código de acesso deixa qualquer um entrar na equipe: não sai daqui.
    const restaurante = restSnap.data()
    delete restaurante.codigoAcesso
    const fuso = restaurante.fusoHorario || FUSO

    if (req.method === 'POST') return aplicarAcoes(req, res, db, restRef, getTurnos(restaurante))

    const p = periodo(req.query || {}, fuso)
    if (p.erro) return res.status(400).json({ error: p.erro })

    const [setores, tarefas, equipe, checklists] = await Promise.all([
      restRef.collection('setores').get(),
      restRef.collection('tarefas').get(),
      db.collection('usuarios').where('restaurantId', '==', rid).get(),
      restRef.collection('checklists').where('data', '>=', p.inicio).where('data', '<=', p.fim).get(),
    ])

    // Das fotos, só quais tarefas têm uma — a imagem em si é pesada demais.
    const listaChecklists = await Promise.all(checklists.docs.map(async d => {
      const fotos = await d.ref.collection('fotos').select().get()
      return { id: d.id, ...d.data(), tarefasComFoto: fotos.docs.map(f => f.id) }
    }))

    const turnos = getTurnos(restaurante)
    const ranking = calcularRanking(
      listaChecklists.map(cl => cl.concluidoEm?.toDate
        ? { ...cl, concluidoEm: { toDate: () => relogioLocal(cl.concluidoEm.toDate(), fuso) } }
        : cl),
      turnos,
    )

    return res.status(200).json(limpar({
      periodo: p,
      restaurante: { id: rid, ...restaurante, turnos },
      setores: setores.docs.map(d => ({ id: d.id, ...d.data() })),
      tarefas: tarefas.docs.map(d => ({ id: d.id, ...d.data() })),
      equipe: equipe.docs.map(d => {
        const u = d.data()
        return { uid: d.id, nome: u.nome, role: u.role, ativo: u.ativo !== false }
      }),
      ranking,
      checklists: listaChecklists.sort((a, b) => a.data.localeCompare(b.data) || a.turno.localeCompare(b.turno)),
    }))
  } catch (e) {
    console.error('Erro na analise:', e)
    return res.status(500).json({ error: e.message })
  }
}
