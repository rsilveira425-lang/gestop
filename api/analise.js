// Leitura dos dados de UM restaurante para análise externa (Claude).
//
// Só leitura e só um restaurante: o id vem da variável ANALISE_RESTAURANT_ID,
// nunca da requisição — não existe parâmetro que aponte para outra empresa.
// Restaurante novo que se cadastrar no app fica de fora por construção.
//
// GET /api/analise?inicio=AAAA-MM-DD&fim=AAAA-MM-DD   (padrão: mês atual)
// Header: Authorization: Bearer <ANALISE_SECRET>
import admin from 'firebase-admin'
import { timingSafeEqual } from 'node:crypto'
import { calcularRanking } from '../aplicativo (src)/ajustes (config)/gamificacao.js'
import { getTurnos, dataOperacional } from '../aplicativo (src)/ajustes (config)/turnos.js'

const FUSO = 'America/Sao_Paulo'
const MAX_DIAS = 93

let inicializado = false
function getDb() {
  if (!inicializado) {
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    admin.initializeApp({ credential: admin.credential.cert(sa) })
    inicializado = true
  }
  return admin.firestore()
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

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'somente GET' })
  if (!autorizado(req)) return res.status(401).json({ error: 'nao autorizado' })
  const rid = process.env.ANALISE_RESTAURANT_ID
  if (!rid || !process.env.FIREBASE_SERVICE_ACCOUNT) {
    return res.status(500).json({ error: 'ANALISE_RESTAURANT_ID ou FIREBASE_SERVICE_ACCOUNT ausente' })
  }

  try {
    const db = getDb()
    const restRef = db.collection('restaurants').doc(rid)
    const restSnap = await restRef.get()
    if (!restSnap.exists) return res.status(404).json({ error: 'restaurante nao encontrado' })
    // O código de acesso deixa qualquer um entrar na equipe: não sai daqui.
    const restaurante = restSnap.data()
    delete restaurante.codigoAcesso
    const fuso = restaurante.fusoHorario || FUSO

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
