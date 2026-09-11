// Configuração de cobrança do Gestop
export const PRECO_MENSAL = 'R$ 97,00'
export const PRECO_MENSAL_VALOR = 97.00 // mesmo valor acima, em número — usado no rastreamento (Meta Pixel)
export const DIAS_TRIAL = 14

// Oferta de fundador: os primeiros clientes pagam esse valor pra sempre.
// Isso é só o texto/preço mostrado — não limita nem conta sozinho quantas contas já assinaram
// nesse valor. Enquanto não houver um segundo plano configurado no Mercado Pago (ver
// LINK_ASSINATURA_FUNDADOR abaixo), aplicar esse preço a cada assinante é manual.
export const PRECO_FUNDADOR = 'R$ 49,00'
export const VAGAS_FUNDADOR = 10

// Link do plano de assinatura criado no painel do Mercado Pago.
// Enquanto estiver vazio, o paywall mostra instrução de contato.
export const LINK_ASSINATURA = 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=115c7b4d916747d587ad812f5d99f06c'

// Link do plano com desconto de fundador (PRECO_FUNDADOR), quando ele existir no Mercado Pago.
// Enquanto vazio, a oferta de fundador é só texto na landing — o checkout continua sendo o de cima.
export const LINK_ASSINATURA_FUNDADOR = ''

export const EMAIL_CONTATO = 'rsilveira425@gmail.com'

// Link de assinatura com o restaurante identificado — o webhook usa isso pra ativar a conta certa
export function linkAssinaturaPara(restaurantId) {
  if (!LINK_ASSINATURA) return ''
  const sep = LINK_ASSINATURA.includes('?') ? '&' : '?'
  return restaurantId ? `${LINK_ASSINATURA}${sep}external_reference=${restaurantId}` : LINK_ASSINATURA
}

// Calcula quantos dias de teste restam. Retorna null se o trial nem começou.
export function diasRestantesTrial(restaurantData) {
  const inicio = restaurantData?.trialInicio
  if (!inicio) return null
  if (restaurantData?.assinaturaAtiva) return Infinity
  const fim = new Date(inicio)
  fim.setDate(fim.getDate() + DIAS_TRIAL)
  const diff = Math.ceil((fim - new Date()) / (1000 * 60 * 60 * 24))
  return diff
}
