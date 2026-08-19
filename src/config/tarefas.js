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

// Chave do grupo que a numeração respeita.
export function grupoDaTarefa(t) {
  return `${(t?.setorNome || '').trim()}__${(t?.turno || '').trim()}`
}

// Próximo número livre do grupo, para uma tarefa nova entrar no fim da lista.
export function proximaOrdem(tarefas, setor, turno) {
  const alvo = `${(setor || '').trim()}__${(turno || '').trim()}`
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
