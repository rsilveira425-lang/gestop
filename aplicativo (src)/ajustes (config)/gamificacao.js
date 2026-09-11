import { horarioDoTurno } from './turnos'

// Turno concluído vale 1 ponto; se fechado dentro do horário limite do dia, +1 de bônus.
const PONTOS_BASE = 1
const PONTOS_BONUS_PRAZO = 1

function diaSemanaDe(dataStr) {
  const [ano, mes, dia] = dataStr.split('-').map(Number)
  return new Date(ano, mes - 1, dia).getDay()
}

function dentroDoPrazo(checklist, turnoConfig) {
  if (!checklist.concluidoEm?.toDate) return false
  const { hora, minuto } = horarioDoTurno(turnoConfig, diaSemanaDe(checklist.data))
  const fim = checklist.concluidoEm.toDate()
  return fim.getHours() * 60 + fim.getMinutes() <= hora * 60 + minuto
}

// Agrega pontos por funcionário a partir dos checklists concluídos no período.
// Quem fecha o turno (o último setor, ou quem aperta "Concluir Turno") leva o ponto —
// checklists antigos, de antes do campo concluidoPor existir, caem no criador como aproximação.
export function calcularRanking(checklists, turnos) {
  const porTurno = Object.fromEntries(turnos.map(t => [t.nome, t]))
  const porPessoa = {}
  checklists.filter(cl => cl.concluido).forEach(cl => {
    const quem = cl.concluidoPor || { uid: cl.funcionarioId, nome: cl.funcionarioNome }
    if (!quem?.uid) return
    if (!porPessoa[quem.uid]) porPessoa[quem.uid] = { uid: quem.uid, nome: quem.nome || 'Sem nome', pontos: 0, turnos: 0, noPrazo: 0 }
    const p = porPessoa[quem.uid]
    p.nome = quem.nome || p.nome
    p.turnos += 1
    p.pontos += PONTOS_BASE
    const turnoConfig = porTurno[cl.turno]
    if (turnoConfig && dentroDoPrazo(cl, turnoConfig)) { p.pontos += PONTOS_BONUS_PRAZO; p.noPrazo += 1 }
  })
  return Object.values(porPessoa).sort((a, b) => b.pontos - a.pontos)
}
