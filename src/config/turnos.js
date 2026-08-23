// Turnos padrão — usados quando o restaurante ainda não configurou os seus
export const DEFAULT_TURNOS = [
  { nome: 'Abertura', horaLimite: 11 },
  { nome: 'Pré pico', horaLimite: 15 },
  { nome: 'Fechamento', horaLimite: 23 },
]

export function getTurnos(restaurantData) {
  const t = restaurantData?.turnos
  return Array.isArray(t) && t.length > 0 ? t : DEFAULT_TURNOS
}

// 0 = domingo ... 6 = sábado, igual ao getDay() do JavaScript
export const DIAS_SEMANA = [
  { n: 0, curto: 'Dom', longo: 'Domingo' },
  { n: 1, curto: 'Seg', longo: 'Segunda' },
  { n: 2, curto: 'Ter', longo: 'Terça' },
  { n: 3, curto: 'Qua', longo: 'Quarta' },
  { n: 4, curto: 'Qui', longo: 'Quinta' },
  { n: 5, curto: 'Sex', longo: 'Sexta' },
  { n: 6, curto: 'Sáb', longo: 'Sábado' },
]

// Quantos minutos antes do horário do turno cada aviso é enviado.
// 0 = na hora exata. Usado quando o turno ainda não tem `avisos` configurado.
export const AVISOS_PADRAO = [30, 0]

const inteiro = (v, padrao = 0) => {
  const n = parseInt(v, 10)
  return Number.isFinite(n) ? n : padrao
}

// O horário em que este turno deve estar concluído, no dia da semana pedido.
// Restaurante costuma fechar mais tarde no fim de semana, então cada turno
// pode ter exceções por dia — sem elas, vale o horário normal.
export function horarioDoTurno(turno, diaSemana) {
  const excecao = (turno?.excecoes || []).find(e => Array.isArray(e?.dias) && e.dias.includes(diaSemana))
  const hora = inteiro(excecao ? excecao.hora : turno?.horaLimite, 0)
  const minuto = inteiro(excecao ? excecao.minuto : turno?.minutoLimite, 0)
  return {
    hora: Math.min(23, Math.max(0, hora)),
    minuto: Math.min(59, Math.max(0, minuto)),
  }
}

export const formatarHorario = ({ hora, minuto }) =>
  `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`

// Os horários de aviso do turno num dia da semana, do mais cedo ao mais tarde.
// Avisos que cairiam no dia anterior (ex.: 1h antes de 00:30) são descartados,
// para não disparar num dia em que o turno nem existe.
export function horariosDeAviso(turno, diaSemana) {
  const { hora, minuto } = horarioDoTurno(turno, diaSemana)
  const base = hora * 60 + minuto
  const antecedencias = Array.isArray(turno?.avisos) && turno.avisos.length > 0
    ? turno.avisos
    : AVISOS_PADRAO
  return [...new Set(antecedencias.map(a => inteiro(a, 0)))]
    .map(antes => ({ antes, minutos: base - Math.max(0, antes) }))
    .filter(a => a.minutos >= 0)
    .sort((a, b) => a.minutos - b.minutos)
    .map(a => ({
      antes: a.antes,
      hora: Math.floor(a.minutos / 60),
      minuto: a.minutos % 60,
    }))
}

// Descrição curta do aviso, para mostrar no cadastro.
export function rotuloAntecedencia(minutos) {
  const m = inteiro(minutos, 0)
  if (m <= 0) return 'na hora'
  if (m < 60) return `${m} min antes`
  const h = m / 60
  return `${Number.isInteger(h) ? h : h.toFixed(1).replace('.', ',')}h antes`
}
