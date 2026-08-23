// Decide quais lembretes devem sair num dado instante.
//
// Mantido puro de propósito: quem chama informa a hora já convertida para o
// fuso do restaurante. Assim dá para testar horário de fim de semana e virada
// de dia sem depender do relógio da máquina.
import { horariosDeAviso, rotuloAntecedencia } from './turnos.js'

// Quantos minutos para trás o disparo olha. Precisa ser maior que o intervalo
// do agendador, senão um aviso pode cair entre duas execuções e nunca sair.
export const JANELA_PADRAO = 15

// `agora` = { hora, minuto, diaSemana }. Devolve os avisos cuja hora caiu
// dentro da janela — o de menor antecedência primeiro, que é o mais urgente.
export function avisosDevidos({ turnos = [], agora, janelaMinutos = JANELA_PADRAO }) {
  const minutosAgora = agora.hora * 60 + agora.minuto
  const devidos = []
  for (const turno of turnos) {
    for (const h of horariosDeAviso(turno, agora.diaSemana)) {
      const minutosAviso = h.hora * 60 + h.minuto
      const atraso = minutosAgora - minutosAviso
      if (atraso >= 0 && atraso < janelaMinutos) {
        devidos.push({ turno: turno.nome, antes: h.antes, hora: h.hora, minuto: h.minuto })
      }
    }
  }
  return devidos.sort((a, b) => a.antes - b.antes)
}

// Chave de um lembrete já enviado, para não repetir se o agendador rodar duas
// vezes na mesma janela.
export function chaveLembrete(data, turno, antes) {
  return `${data}_${String(turno).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}_${antes}`
}

// O texto que chega no celular. Ser específico é o que faz a pessoa agir —
// "faltam 30 min e está em 4 de 12" funciona, "não esqueça" vira paisagem.
export function textoDoAviso({ turno, antes, feitas = 0, total = 0 }) {
  const restantes = Math.max(0, total - feitas)
  if (antes <= 0) {
    return {
      titulo: `${turno}: hora do checklist`,
      corpo: total > 0 && feitas > 0
        ? `Está em ${feitas} de ${total}. Faltam ${restantes}.`
        : 'Checklist liberado. Bora começar!',
    }
  }
  return {
    titulo: `${turno}: ${rotuloAntecedencia(antes).replace(' antes', '')}`,
    corpo: total > 0
      ? `Checklist em ${feitas} de ${total} — ${restantes === 1 ? 'falta 1 tarefa' : `faltam ${restantes} tarefas`}.`
      : 'Checklist ainda não começou.',
  }
}

// Um aviso só faz sentido se o turno tem tarefas e ainda não terminou.
// Quem já fechou o checklist não é incomodado — notificação que chega depois
// de feito é a que faz a equipe desligar tudo.
export function deveAvisar({ total = 0, feitas = 0, concluido = false }) {
  if (total === 0) return false
  if (concluido) return false
  return feitas < total
}
