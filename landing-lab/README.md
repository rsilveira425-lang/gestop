# Landing Lab

Rascunho da landing page, isolado da oficial. Nada aqui é usado pelo app de verdade —
o Gestop continua servindo `src/pages/landing/Landing.jsx` pra quem visita o site.

## Como abrir

Com o app rodando (`npm run dev`, na raiz do projeto), acesse:

```
http://localhost:5173/landing-lab/
```

Mesmo servidor, mesmo `npm run dev` — não precisa de nada extra instalado.

## Estrutura

```
landing-lab/
  index.html     ponto de entrada dessa página (separado do index.html oficial)
  main.jsx       monta a página sozinha, sem login/roteamento/Firebase
  Landing.jsx    a página em si — comece daqui, mexa à vontade
  README.md      este arquivo
```

`Landing.jsx` começou como uma cópia exata da versão oficial. O preço (`PRECO_MENSAL` etc.)
vem direto de `src/config/billing.js` — não é uma cópia — pra nunca ficar desatualizado
aqui enquanto só o design/copy muda.

Os botões da página ("Teste grátis", "Entrar"...) não navegam pra lugar nenhum de verdade
aqui — só mostram no console pra onde iriam. Não tem cadastro nem login nesse laboratório.

## Quando estiver pronta

Não é servida em nenhum lugar público — só existe em `npm run dev` local. Quando o design
estiver definido, o próximo passo é substituir o conteúdo de
`src/pages/landing/Landing.jsx` por essa versão (ajustando o import do `billing.js` de
volta pro caminho relativo `../../config/billing`) e apagar essa pasta.
