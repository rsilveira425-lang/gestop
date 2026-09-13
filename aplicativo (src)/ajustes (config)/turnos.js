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

// O dia de operação não vira à meia-noite: a equipe do fechamento limpa a loja
// e muitas vezes termina o checklist depois das 00h. Até esta hora da madrugada,
// tudo ainda conta como o dia anterior — ninguém sai depois da 01:00.
export const HORA_VIRADA = 2

const formatarData = d =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

// A data (AAAA-MM-DD) do dia de operação em que o instante `d` cai.
export function dataOperacional(d = new Date()) {
  const ref = new Date(d)
  if (ref.getHours() < HORA_VIRADA) ref.setDate(ref.getDate() - 1)
  return formatarData(ref)
}

// Minutos contados a partir do início do dia de operação: 00:30 vira 24:30,
// para ficar depois das 23:00 em qualquer comparação.
export function minutosOperacionais(hora, minuto = 0) {
  return (hora < HORA_VIRADA ? hora + 24 : hora) * 60 + minuto
}

// Dia da semana (0–6) de uma data AAAA-MM-DD.
export function diaSemanaDe(dataStr) {
  const [ano, mes, dia] = dataStr.split('-').map(Number)
  return new Date(ano, mes - 1, dia).getDay()
}

// O instante exato em que o turno vence num dia de operação — um limite de
// 00:30 cai na madrugada do dia seguinte no calendário.
export function prazoDoTurno(turno, dataStr) {
  const [ano, mes, dia] = dataStr.split('-').map(Number)
  const { hora, minuto } = horarioDoTurno(turno, diaSemanaDe(dataStr))
  return new Date(ano, mes - 1, hora < HORA_VIRADA ? dia + 1 : dia, hora, minuto)
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
// `diaSemana` é o do dia de operação. Um turno de 00:30 pertence ao fim desse
// dia, então o aviso de 1h antes sai às 23:30. Avisos que cairiam antes da
// virada do dia (ex.: 1h antes de 02:30) são descartados.
export function horariosDeAviso(turno, diaSemana) {
  const { hora, minuto } = horarioDoTurno(turno, diaSemana)
  const base = minutosOperacionais(hora, minuto)
  const antecedencias = Array.isArray(turno?.avisos) && turno.avisos.length > 0
    ? turno.avisos
    : AVISOS_PADRAO
  return [...new Set(antecedencias.map(a => inteiro(a, 0)))]
    .map(antes => ({ antes, minutos: base - Math.max(0, antes) }))
    .filter(a => a.minutos >= HORA_VIRADA * 60)
    .sort((a, b) => a.minutos - b.minutos)
    .map(a => ({
      antes: a.antes,
      hora: Math.floor(a.minutos / 60) % 24,
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
