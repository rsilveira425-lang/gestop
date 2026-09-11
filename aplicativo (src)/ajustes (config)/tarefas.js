// Ordenação das tarefas do checklist.
//
// A ordem de execução vive no campo `ordem`, numerado dentro de cada grupo
// setor + turno — cada setor tem sua própria sequência em cada turno.
// Tarefas criadas antes da ordenação existir não têm o campo: elas caem no
// fim do setor, em ordem estável, até a tela de gerenciar tarefas numerá-las.

const setorDe = t => (t?.setorNome || '').trim().toLowerCase()
const ordemDe = t => (typeof t?.ordem === 'number' ? t.ordem : Infinity)

// Agrupa por setor e, dentro do setor, respeita a ordem definida pelo dono.
export function compararTarefas(a, b) {
  const sa = setorDe(a), sb = setorDe(b)
  if (sa !== sb) return sa.localeCompare(sb, 'pt-BR')
  const oa = ordemDe(a), ob = ordemDe(b)
  if (oa !== ob) return oa - ob
  // Desempate estável: sem isso, tarefas sem `ordem` trocam de lugar a cada carregamento
  return (a.criadoEm || '').localeCompare(b.criadoEm || '') || (a.id || '').localeCompare(b.id || '')
}

export function ordenarTarefas(tarefas) {
  return [...tarefas].sort(compararTarefas)
}

// Chave do grupo que a numeração respeita. Normalizada em minúsculas porque
// o Dashboard já agrupa setores sem diferenciar maiúscula de minúscula.
export function grupoDaTarefa(t) {
  return chaveGrupo(t?.setorNome, t?.turno)
}

export function chaveGrupo(setor, turno) {
  return `${(setor || '').trim().toLowerCase()}__${(turno || '').trim().toLowerCase()}`
}

// As tarefas de um grupo, já na ordem de execução.
export function tarefasDoGrupo(tarefas, setor, turno) {
  const alvo = chaveGrupo(setor, turno)
  return ordenarTarefas(tarefas.filter(t => grupoDaTarefa(t) === alvo))
}

// Próximo número livre do grupo, para uma tarefa nova entrar no fim da lista.
export function proximaOrdem(tarefas, setor, turno) {
  const alvo = chaveGrupo(setor, turno)
  const maior = tarefas.reduce((m, t) => (
    grupoDaTarefa(t) === alvo && typeof t.ordem === 'number' && t.ordem > m ? t.ordem : m
  ), -1)
  return maior + 1
}

// Numera tarefas que ainda não têm `ordem`, colocando-as no fim do seu grupo.
// Devolve só o que precisa ser gravado — quem chama decide como persistir.
export function calcularBackfill(tarefas) {
  const grupos = {}
  for (const t of tarefas) {
    const k = grupoDaTarefa(t)
    if (!grupos[k]) grupos[k] = []
    grupos[k].push(t)
  }
  const pendentes = []
  for (const grupo of Object.values(grupos)) {
    const semOrdem = grupo
      .filter(t => typeof t.ordem !== 'number')
      .sort((a, b) => (a.criadoEm || '').localeCompare(b.criadoEm || '') || (a.id || '').localeCompare(b.id || ''))
    if (semOrdem.length === 0) continue
    let proxima = grupo.reduce((m, t) => (typeof t.ordem === 'number' && t.ordem > m ? t.ordem : m), -1) + 1
    for (const t of semOrdem) pendentes.push({ id: t.id, ordem: proxima++ })
  }
  return pendentes
}

// Renumera um grupo a partir dos ids na ordem desejada e devolve só os
// documentos que realmente mudaram — evita gravar escrita à toa no Firestore.
export function aplicarNovaOrdem(tarefas, { setor, turno, ids }) {
  const porId = Object.fromEntries(tarefas.map(t => [t.id, t]))
  const mudancas = []
  ids.forEach((id, i) => {
    const t = porId[id]
    if (!t) return
    const patch = {}
    if (t.ordem !== i) patch.ordem = i
    if ((t.setorNome || '').trim().toLowerCase() !== (setor || '').trim().toLowerCase()) patch.setorNome = setor
    if ((t.turno || '').trim().toLowerCase() !== (turno || '').trim().toLowerCase()) patch.turno = turno
    if (Object.keys(patch).length > 0) mudancas.push({ id, ...patch })
  })
  return mudancas
}

// Move uma tarefa para uma posição — no mesmo grupo ou em outro setor/turno —
// e renumera os grupos afetados. `posicao` nula joga para o fim.
export function moverTarefa(tarefas, { tarefaId, paraSetor, paraTurno, posicao = null }) {
  const alvo = tarefas.find(t => t.id === tarefaId)
  if (!alvo) return []

  const origemSetor = alvo.setorNome, origemTurno = alvo.turno
  const destinoSetor = paraSetor != null ? paraSetor : alvo.setorNome
  const destinoTurno = paraTurno != null ? paraTurno : alvo.turno
  const mesmoGrupo = chaveGrupo(origemSetor, origemTurno) === chaveGrupo(destinoSetor, destinoTurno)

  const idsDestino = tarefasDoGrupo(tarefas, destinoSetor, destinoTurno)
    .filter(t => t.id !== tarefaId)
    .map(t => t.id)
  const pos = posicao == null ? idsDestino.length : Math.max(0, Math.min(posicao, idsDestino.length))
  idsDestino.splice(pos, 0, tarefaId)

  const mudancas = aplicarNovaOrdem(tarefas, { setor: destinoSetor, turno: destinoTurno, ids: idsDestino })
  if (!mesmoGrupo) {
    // O grupo de origem fica com um buraco na numeração; renumera também.
    const idsOrigem = tarefasDoGrupo(tarefas, origemSetor, origemTurno)
      .filter(t => t.id !== tarefaId)
      .map(t => t.id)
    mudancas.push(...aplicarNovaOrdem(tarefas, { setor: origemSetor, turno: origemTurno, ids: idsOrigem }))
  }
  return mudancas
}
