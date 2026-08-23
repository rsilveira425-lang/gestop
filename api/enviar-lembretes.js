// Envia os lembretes de checklist para os celulares da equipe.
//
// Chamado por um agendador de fora (GitHub Actions) a cada poucos minutos.
// Ele não decide nada: só pergunta "que aviso deveria sair agora?" e envia.
import admin from 'firebase-admin'
import { avisosDevidos, chaveLembrete, textoDoAviso, deveAvisar, JANELA_PADRAO } from '../src/config/lembretes.js'
import { diasRestantesTrial } from '../src/config/billing.js'

const FUSO = 'America/Sao_Paulo'

let inicializado = false
function getApp() {
  if (!inicializado) {
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    admin.initializeApp({ credential: admin.credential.cert(sa) })
    inicializado = true
  }
  return admin
}

// A hora local do restaurante, não a do servidor (que roda em UTC).
function agoraNoFuso(fuso = FUSO) {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: fuso, hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', weekday: 'short',
  }).formatToParts(new Date())
  const p = Object.fromEntries(partes.map(x => [x.type, x.value]))
  const dias = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
  return {
    data: `${p.year}-${p.month}-${p.day}`,
    hora: parseInt(p.hour, 10) % 24,
    minuto: parseInt(p.minute, 10),
    diaSemana: dias[p.weekday] ?? 0,
  }
}

function restauranteAtivo(dados) {
  if (dados?.assinaturaAtiva) return true
  const dias = diasRestantesTrial(dados)
  return dias === null || dias > 0
}

export default async function handler(req, res) {
  // Só quem tem o segredo dispara — senão qualquer um poderia encher a
  // equipe de notificação chamando a URL.
  const segredo = req.headers['x-lembretes-secret'] || req.query?.secret
  if (!process.env.LEMBRETES_SECRET || segredo !== process.env.LEMBRETES_SECRET) {
    return res.status(401).json({ error: 'nao autorizado' })
  }
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    return res.status(500).json({ error: 'FIREBASE_SERVICE_ACCOUNT ausente' })
  }

  try {
    const adm = getApp()
    const db = adm.firestore()
    const janela = parseInt(process.env.LEMBRETES_JANELA, 10) || JANELA_PADRAO
    const relatorio = { enviados: 0, restaurantes: 0, pulados: [] }

    const restaurantes = await db.collection('restaurants').get()
    for (const rest of restaurantes.docs) {
      const dados = rest.data()
      if (!restauranteAtivo(dados)) { relatorio.pulados.push(`${rest.id}: inativo`); continue }

      const agora = agoraNoFuso(dados.fusoHorario || FUSO)
      const devidos = avisosDevidos({ turnos: dados.turnos || [], agora, janelaMinutos: janela })
      if (devidos.length === 0) continue
      relatorio.restaurantes++

      for (const aviso of devidos) {
        const chave = chaveLembrete(agora.data, aviso.turno, aviso.antes)
        const jaFoi = db.collection('restaurants').doc(rest.id).collection('lembretes').doc(chave)

        // Só quantas tarefas o turno tem — se não tem nenhuma, não incomoda.
        const tarefas = await db.collection('restaurants').doc(rest.id).collection('tarefas')
          .where('turno', '==', aviso.turno).get()
        const total = tarefas.size

        const checklists = await db.collection('restaurants').doc(rest.id).collection('checklists')
          .where('data', '==', agora.data).where('turno', '==', aviso.turno).get()
        let feitas = 0, concluido = false
        const idsValidos = new Set(tarefas.docs.map(d => d.id))
        const respondidas = new Set()
        for (const cl of checklists.docs) {
          const d = cl.data()
          if (d.concluido) concluido = true
          for (const [id, v] of Object.entries(d.respostas || {})) {
            if (idsValidos.has(id) && (v === 'sim' || v === 'nao')) respondidas.add(id)
          }
        }
        feitas = respondidas.size

        if (!deveAvisar({ total, feitas, concluido })) continue

        // Trava contra envio repetido: se o agendador rodar duas vezes na
        // mesma janela, a segunda encontra o registro e desiste.
        const criou = await db.runTransaction(async tx => {
          const doc = await tx.get(jaFoi)
          if (doc.exists) return false
          tx.set(jaFoi, { turno: aviso.turno, antes: aviso.antes, em: new Date().toISOString(), feitas, total })
          return true
        })
        if (!criou) continue

        const aparelhos = await db.collection('restaurants').doc(rest.id).collection('dispositivos').get()
        const tokens = aparelhos.docs.map(d => d.data().token).filter(Boolean)
        if (tokens.length === 0) { relatorio.pulados.push(`${rest.id}: sem aparelho`); continue }

        const { titulo, corpo } = textoDoAviso({ turno: aviso.turno, antes: aviso.antes, feitas, total })
        const resposta = await adm.messaging().sendEachForMulticast({
          tokens,
          // Só `data`: quem monta a notificação é o service worker, o que dá
          // controle do texto e evita aviso duplicado no Android.
          data: { titulo, corpo, url: '/', tag: `gestop-${aviso.turno}` },
          webpush: { headers: { Urgency: 'high', TTL: '1800' } },
        })
        relatorio.enviados += resposta.successCount

        // Aparelho que desinstalou o app devolve erro: limpa para não tentar sempre
        await Promise.all(resposta.responses.map(async (r, i) => {
          const codigo = r.error?.code || ''
          if (codigo.includes('registration-token-not-registered') || codigo.includes('invalid-argument')) {
            await aparelhos.docs[i].ref.delete().catch(() => {})
          }
        }))
      }
    }

    return res.status(200).json({ ok: true, ...relatorio })
  } catch (e) {
    console.error('Erro ao enviar lembretes:', e)
    return res.status(500).json({ error: e.message })
  }
}
