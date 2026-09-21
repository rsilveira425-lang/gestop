# Ideias para o Gestop

Ideias que ainda não viraram código. Cada uma diz o que é, por que vale a pena
e um rascunho de como fazer — para decidir depois, com calma.

---

## 🔔 Resumo do turno por notificação para a gestão

*Anotada em 17/09/2026.*

### A ideia
Quando cada turno termina, os gestores recebem no celular um resumo de como
ele fechou: se foi concluído, se foi no prazo e o que ficou para trás.

### Por que vale a pena
A análise de setembro da TBB mostrou que só 7 de 20 turnos foram concluídos, e o
gestor só descobre isso abrindo o histórico. Alguns turnos tinham tudo respondido,
mas travaram por um "não" sem comentário. Com o aviso na hora, dá para cobrar no
mesmo dia, e não na semana seguinte.

### Exemplos de mensagem

| Situação | Notificação |
|---|---|
| Tudo certo | ✅ **Fechamento concluído no prazo** — 23:12 por Júlio. 48/48 tarefas, nenhum problema. |
| Concluído com ressalvas | ⚠️ **Abertura concluída com 2 "não"** — Brownie abaixo do mínimo ("será produzido essa semana"); item pausado no delivery. |
| Atrasado | 🕐 **Abertura concluída com 1h07 de atraso** — 19:07 por Thayla. |
| Não concluído | ❌ **Fechamento não foi concluído** — 30/48 respondidas. Faltou: Cozinha, Porções. Travado: "não" sem comentário em Porções. |
| Nem começou | ❌ **Fechamento não foi iniciado hoje.** |

Tocar na notificação abre o histórico daquele turno.

### Quando dispara
1. **Na conclusão:** quando alguém conclui o turno, sai o resumo na hora (✅, ⚠️ ou 🕐).
2. **No prazo final:** passou o horário do turno + 30 min de tolerância e ele não foi
   concluído → sai o ❌ com o que faltou. É a mesma folga do bônus do ranking.

### O que já existe e dá para reaproveitar
- **Envio de notificação:** `api/enviar-lembretes.js` já manda push para os
  aparelhos cadastrados, e o agendador já chama ele a cada poucos minutos.
  O gatilho 2 cabe ali dentro.
- **Trava contra aviso repetido:** a coleção `lembretes` já faz isso; o resumo usa a
  mesma ideia, com uma chave por dia + turno.
- **Cálculo do prazo:** `prazoDoTurno` + `TOLERANCIA_PRAZO_MIN` (usados no ranking).
- **O que ficou para trás:** a mesma conta da análise — tarefas sem resposta,
  "não" (com o comentário), setores não fechados, fotos obrigatórias faltando.

### O que falta decidir
- **Quem recebe?** Hoje o app só tem "dono" e "funcionário". Precisa de um jeito de
  marcar quem é gestor (ex.: a Thayla) para receber o resumo sem ser dono.
- **Resumo da equipe também?** Pode ser útil a equipe receber só o ❌
  ("o fechamento ficou incompleto"), sem os detalhes.
- **Um resumo do dia inteiro** (ex.: às 02:00, na virada do dia de operação) em vez de,
  ou além de, um por turno?
- **Silenciar** o ✅ e mandar só quando houver problema, para não virar ruído?
