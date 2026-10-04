// Webhook do Mercado Pago — ativa/desativa a assinatura do restaurante automaticamente.
// O Mercado Pago chama esta URL quando uma assinatura é criada, autorizada ou cancelada.
// Nunca confiamos no corpo da notificação: buscamos a assinatura direto na API do MP.
import admin from 'firebase-admin'

// Planos do Cotaí na mesma conta do Mercado Pago ("Cotaí - Plano Fundador" e "Cotaí - Plano Mensal")
const PLANOS_COTAI = ['14a88d0f88364c8898327dd5bbc58a12', '2ee57f5025814f61a81cd6861f1c7b22']

let inicializado = false
function getDb() {
  if (!inicializado) {
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    admin.initializeApp({ credential: admin.credential.cert(sa) })
    inicializado = true
  }
  return admin.firestore()
}

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'metodo nao permitido' })
  }
  try {
    if (!process.env.MP_ACCESS_TOKEN || !process.env.FIREBASE_SERVICE_ACCOUNT) {
      console.error('Variáveis de ambiente faltando (MP_ACCESS_TOKEN / FIREBASE_SERVICE_ACCOUNT)')
      return res.status(500).json({ error: 'configuracao incompleta' })
    }

    const body = req.body || {}
    const query = req.query || {}
    // MP pode mandar { type, data: { id } } no corpo ou ?topic=&id= na URL
    const id = body?.data?.id || query['data.id'] || query.id
    const tipo = String(body?.type || body?.topic || query.topic || query.type || '')

    if (!id) return res.status(200).json({ ok: true, skip: 'sem id' })
    if (tipo && !tipo.includes('preapproval') && !tipo.includes('subscription')) {
      return res.status(200).json({ ok: true, skip: 'evento ignorado: ' + tipo })
    }

    // Busca a assinatura na API do Mercado Pago (fonte da verdade)
    const r = await fetch(`https://api.mercadopago.com/preapproval/${id}`, {
      headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
    })
    if (!r.ok) return res.status(200).json({ ok: true, skip: 'assinatura nao encontrada no MP' })
    const sub = await r.json()

    // A conta do Mercado Pago também cobra o Cotaí (app de cotação), que tem os próprios planos
    // e se atualiza sozinho: os avisos das assinaturas dele não são deste app.
    if (PLANOS_COTAI.includes(sub.preapproval_plan_id)) {
      return res.status(200).json({ ok: true, skip: 'assinatura do Cotaí' })
    }

    const db = getDb()

    // Identifica o restaurante: external_reference (vem do link) ou e-mail do pagador
    let restaurantId = sub.external_reference || null
    if (!restaurantId && sub.payer_email) {
      const snap = await db.collection('usuarios')
        .where('email', '==', sub.payer_email)
        .where('role', '==', 'dono')
        .limit(1).get()
      if (!snap.empty) restaurantId = snap.docs[0].data().restaurantId
    }
    if (!restaurantId) {
      console.error('Assinatura sem restaurante identificado:', sub.id, sub.payer_email)
      return res.status(200).json({ ok: true, skip: 'restaurante nao identificado' })
    }

    // Só atualiza restaurante que existe (não cria documento solto por um external_reference qualquer)
    const ref = db.collection('restaurants').doc(restaurantId)
    if (!(await ref.get()).exists) {
      console.error('Assinatura para restaurante inexistente:', sub.id, restaurantId)
      return res.status(200).json({ ok: true, skip: 'restaurante inexistente' })
    }

    const ativa = sub.status === 'authorized'
    await ref.set({
      assinaturaAtiva: ativa,
      assinaturaStatus: sub.status,
      assinaturaId: sub.id,
      assinaturaAtualizadaEm: new Date().toISOString(),
    }, { merge: true })

    console.log(`Restaurante ${restaurantId}: assinatura ${sub.status}`)
    return res.status(200).json({ ok: true, restaurantId, status: sub.status })
  } catch (e) {
    console.error('Erro no webhook MP:', e)
    return res.status(500).json({ error: e.message })
  }
}
