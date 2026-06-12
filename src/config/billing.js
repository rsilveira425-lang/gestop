// Configuração de cobrança do Gestop
export const PRECO_MENSAL = 'R$ 49,90'
export const DIAS_TRIAL = 14

// Link do plano de assinatura criado no painel do Mercado Pago.
// Enquanto estiver vazio, o paywall mostra instrução de contato.
export const LINK_ASSINATURA = 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=115c7b4d916747d587ad812f5d99f06c'

export const EMAIL_CONTATO = 'rsilveira425@gmail.com'

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
