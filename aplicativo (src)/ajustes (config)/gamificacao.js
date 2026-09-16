import { prazoDoTurno } from './turnos.js'

// Turno concluído vale 1 ponto; se fechado até 30 min depois do horário limite do dia, +1 de bônus.
const PONTOS_BASE = 1
const PONTOS_BONUS_PRAZO = 1
// Folga depois do horário do turno: a loja fecha às 23:00 e a equipe ainda
// precisa de um tempo para limpar — o bônus vale até 23:30.
export const TOLERANCIA_PRAZO_MIN = 30

// Compara o instante inteiro, não só a hora: fechar à 00:30 um turno que vencia
// às 23:30 é atraso, mesmo que "00:30" seja menor que "23:30".
function dentroDoPrazo(checklist, turnoConfig) {
  if (!checklist.concluidoEm?.toDate) return false
  const limite = prazoDoTurno(turnoConfig, checklist.data).getTime() + TOLERANCIA_PRAZO_MIN * 60 * 1000
  return checklist.concluidoEm.toDate().getTime() <= limite
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
  // Empate em pontos: fica na frente quem fechou mais turnos dentro do prazo
  return Object.values(porPessoa).sort((a, b) => b.pontos - a.pontos || b.noPrazo - a.noPrazo)
}
