# Mapa do projeto — o que é cada pasta e arquivo

Guia em português simples. Nada aqui é código: é só a legenda.

> **Legenda:** 🔒 = nome **obrigatório**, não pode ser traduzido (as ferramentas procuram
> por ele literalmente). 🙈 = escondido do explorer por ser gerado automaticamente.
> O nome entre **parênteses** é o termo em inglês usado no mundo React — ele fica ali
> de propósito, pra quando você buscar ajuda em tutorial, vídeo ou IA.

---

## 📁 Pastas da raiz

| Pasta | O que é, em português |
|---|---|
| `app (src)` | **O app em si.** É aqui que você mexe. Todo o resto é apoio. |
| `arquivos-publicos (public)` | **Arquivos soltos** que vão pro site como estão: ícones, logo, favicon, service worker. |
| `rascunho-landing (landing-lab)` | **Rascunho da página de vendas.** Área separada pra testar o visual sem mexer no app de verdade. |
| 🔒 `api` | **Robôs de bastidor.** Código que roda no servidor. Hoje: envio de lembretes e recebimento de pagamentos. **Não pode mudar de nome** — a Vercel procura literalmente por uma pasta chamada `api`. |
| 🙈 `node_modules` | **Bibliotecas de terceiros** (React, Firebase). Baixado automaticamente. Escondida do explorer. |
| 🙈 `dist` | **O app "montado" e pronto pra publicar.** Gerado automaticamente a cada publicação. Escondida do explorer. |

> 🙈 = **escondida**, não apagada. Se quiser ver de novo, abra `.vscode/settings.json`
> e troque `true` por `false` na linha da pasta.

## 📄 Arquivos da raiz

No explorer eles aparecem **agrupados embaixo de `package.json`** — clique na setinha
pra expandir. São todos nomes obrigatórios (as ferramentas procuram por eles) e,
na prática, você quase nunca precisa abrir nenhum.

| Arquivo | O que é, em português |
|---|---|
| 🔒 `package.json` | **A lista de ingredientes.** Quais bibliotecas o projeto usa e quais comandos existem (`npm run dev`, `npm run build`). |
| 🔒 `package-lock.json` | **A nota fiscal detalhada** do arquivo acima: versão exata de cada biblioteca. |
| 🔒 `index.html` | **A página em branco** onde o app inteiro é injetado. |
| 🔒 `vite.config.js` | **Configuração da ferramenta** que monta o app. É aqui que está escrito onde ficam as pastas renomeadas. |
| 🔒 `vercel.json` | **Configuração da hospedagem** (Vercel). |
| 🔒 `firebase.json` / `.firebaserc` | **Configuração do banco de dados** e qual projeto Firebase é o seu. |
| 🔒 `firestore.rules` | **As regras de segurança do banco.** Quem pode ler e escrever o quê. Arquivo sensível. |
| 🔒 `.env` | **Suas senhas e chaves secretas.** ⚠️ NUNCA compartilhe. |
| 🔒 `.env.example` | **Modelo do arquivo acima, sem as senhas.** |
| 🔒 `.gitignore` | **Lista do que o Git deve ignorar.** |
| 🔒 `eslint.config.js` | **O corretor ortográfico do código.** |
| `README.md` | Instruções de como rodar o projeto. |
| `MAPA-DO-PROJETO.md` | **Este arquivo.** |

## 📁 Dentro de `app (src)` — o app de verdade

> O nome em **parênteses** é o padrão em inglês usado no mundo React. Ele fica ali de
> propósito: quando você buscar ajuda num tutorial, vídeo ou IA, vão falar desse nome.

| Pasta / arquivo | O que é, em português |
|---|---|
| 🔒 `main.jsx` | **O botão de ligar.** Primeiro arquivo que roda. Só liga o app e sai. |
| `App.jsx` | **O mapa de endereços.** Define qual tela aparece em cada link (`/login`, `/dashboard`...). |
| `telas (pages)` | **As telas do app.** Uma pasta por tela. Se você quer mudar algo que o usuário VÊ, é aqui. |
| `componentes (design)` | **As peças de Lego reutilizáveis.** Botão, Card, Modal, Badge — usados em várias telas. Mudar aqui muda em todo lugar. |
| `ajustes (config)` | **Os ajustes do negócio.** Preços, regras de pontuação, horários de turno, textos de lembrete. Mexer aqui não exige programar muito. |
| `conexoes (services)` | **As conexões com o mundo externo:** banco de dados (Firebase) e notificações no celular (push). |
| `memoria-global (contexts)` | **A memória compartilhada do app.** Hoje: quem é o usuário logado — informação que todas as telas precisam saber. |
| `atalhos (hooks)` | **Atalhos de código reaproveitáveis.** Hoje: buscar os dados do restaurante. |
| `estilos (styles)` | **O estilo visual global:** cores, fontes, espaçamentos que valem pro app inteiro. |
| `imagens (assets)` | **Imagens usadas dentro do app** (hoje: a imagem do topo da landing). |

---

## 📁 Dentro de `src/telas (pages)` — tela por tela

| Pasta | Qual tela é |
|---|---|
| `pagina-de-vendas (landing)` | A primeira coisa que um visitante vê. |
| `login-e-cadastro (auth)` | **Entrar e criar conta.** Login, Cadastro, Recuperar senha, Entrar num restaurante. |
| `primeiros-passos (onboarding)` | Quem acabou de se cadastrar: cria setores → tarefas → colaboradores. |
| `painel-colaborador (dashboard)` | **Tela principal do colaborador.** As tarefas do dia dele. |
| `painel-gestor (gestor)` | **Tela principal do gestor.** Visão de tudo que a equipe está fazendo. |
| `tarefas` | **Gerenciar tarefas** — criar, editar, excluir. |
| `equipe` | **Gerenciar a equipe** — colaboradores. |
| `gamificacao` | **Pontos, rankings e conquistas.** |
| `historico` | **O que já foi feito**, dias anteriores. |
| `pagamento (billing)` | **Cobrança.** Tela de "assine para continuar" (paywall). |
| `juridico (legal)` | **Política de privacidade** e textos legais. |

> As quatro sem parênteses (`tarefas`, `equipe`, `gamificacao`, `historico`) já eram
> palavras em português — não precisavam de tradução.

---

## 📁 Dentro de `api` — o que roda no servidor

| Arquivo | O que faz |
|---|---|
| `enviar-lembretes.js` | Dispara as notificações de lembrete de tarefa. |
| `mp-webhook.js` | Recebe o aviso do Mercado Pago quando alguém paga. |
