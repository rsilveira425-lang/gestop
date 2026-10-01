import { prazoDoTurno } from './turnos.js'

// Cada setor fechado vale 1 ponto. Se o turno inteiro foi concluído dentro do
// prazo, cada setor dele vale +1 — o bônus é do time, não só de quem apertou
// o último botão. Quem fecha 4 setores num turno no prazo faz 8 pontos.
const PONTOS_BASE = 1
const PONTOS_BONUS_PRAZO = 1
// Folga depois do horário do turno: a loja fecha às 23:00 e a equipe ainda
// precisa de um tempo para limpar — o bônus vale até 23:30. A Abertura não
// tem essa folga: a equipe já chega com antecedência, então o horário limite
// é seco.
export const TOLERANCIA_PRAZO_MIN = 30

// Compara o instante inteiro, não só a hora: fechar à 00:30 um turno que vencia
// às 23:30 é atraso, mesmo que "00:30" seja menor que "23:30".
function dentroDoPrazo(checklist, turnoConfig) {
  if (!checklist.concluidoEm?.toDate) return false
  const tolerancia = turnoConfig?.nome === 'Fechamento' ? TOLERANCIA_PRAZO_MIN : 0
  const limite = prazoDoTurno(turnoConfig, checklist.data).getTime() + tolerancia * 60 * 1000
  return checklist.concluidoEm.toDate().getTime() <= limite
}

const chaveNome = nome => (nome || '').trim().toLowerCase()

// Agrega pontos por pessoa a partir dos setores fechados no período.
// `ignorar` tira do ranking quem não disputa — hoje, a conta do dono.
export function calcularRanking(checklists, turnos, { ignorar = [] } = {}) {
  const porTurno = Object.fromEntries(turnos.map(t => [t.nome, t]))
  const fora = new Set(ignorar)
  const registros = []

  for (const cl of checklists) {
    const turnoConfig = porTurno[cl.turno]
    const noPrazo = Boolean(cl.concluido && turnoConfig && dentroDoPrazo(cl, turnoConfig))
    const setores = Object.values(cl.setoresConcluidos || {})
    for (const s of setores) registros.push({ uid: s.porUid, nome: s.por, noPrazo })
    // Turno fechado pelo botão "Concluir Turno", sem nenhum setor registrado:
    // o ponto fica com quem concluiu, como na regra antiga.
    if (cl.concluido && setores.length === 0) {
      const quem = cl.concluidoPor || { uid: cl.funcionarioId, nome: cl.funcionarioNome }
      registros.push({ uid: quem?.uid, nome: quem?.nome, noPrazo })
    }
  }

  const porUid = {}, porNome = {}, nomesFora = new Set()
  const abrir = (uid, nome) => ({ uid, nome: (nome || '').trim() || 'Sem nome', pontos: 0, setores: 0, noPrazo: 0 })
  const pontuar = (p, noPrazo) => {
    p.setores += 1
    p.pontos += PONTOS_BASE
    if (noPrazo) { p.pontos += PONTOS_BONUS_PRAZO; p.noPrazo += 1 }
  }

  // Primeiro quem tem uid: é a identidade confiável, e o nome dela indexa o resto.
  for (const r of registros) {
    if (!r.uid) continue
    if (fora.has(r.uid)) { nomesFora.add(chaveNome(r.nome)); continue }
    const p = porUid[r.uid] || (porUid[r.uid] = abrir(r.uid, r.nome))
    if (r.nome) { p.nome = r.nome.trim(); porNome[chaveNome(r.nome)] = p }
    pontuar(p, r.noPrazo)
  }
  // Registros antigos não gravavam o uid de quem fechou o setor: entram pelo
  // nome e se juntam à pessoa certa quando ela já apareceu com uid.
  for (const r of registros) {
    if (r.uid) continue
    const chave = chaveNome(r.nome)
    if (nomesFora.has(chave)) continue
    const p = porNome[chave] || (porNome[chave] = abrir(`nome:${chave}`, r.nome))
    pontuar(p, r.noPrazo)
  }

  // Empate em pontos: fica na frente quem fechou mais setores dentro do prazo
  return [...new Set([...Object.values(porUid), ...Object.values(porNome)])]
    .sort((a, b) => b.pontos - a.pontos || b.noPrazo - a.noPrazo)
}
