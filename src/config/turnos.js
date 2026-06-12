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
