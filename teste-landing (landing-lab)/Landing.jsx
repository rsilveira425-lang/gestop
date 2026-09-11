// Importa a configuração de preço do app oficial (não uma cópia) — assim o preço
// nunca fica desatualizado aqui, só o design/copy desta página é livre pra mudar.
import { useCallback, useEffect, useState } from 'react'
import { PRECO_MENSAL, PRECO_FUNDADOR, VAGAS_FUNDADOR, DIAS_TRIAL } from '../aplicativo (src)/ajustes (config)/billing'

/* ============================================================
   ÍCONES — desenhados à mão, não emoji.
   Um só sistema: grade 24, traço 1.75, pontas redondas, currentColor.
   Trocar o tamanho é só passar size={n}.
   ============================================================ */

function Icone({ size = 24, children, ...resto }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false" {...resto}
    >
      {children}
    </svg>
  )
}

const IcCheck = (p) => <Icone {...p}><path d="M4 12.5 9 17.5 20 6.5" /></Icone>
const IcX = (p) => <Icone {...p}><path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5" /></Icone>







const IcTrofeu = (p) => (
  <Icone {...p}>
    <path d="M7.5 4h9v5a4.5 4.5 0 0 1-9 0z" />
    <path d="M7.5 5.5H5A2.5 2.5 0 0 0 7.5 10M16.5 5.5H19a2.5 2.5 0 0 1-2.5 4.5" />
    <path d="M12 13.5V17M8.5 20h7M9.8 20l.6-3h3.2l.6 3" />
  </Icone>
)


const IcFesta = (p) => (
  <Icone {...p}>
    <path d="M12 3v2.5M19.5 5.5 17.8 7.2M21 13h-2.5M4.5 13H7M6.2 5.5 7.9 7.2" />
    <path d="M13.2 10.8 4 20l11.5-4.2a1 1 0 0 0 .4-1.6l-1.1-1.1a1 1 0 0 0-1.6.4z" />
  </Icone>
)

const IcAntes = (p) => <Icone {...p}><path d="M15 5.5 8.5 12l6.5 6.5" /></Icone>
const IcDepois = (p) => <Icone {...p}><path d="M9 5.5 15.5 12 9 18.5" /></Icone>
const IcCadeado = (p) => (
  <Icone {...p}>
    <rect x="4.5" y="10.5" width="15" height="9.5" rx="2" />
    <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" />
  </Icone>
)

// Marca: um turno fechado — o arco do dia com a marca de concluído dentro.
function Marca({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="9" fill="var(--gs-action)" />
      <path d="M9 16.6 13.7 21 23 10.8" stroke="var(--gs-action-text)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ============================================================
   ARTE — geometria, não ilustração. Tudo desenhado com os tokens.
   ============================================================ */

// ============================================================
// HERO: o app por dentro, em leque.
// Tres iPhones desenhados em CSS. O da frente em evidencia, os dois
// de tras recuados e apagados pra dar profundidade sem competir.
// As telas sao DOM de verdade, nao imagem: sem asset pra manter,
// nitido em qualquer densidade e o texto continua sendo texto.
// ============================================================

const TELAS = [
  { id: 'checklist', nome: 'Checklist' },
  { id: 'painel', nome: 'Painel' },
  { id: 'ranking', nome: 'Ranking' },
]

// A prova por foto vive aqui dentro: toda tarefa fechada carrega a sua.
function MiniFoto() {
  return (
    <span className="gl-tl-mini" aria-hidden="true">
      <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid slice">
        <rect width="24" height="24" fill="var(--gs-slate-200)" />
        <rect y="15" width="24" height="9" fill="var(--gs-slate-300)" />
        <rect x="3" y="7" width="9" height="8" rx="1" fill="var(--gs-slate-400)" />
        <circle cx="17" cy="10" r="3.4" fill="var(--gs-slate-100)" />
      </svg>
    </span>
  )
}

const TAREFAS = [
  { t: 'Guardar insumos', ok: true },
  { t: 'Limpar bancada', ok: true },
  { t: 'Descartar óleo', ok: true },
  { t: 'Fechar gás', ok: true },
  { t: 'Higienizar chapa', ok: false, agora: true },
  { t: 'Varrer o salão', ok: false },
]

function TelaChecklist() {
  const feitas = TAREFAS.filter((x) => x.ok).length
  return (
    <div className="gl-tl">
      <div className="gl-tl-topo">
        <div>
          <span className="gl-tl-setor">Cozinha</span>
          <b className="gl-tl-titulo">Fechamento</b>
        </div>
        <span className="gl-tl-cont gl-num">{feitas}/{TAREFAS.length}</span>
      </div>
      <div className="gl-tl-prog"><div style={{ width: (feitas / TAREFAS.length) * 100 + '%' }} /></div>
      <ul className="gl-tl-lista">
        {TAREFAS.map((x) => (
          <li key={x.t} className={x.ok ? 'ok' : x.agora ? 'agora' : ''}>
            <span className="gl-tl-marca">{x.ok ? <IcCheck size={11} /> : null}</span>
            <span className="gl-tl-nome">{x.t}</span>
            {x.ok ? <MiniFoto /> : null}
          </li>
        ))}
      </ul>
      <div className="gl-tl-rodape">
        <button type="button" className="gl-tl-acao" tabIndex={-1}>Fechar turno</button>
        <span className="gl-tl-falta">Toda tarefa fecha com foto</span>
      </div>
    </div>
  )
}

function TelaPainel() {
  const turnos = [
    { n: 'Abertura', pct: 100, cor: 'var(--gs-success)', rot: '100%' },
    { n: 'Pico', pct: 67, cor: 'var(--gs-warning)', rot: '67%' },
    { n: 'Fechamento', pct: 56, cor: 'var(--gs-action)', rot: '5/9' },
  ]
  const reg = [
    { h: '22:41', o: 'Higienizou chapa' },
    { h: '22:18', o: 'Fechou gás' },
    { h: '21:55', o: 'Descartou óleo' },
  ]
  return (
    <div className="gl-tl">
      <div className="gl-tl-topo">
        <div>
          <span className="gl-tl-setor">Quinta, 12/03</span>
          <b className="gl-tl-titulo">Painel de hoje</b>
        </div>
        <span className="gl-tl-vivo"><i /> ao vivo</span>
      </div>
      <div className="gl-tl-turnos">
        {turnos.map((t) => (
          <div key={t.n} className="gl-tl-turno">
            <span>{t.n}</span>
            <div className="gl-tl-barra"><div style={{ width: t.pct + '%', background: t.cor }} /></div>
            <b className="gl-num">{t.rot}</b>
          </div>
        ))}
      </div>
      <span className="gl-tl-rot">Últimos registros</span>
      <ul className="gl-tl-reg">
        {reg.map((r) => (
          <li key={r.h}>
            <span className="gl-tl-hora gl-num">{r.h}</span>
            <span className="gl-tl-reg-o">{r.o}</span>
            <MiniFoto />
          </li>
        ))}
      </ul>
      <div className="gl-tl-rodape">
        <span className="gl-tl-falta">Atualiza sozinho, sem você pedir</span>
      </div>
    </div>
  )
}

function TelaRanking() {
  const gente = [
    { n: 'Marina R.', p: 248, pct: 100 },
    { n: 'Diego L.', p: 214, pct: 86 },
    { n: 'Paula S.', p: 197, pct: 79 },
    { n: 'Caio M.', p: 160, pct: 64 },
  ]
  return (
    <div className="gl-tl">
      <div className="gl-tl-topo">
        <div>
          <span className="gl-tl-setor">Equipe · 4 pessoas</span>
          <b className="gl-tl-titulo">Ranking de março</b>
        </div>
        <IcTrofeu size={17} style={{ color: 'var(--gs-amber-600)' }} />
      </div>
      <div className="gl-tl-ponto">
        <IcFesta size={15} />
        <div><b>Turno no horário</b><span>Marina ganhou +12</span></div>
      </div>
      <ul className="gl-tl-rank">
        {gente.map((g, i) => (
          <li key={g.n} className={i === 0 ? 'lider' : ''}>
            <span className="gl-tl-pos gl-num">{i + 1}</span>
            <span className="gl-tl-rank-n">{g.n}</span>
            <div className="gl-tl-barra"><div style={{ width: g.pct + '%' }} /></div>
            <b className="gl-num">{g.p}</b>
          </li>
        ))}
      </ul>
      <div className="gl-tl-rodape">
        <span className="gl-tl-falta">Reinicia todo dia 1º</span>
      </div>
    </div>
  )
}

const CONTEUDO = { checklist: <TelaChecklist />, painel: <TelaPainel />, ranking: <TelaRanking /> }
const INTERVALO = 3400

// Moldura sozinha, sem conteudo: so pra dar altura ao palco, ja que os
// tres aparelhos sao absolutos. Assim o leque acompanha qualquer largura.
function MolduraVazia() {
  return <div className="gl-fone gl-fone-medida" aria-hidden="true"><div className="gl-fone-tela" /></div>
}

function Esqueleto() {
  return (
    <div className="gl-esq" aria-hidden="true">
      <div className="gl-esq-cab"><i /><i /></div>
      <div className="gl-esq-bloco" />
      <div className="gl-esq-linhas">
        {Array.from({ length: 6 }, (_, i) => <i key={i} />)}
      </div>
      <div className="gl-esq-acao" />
    </div>
  )
}

function Fone({ tela, pos, ativo, aoClicar }) {
  // Sempre <div>, nunca alternando com <button>: trocar o tipo do elemento
  // faz o React remontar a subarvore inteira, e elemento recem-criado nao
  // tem valor anterior — a transicao de opacidade nao chegava a rodar.
  // Um <button> aqui tambem aninharia o "Fechar turno" dentro dele.
  // Os de tras sao alvo de clique so pro mouse: ficam fora da arvore de
  // acessibilidade porque as abas embaixo ja dao o mesmo caminho, com nome.
  return (
    <div
      className="gl-fone"
      data-pos={pos}
      aria-hidden={!ativo}
      onClick={pos === 0 ? undefined : aoClicar}
    >
      <div className="gl-fone-tela">
        <div className="gl-fone-ilha" />
        <div className="gl-fone-status">
          <span className="gl-num">22:41</span>
          <span className="gl-fone-sinal"><i /><i /><i /></span>
        </div>
        {/* As duas camadas existem sempre e dissolvem entre si. Trocar o
            conteudo de uma vez era o que dava o solavanco: a tela virava
            bloco cinza no mesmo instante, ainda na frente. */}
        <div className="gl-fone-camada gl-fone-real">{tela}</div>
        <div className="gl-fone-camada gl-fone-esq"><Esqueleto /></div>
      </div>
    </div>
  )
}

function CarrosselApp() {
  const [ativo, setAtivo] = useState(0)
  const [interagindo, setInteragindo] = useState(false)

  const vai = useCallback((i) => setAtivo(((i % TELAS.length) + TELAS.length) % TELAS.length), [])

  useEffect(() => {
    // Sem botao de pausa: quem segura o criterio de movimento e o hover, o
    // foco do teclado e o prefers-reduced-motion, que desliga o giro de vez.
    const menos = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (menos || interagindo) return
    // 'ativo' na lista de dependencias reinicia o relogio a cada troca, entao
    // um clique da a tela escolhida o intervalo inteiro antes de virar.
    const t = setInterval(() => {
      if (!document.hidden) setAtivo((a) => (a + 1) % TELAS.length)
    }, INTERVALO)
    return () => clearInterval(t)
  }, [ativo, interagindo])

  // 0 = frente, 1 = recuado a direita, -1 = recuado a esquerda
  const posicao = (i) => {
    const d = (i - ativo + TELAS.length) % TELAS.length
    return d === 0 ? 0 : d === 1 ? 1 : -1
  }

  const teclado = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); vai(ativo + 1) }
    if (e.key === 'ArrowLeft') { e.preventDefault(); vai(ativo - 1) }
  }

  return (
    <div className="gl-carrossel">
      <div
        className="gl-palco"
        role="group"
        aria-roledescription="carrossel"
        aria-label="Telas do app Gestop"
        tabIndex={0}
        onKeyDown={teclado}
        onMouseEnter={() => setInteragindo(true)}
        onMouseLeave={() => setInteragindo(false)}
        onFocus={() => setInteragindo(true)}
        onBlur={() => setInteragindo(false)}
      >
        <MolduraVazia />
        {TELAS.map((t, i) => {
          const pos = posicao(i)
          return (
            <Fone
              key={t.id}
              tela={CONTEUDO[t.id]}
              pos={pos}
              ativo={i === ativo}
              aoClicar={() => vai(ativo + pos)}
            />
          )
        })}
      </div>

      <div className="gl-carr-ctrl">
        {TELAS.map((t, i) => (
          <button
            key={t.id}
            type="button"
            className={'gl-carr-aba' + (i === ativo ? ' on' : '')}
            aria-current={i === ativo ? 'true' : undefined}
            onClick={() => vai(i)}
          >
            {t.nome}
          </button>
        ))}
      </div>
      {/* Enquanto gira sozinho, o anuncio fica desligado: avisar a cada 3s
          interromperia o leitor de tela sem parar. Com o ponteiro em cima ou
          o foco dentro, o giro para e o anuncio liga (APG, carrossel com
          rotacao automatica). */}
      <p className="sr-only" aria-live={interagindo ? 'polite' : 'off'}>
        Tela {ativo + 1} de {TELAS.length}: {TELAS[ativo].nome}
      </p>
    </div>
  )
}

// ============================================================
// RECURSOS EM ARCO
// Nove recursos em cards dispostos num arco: o do meio em foco, os
// vizinhos recuados e mais baixos. Nao gira sozinho — o telefone do
// hero ja e o momento animado da pagina, e dois carrosseis girando
// ao mesmo tempo transformariam a landing num slideshow.
// A sobreposicao entre cards cai sempre no padding, nunca no texto.
// ============================================================

const RECURSOS = [
  { id: 'checklists', tag: 'Rotina', titulo: 'Checklists por turno', desc: 'Abertura, pico e fechamento. Cada setor sabe o que fazer e quando.' },
  { id: 'foto', tag: 'Prova', titulo: 'Foto como prova', desc: 'A equipe registra com foto. Você confere sem precisar estar no salão.' },
  { id: 'alertas', tag: 'Rotina', titulo: 'Alertas de turno', desc: 'Turno não fechado no horário? O painel avisa antes de virar reclamação.' },
  { id: 'painel', tag: 'Gestão', titulo: 'Painel do gestor', desc: 'Cada turno em tempo real, do celular ou do computador, onde você estiver.' },
  { id: 'equipe', tag: 'Gestão', titulo: 'Gestão de equipe', desc: 'Funcionários entram com um código. Saiu da equipe, desativa na hora.' },
  { id: 'historico', tag: 'Gestão', titulo: 'Histórico completo', desc: 'Filtre por semana, mês ou período livre. Respostas, fotos e comentários.' },
  { id: 'ponto', tag: 'Equipe', titulo: 'Ponto por turno', desc: 'Fechou o turno, somou ponto. Fechou no horário, ganha bônus.' },
  { id: 'ranking', tag: 'Equipe', titulo: 'Ranking mensal', desc: 'Todo mês reinicia do zero. Você sabe quem se dedicou e premia quem merece.' },
  { id: 'festa', tag: 'Equipe', titulo: 'Comemoração na hora', desc: 'Confete e parabéns assim que o turno fecha, direto no celular.' },
]

function CarrosselRecursos() {
  const [ativo, setAtivo] = useState(0)
  const total = RECURSOS.length

  const vai = useCallback((i) => setAtivo(((i % total) + total) % total), [total])

  // Distancia circular: -4..4. Fora de |2| o card sai de cena.
  const desvio = (i) => {
    let d = i - ativo
    if (d > total / 2) d -= total
    if (d < -total / 2) d += total
    return d
  }

  const teclado = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); vai(ativo + 1) }
    if (e.key === 'ArrowLeft') { e.preventDefault(); vai(ativo - 1) }
  }

  return (
    <div
      className="gl-cc"
      role="group"
      aria-roledescription="carrossel"
      aria-label="Recursos do Gestop"
      onKeyDown={teclado}
    >
      <div className="gl-cc-arco">
        {RECURSOS.map((r, i) => {
          const d = desvio(i)
          const fora = Math.abs(d) > 2
          return (
            <button
              key={r.id}
              type="button"
              className="gl-cc-card"
              data-off={fora ? 'fora' : d}
              aria-hidden={fora}
              tabIndex={fora ? -1 : 0}
              aria-current={d === 0 ? 'true' : undefined}
              onClick={() => vai(i)}
            >
              <span className="gl-cc-tag">{r.tag}</span>
              <span className="gl-cc-titulo">{r.titulo}</span>
              <span className="gl-cc-desc">{r.desc}</span>
            </button>
          )
        })}
      </div>

      <p className="gl-cc-conta">
        <b className="gl-num">{String(ativo + 1).padStart(2, '0')}</b>
        <span className="gl-num">de {String(total).padStart(2, '0')}</span>
      </p>

      <div className="gl-cc-ctrl">
        <button type="button" className="gl-cc-seta" aria-label="Recurso anterior" onClick={() => vai(ativo - 1)}>
          <IcAntes size={18} />
        </button>
        <div className="gl-cc-pontos">
          {RECURSOS.map((r, i) => (
            <button
              key={r.id}
              type="button"
              className={'gl-cc-ponto' + (i === ativo ? ' on' : '')}
              aria-label={r.titulo}
              aria-current={i === ativo ? 'true' : undefined}
              onClick={() => vai(i)}
            />
          ))}
        </div>
        <button type="button" className="gl-cc-seta" aria-label="Próximo recurso" onClick={() => vai(ativo + 1)}>
          <IcDepois size={18} />
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        Recurso {ativo + 1} de {total}: {RECURSOS[ativo].titulo}
      </p>
    </div>
  )
}

export default function Landing({ onNavigate }) {
  const ir = (r) => () => onNavigate(r)

  return (
    <div className="gl">
      <style>{`
/* ============================================================
   LANDING DO GESTOP
   Sem paleta própria: tudo vem dos tokens do design system
   (aplicativo (src)/componentes (design)/tokens.css).
   Se precisar de uma cor nova, ela nasce lá — nunca aqui.
   ============================================================ */

.gl{
  /* Saida exponencial pro carrossel: o movimento desacelera ate parar.
     Fica no escopo da landing — nao e decisao de marca pro design system. */
  --gl-ease-saida:cubic-bezier(.22,1,.36,1);
  font-family:var(--gs-font);
  color:var(--gs-text);
  background:var(--gs-surface);
  line-height:var(--gs-leading-normal);
  -webkit-font-smoothing:antialiased;
  overflow-x:hidden;
}
.gl *{box-sizing:border-box}
.gl h1,.gl h2,.gl h3{margin:0;line-height:var(--gs-leading-tight);letter-spacing:var(--gs-tracking-tight);text-wrap:balance}
.gl p{margin:0}
.gl a{color:inherit;text-decoration:none}

/* --- Superfícies do browser: as partes que a gente não desenha, mas continuam nossas --- */
.gl ::selection{background:var(--gs-blue-200);color:var(--gs-navy-950)}
.gl .gl-escuro ::selection{background:var(--gs-blue-400);color:var(--gs-navy-950)}
.gl{scrollbar-color:var(--gs-slate-300) transparent;caret-color:var(--gs-action)}
.gl a:not(.gl-btn){text-underline-offset:3px;text-decoration-thickness:1px}
.gl :focus-visible{outline:none;box-shadow:var(--gs-focus-ring);border-radius:var(--gs-radius-sm)}
.gl .gl-escuro :focus-visible{box-shadow:0 0 0 3px var(--gs-blue-400)}
.gl .gl-num{font-variant-numeric:tabular-nums;letter-spacing:0}

/* --- Estrutura --- */
.gl-wrap{width:100%;max-width:var(--gs-container);margin:0 auto;padding:0 var(--gs-space-6)}
.gl-sec{padding:var(--gs-space-20) 0}
.gl-escuro{background:var(--gs-surface-dark);color:var(--gs-text-on-dark)}
.gl-claro{background:var(--gs-bg)}

/* Título de seção: alinhado à esquerda, não centralizado — a página inteira
   centralizada é o que faz tudo parecer o mesmo template. */
.gl-titulo{font-size:var(--gs-text-4xl);font-weight:var(--gs-weight-black);max-width:19ch}
.gl-sub{color:var(--gs-text-muted);font-size:var(--gs-text-lg);max-width:52ch;text-wrap:pretty;margin-top:var(--gs-space-4)}
.gl-escuro .gl-sub{color:var(--gs-text-on-dark-muted)}
.gl-cab{margin-bottom:var(--gs-space-12)}

/* --- Botões --- */
.gl-btn{
  display:inline-flex;align-items:center;justify-content:center;gap:var(--gs-space-2);
  min-height:var(--gs-tap-target);
  font-family:inherit;font-weight:var(--gs-weight-bold);font-size:var(--gs-text-lg);
  border:0;border-radius:var(--gs-radius-md);padding:var(--gs-space-3) var(--gs-space-6);
  cursor:pointer;white-space:nowrap;
  transition:background var(--gs-duration-base) var(--gs-ease),
             transform var(--gs-duration-fast) var(--gs-ease),
             box-shadow var(--gs-duration-base) var(--gs-ease);
}
.gl-btn svg{flex:none}
.gl-btn-1{background:var(--gs-action);color:var(--gs-action-text);box-shadow:var(--gs-shadow-sm)}
.gl-escuro .gl-btn-1{box-shadow:none}
.gl-btn-1:hover{background:var(--gs-action-hover);transform:translateY(-1px)}
.gl-btn-1:active{background:var(--gs-action-active);transform:translateY(0)}
.gl-btn-2{background:transparent;color:var(--gs-text);box-shadow:inset 0 0 0 1px var(--gs-border-strong)}
.gl-btn-2:hover{background:var(--gs-surface-sunken)}
.gl-escuro .gl-btn-2{color:var(--gs-text-on-dark);box-shadow:inset 0 0 0 1px var(--gs-border-on-dark)}
.gl-escuro .gl-btn-2:hover{background:rgba(255,255,255,.08)}
.gl-btn-claro{background:var(--gs-white);color:var(--gs-action)}
.gl-btn-claro:hover{background:var(--gs-blue-50);transform:translateY(-1px)}
.gl-btn-bloco{width:100%}

/* --- Nav --- */
.gl-nav{position:sticky;top:0;z-index:var(--gs-z-sticky);background:var(--gs-navy-950);border-bottom:1px solid var(--gs-border-on-dark)}
.gl-nav-row{display:flex;align-items:center;justify-content:space-between;gap:var(--gs-space-4);height:68px}
.gl-logo{display:flex;align-items:center;gap:var(--gs-space-3);font-weight:var(--gs-weight-black);font-size:var(--gs-text-xl);letter-spacing:var(--gs-tracking-tight);color:var(--gs-text-on-dark)}
.gl-nav-links{display:flex;align-items:center;gap:var(--gs-space-1)}
.gl-nav-links a{display:none;color:var(--gs-text-on-dark-muted);font-weight:var(--gs-weight-medium);font-size:var(--gs-text-md);padding:var(--gs-space-2) var(--gs-space-3);border-radius:var(--gs-radius-sm);transition:color var(--gs-duration-base) var(--gs-ease)}
.gl-nav-links a:hover{color:var(--gs-text-on-dark)}
.gl-nav-entrar{display:inline-flex;align-items:center;background:none;border:0;font-family:inherit;font-size:var(--gs-text-md);font-weight:var(--gs-weight-medium);color:var(--gs-text-on-dark-muted);cursor:pointer;padding:var(--gs-space-2) var(--gs-space-3);border-radius:var(--gs-radius-sm)}
.gl-nav-entrar:hover{color:var(--gs-text-on-dark)}
.gl-nav .gl-btn{font-size:var(--gs-text-md);padding:var(--gs-space-2) var(--gs-space-5);min-height:40px}
@media(min-width:880px){.gl-nav-links a{display:inline-flex;align-items:center}}

/* --- Hero --- */
/* Mesmos tokens de navy do --gs-gradient-hero, sem o halo radial: aquele brilho
   flutuante é decoração reflexa, e a cor sólida embaixo garante o contraste
   do texto mesmo se o degradê não pintar. */
.gl-hero{background-color:var(--gs-navy-950);background-image:linear-gradient(180deg,var(--gs-navy-950),var(--gs-navy-900) 58%,var(--gs-navy-800));padding:var(--gs-space-16) 0 var(--gs-space-20)}
.gl-hero-grid{display:grid;gap:var(--gs-space-12);align-items:center}
@media(min-width:960px){.gl-hero-grid{grid-template-columns:1.02fr .98fr;gap:var(--gs-space-10)}}
.gl-hero h1{font-size:var(--gs-text-5xl);font-weight:var(--gs-weight-black);color:var(--gs-text-on-dark);max-width:15ch}
.gl-hero-checks{list-style:none;margin:var(--gs-space-8) 0 var(--gs-space-8);padding:0;display:grid;gap:var(--gs-space-4);max-width:52ch}
.gl-hero-checks li{display:flex;gap:var(--gs-space-3);align-items:flex-start;color:var(--gs-text-on-dark-muted);font-size:var(--gs-text-lg)}
.gl-hero-checks strong{color:var(--gs-text-on-dark);font-weight:var(--gs-weight-bold)}
.gl-hero-checks svg{flex:none;margin-top:5px;color:var(--gs-blue-400)}
.gl-hero-cta{display:flex;flex-wrap:wrap;gap:var(--gs-space-3)}
.gl-trust{display:flex;align-items:flex-start;gap:var(--gs-space-2);color:var(--gs-text-on-dark-muted);font-size:var(--gs-text-md);margin-top:var(--gs-space-6)}
.gl-trust svg{flex:none;margin-top:3px;color:var(--gs-green-300)}
.gl-hero-art{display:flex;justify-content:center}

/* --- Hero: os tres iPhones em leque --- */
.sr-only{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;clip-path:inset(50%)!important;white-space:nowrap!important;border:0!important}
.gl-carrossel{display:grid;justify-items:center;gap:var(--gs-space-6);width:100%}

/* O palco: largura total, e os aparelhos se posicionam dentro dele.
   --pw e a largura de cada aparelho em % do palco. */
.gl-palco{--pw:56%;position:relative;width:100%;max-width:440px;border-radius:var(--gs-radius-lg)}
.gl-palco:focus-visible{outline:none;box-shadow:0 0 0 3px var(--gs-blue-400)}
@media(max-width:719px){.gl-palco{--pw:72%}}

.gl-fone{
  position:absolute;top:0;left:50%;width:var(--pw);margin-left:calc(var(--pw) / -2);
  background:var(--gs-navy-950);border:0;border-radius:13%/6.2%;padding:2.6%;
  font:inherit;color:inherit;text-align:inherit;
  box-shadow:var(--gs-shadow-lg);
  transform-origin:center center;
  transition:transform 680ms var(--gl-ease-saida),opacity 680ms var(--gl-ease-saida),filter 680ms var(--gl-ease-saida);
}
/* a moldura de medida fica no fluxo, invisivel, so pra dar altura ao palco */
.gl-fone-medida{position:relative;left:auto;margin-left:auto;margin-inline:auto;visibility:hidden;box-shadow:none}

.gl-fone[data-pos="0"]{z-index:3;opacity:1;transform:translateX(0) scale(1);filter:none}
.gl-fone[data-pos="1"]{z-index:2;opacity:.5;transform:translateX(46%) scale(.84);filter:grayscale(.55)}
.gl-fone[data-pos="-1"]{z-index:2;opacity:.5;transform:translateX(-46%) scale(.84);filter:grayscale(.55)}
/* clicar no aparelho da direita avanca, no da esquerda volta */
.gl-fone[data-pos="1"],.gl-fone[data-pos="-1"]{cursor:pointer}
.gl-fone[data-pos="1"]:hover,.gl-fone[data-pos="-1"]:hover{opacity:.72;filter:grayscale(.25)}
@media(max-width:719px){
  /* no celular o leque nao cabe: so o da frente, e o que sumiu nao clica */
  .gl-fone[data-pos="1"],.gl-fone[data-pos="-1"]{opacity:0;pointer-events:none}
}
@media(prefers-reduced-motion:reduce){.gl-fone{transition:none}}

.gl-fone-tela{
  position:relative;overflow:hidden;
  border-radius:11%/5.4%;background:var(--gs-bg);
  aspect-ratio:390/844;color:var(--gs-text);
}
.gl-fone-camada{
  position:absolute;inset:0;padding:38px 6% 5%;
  transition:opacity 680ms var(--gs-ease);
}
/* visibility entra com atraso igual a duracao: durante o dissolver a camada
   continua pintada, e so some de vez quando a troca termina. Assim ela nao
   recebe clique nem aparece pra leitor de tela fora de hora. */
.gl-fone[data-pos="0"] .gl-fone-real,
.gl-fone:not([data-pos="0"]) .gl-fone-esq{
  opacity:1;visibility:visible;
  transition:opacity 680ms var(--gs-ease),visibility 0s;
}
.gl-fone:not([data-pos="0"]) .gl-fone-real,
.gl-fone[data-pos="0"] .gl-fone-esq{
  opacity:0;visibility:hidden;
  transition:opacity 680ms var(--gs-ease),visibility 0s 680ms;
}
@media(prefers-reduced-motion:reduce){
  .gl-fone-camada{transition:none}
  .gl-fone[data-pos="0"] .gl-fone-real,.gl-fone:not([data-pos="0"]) .gl-fone-esq{transition:none}
  .gl-fone:not([data-pos="0"]) .gl-fone-real,.gl-fone[data-pos="0"] .gl-fone-esq{transition:none}
}
.gl-fone-ilha{position:absolute;z-index:3;top:9px;left:50%;transform:translateX(-50%);width:27%;height:17px;border-radius:var(--gs-radius-pill);background:var(--gs-navy-950)}
.gl-fone-status{position:absolute;z-index:2;top:0;left:0;right:0;height:34px;display:flex;align-items:center;justify-content:space-between;padding:0 7%;font-size:11px;font-weight:var(--gs-weight-bold);color:var(--gs-text)}
.gl-fone-sinal{display:inline-flex;align-items:flex-end;gap:2px}
.gl-fone-sinal i{width:3px;border-radius:1px;background:var(--gs-text)}
.gl-fone-sinal i:nth-child(1){height:4px}
.gl-fone-sinal i:nth-child(2){height:7px}
.gl-fone-sinal i:nth-child(3){height:10px}

/* --- Conteudo das telas --- */
.gl-tl{display:flex;flex-direction:column;gap:8px;height:100%}
.gl-tl-topo{display:flex;justify-content:space-between;align-items:flex-start;gap:6px}
.gl-tl-setor{display:block;font-size:11px;font-weight:var(--gs-weight-bold);color:var(--gs-action);line-height:1.2}
.gl-tl-titulo{display:block;font-size:15px;font-weight:var(--gs-weight-black);letter-spacing:var(--gs-tracking-tight);line-height:1.2;margin-top:1px}
.gl-tl-cont{font-size:12px;font-weight:var(--gs-weight-bold);color:var(--gs-text-muted);white-space:nowrap}
.gl-tl-vivo{display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--gs-text-muted);white-space:nowrap}
.gl-tl-vivo i{width:5px;height:5px;border-radius:50%;background:var(--gs-success)}
.gl-tl-rot{font-size:11px;font-weight:var(--gs-weight-bold);color:var(--gs-text-muted);margin-top:2px}
.gl-tl-hora{font-size:11px;color:var(--gs-text-muted);white-space:nowrap}
.gl-tl-barra{height:5px;border-radius:var(--gs-radius-pill);background:var(--gs-surface-sunken);overflow:hidden}
.gl-tl-barra div{height:100%;border-radius:inherit;background:var(--gs-action)}
.gl-tl-mini{flex:none;display:block;width:18px;height:18px;border-radius:4px;overflow:hidden}
.gl-tl-mini svg{width:100%;height:100%;display:block}
.gl-tl-rodape{margin-top:auto;padding-top:8px;display:grid;gap:5px;justify-items:center}
.gl-tl-acao{width:100%;font-family:inherit;font-size:12px;font-weight:var(--gs-weight-bold);color:var(--gs-action-text);background:var(--gs-action);border:0;border-radius:9px;padding:9px;pointer-events:none}
.gl-tl-falta{font-size:12px;color:var(--gs-text-muted);text-align:center;line-height:1.3}

.gl-esq{display:flex;flex-direction:column;gap:9px;height:100%}
.gl-esq i,.gl-esq-bloco,.gl-esq-acao{display:block;background:var(--gs-slate-200);border-radius:5px}
.gl-esq-cab{display:flex;justify-content:space-between;gap:10px}
.gl-esq-cab i:first-child{width:52%;height:13px}
.gl-esq-cab i:last-child{width:20%;height:13px}
.gl-esq-bloco{height:62px;border-radius:9px}
.gl-esq-linhas{display:grid;gap:6px}
.gl-esq-linhas i{height:26px;border-radius:8px}
.gl-esq-linhas i:nth-child(even){background:var(--gs-slate-100)}
.gl-esq-acao{margin-top:auto;height:32px;border-radius:9px;background:var(--gs-slate-300)}

.gl-tl-prog{height:5px;border-radius:var(--gs-radius-pill);background:var(--gs-surface-sunken);overflow:hidden}
.gl-tl-prog div{height:100%;border-radius:inherit;background:var(--gs-success)}
.gl-tl-lista{list-style:none;margin:0;padding:0;display:grid;gap:5px}
.gl-tl-lista li{display:flex;align-items:center;gap:7px;font-size:12px;line-height:1.3;color:var(--gs-text-body);background:var(--gs-surface);border-radius:8px;padding:7px 8px}
.gl-tl-nome{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gl-tl-lista li.ok{color:var(--gs-text-muted)}
.gl-tl-lista li.agora{background:var(--gs-surface-brand);color:var(--gs-text);font-weight:var(--gs-weight-medium)}
.gl-tl-marca{flex:none;display:grid;place-items:center;width:17px;height:17px;border-radius:50%;border:1.5px solid var(--gs-border-strong);color:var(--gs-action-text)}
.gl-tl-lista li.ok .gl-tl-marca{background:var(--gs-success);border-color:var(--gs-success)}
.gl-tl-lista li.agora .gl-tl-marca{border-color:var(--gs-action)}

.gl-tl-turnos{display:grid;gap:8px;background:var(--gs-surface);border-radius:9px;padding:9px}
.gl-tl-turno{display:grid;grid-template-columns:64px 1fr auto;align-items:center;gap:7px;font-size:11px;color:var(--gs-text-muted)}
.gl-tl-turno b{font-size:11px;color:var(--gs-text)}
.gl-tl-reg{list-style:none;margin:0;padding:0;display:grid}
.gl-tl-reg li{display:flex;align-items:center;gap:8px;padding:7px 0;border-top:1px solid var(--gs-border);font-size:12px}
.gl-tl-reg li:first-child{border-top:0}
.gl-tl-reg-o{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:var(--gs-weight-medium)}

.gl-tl-ponto{display:grid;grid-template-columns:auto 1fr;gap:8px;align-items:center;background:var(--gs-success-bg);color:var(--gs-success-text);border-radius:9px;padding:9px}
.gl-tl-ponto b{display:block;font-size:12px;font-weight:var(--gs-weight-bold)}
.gl-tl-ponto span{display:block;font-size:12px;opacity:.85}
.gl-tl-rank{list-style:none;margin:0;padding:0;display:grid}
.gl-tl-rank li{display:grid;grid-template-columns:auto minmax(0,1fr) 38px auto;align-items:center;gap:7px;padding:8px 0;border-top:1px solid var(--gs-border);font-size:12px}
.gl-tl-rank li:first-child{border-top:0}
.gl-tl-pos{font-size:11px;color:var(--gs-text-muted);width:11px}
.gl-tl-rank-n{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:var(--gs-weight-medium)}
.gl-tl-rank li.lider .gl-tl-pos{color:var(--gs-amber-600);font-weight:var(--gs-weight-black)}
.gl-tl-rank li:not(.lider) .gl-tl-barra div{background:var(--gs-blue-300)}
.gl-tl-rank b{font-size:12px}

/* --- Controles: as abas nomeiam o que a tela mostra --- */
.gl-carr-ctrl{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:4px}
.gl-carr-aba{
  font-family:inherit;font-size:var(--gs-text-sm);font-weight:var(--gs-weight-medium);
  color:var(--gs-text-on-dark-muted);background:transparent;border:0;cursor:pointer;
  padding:7px 12px;border-radius:var(--gs-radius-pill);
  transition:color var(--gs-duration-base) var(--gs-ease),background var(--gs-duration-base) var(--gs-ease);
}
.gl-carr-aba:hover{color:var(--gs-text-on-dark)}
.gl-carr-aba.on{color:var(--gs-navy-950);background:var(--gs-white);font-weight:var(--gs-weight-bold)}

/* O momento autoral da pagina: o leque assentando. Vai no palco, nunca no
   aparelho — la o transform ja e usado pra posicionar cada um. */
@media(prefers-reduced-motion:no-preference){
  .gl-carrossel{animation:gl-sobe 720ms var(--gs-ease) both}
}
@keyframes gl-sobe{from{transform:translateY(16px)}to{transform:none}}

/* --- A régua do dia (substitui a barra de métricas) --- */
.gl-dia{background-color:var(--gs-navy-900);background-image:linear-gradient(100deg,var(--gs-navy-950),var(--gs-navy-800) 55%,var(--gs-blue-900));color:var(--gs-text-on-dark);padding:var(--gs-space-10) 0}
.gl-dia-grid{display:grid;gap:var(--gs-space-6)}
@media(min-width:760px){.gl-dia-grid{grid-template-columns:repeat(3,1fr);gap:var(--gs-space-10)}}
.gl-dia-item{position:relative;padding-top:var(--gs-space-6)}
.gl-dia-item::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--gs-border-on-dark)}
.gl-dia-item::after{content:'';position:absolute;top:-3px;left:0;width:8px;height:8px;border-radius:50%;background:var(--gs-blue-400)}
.gl-dia-hora{display:block;font-size:var(--gs-text-sm);font-weight:var(--gs-weight-bold);letter-spacing:var(--gs-tracking-wider);text-transform:uppercase;color:var(--gs-blue-300)}
.gl-dia-nome{display:block;font-size:var(--gs-text-2xl);font-weight:var(--gs-weight-black);letter-spacing:var(--gs-tracking-tight);margin-top:var(--gs-space-1)}
.gl-dia-desc{color:var(--gs-text-on-dark-muted);font-size:var(--gs-text-md);margin-top:var(--gs-space-2)!important;max-width:34ch}

/* --- Problema: lista com régua, não grade de cards iguais --- */
.gl-prob{display:grid;gap:var(--gs-space-10)}
@media(min-width:900px){.gl-prob{grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);gap:var(--gs-space-16);align-items:start}}
.gl-prob-lista{display:grid}
.gl-prob-item{display:grid;grid-template-columns:auto 1fr;gap:var(--gs-space-5);padding:var(--gs-space-6) 0;border-top:1px solid var(--gs-border)}
.gl-prob-item:last-child{border-bottom:1px solid var(--gs-border)}
.gl-prob-marca{display:grid;place-items:center;width:34px;height:34px;border-radius:var(--gs-radius-sm);background:var(--gs-danger-bg);color:var(--gs-danger)}
.gl-prob-item h3{font-size:var(--gs-text-lg);font-weight:var(--gs-weight-bold)}
.gl-prob-item p{color:var(--gs-text-muted);font-size:var(--gs-text-md);margin-top:var(--gs-space-1)!important;max-width:52ch}

/* --- 3 passos: uma progressão ligada, não três blocos soltos --- */
.gl-passos{display:grid;gap:var(--gs-space-8);counter-reset:passo}
@media(min-width:820px){.gl-passos{grid-template-columns:repeat(3,1fr);gap:var(--gs-space-8)}}
.gl-passo{position:relative;padding-top:var(--gs-space-8)}
.gl-passo::before{
  counter-increment:passo;content:counter(passo);
  position:absolute;top:0;left:0;
  display:grid;place-items:center;width:34px;height:34px;
  border-radius:var(--gs-radius-pill);background:var(--gs-action);color:var(--gs-action-text);
  font-size:var(--gs-text-sm);font-weight:var(--gs-weight-black);font-variant-numeric:tabular-nums;
}
.gl-passo::after{content:'';position:absolute;top:16px;left:44px;right:calc(var(--gs-space-8) * -1);height:1px;background:var(--gs-border-strong)}
.gl-passo:last-child::after{display:none}
@media(max-width:819px){.gl-passo::after{display:none}}
.gl-passo h3{font-size:var(--gs-text-xl);font-weight:var(--gs-weight-bold);margin-bottom:var(--gs-space-2)}
.gl-passo p{color:var(--gs-text-muted);font-size:var(--gs-text-md);max-width:40ch}

/* --- Recursos em arco --- */
.gl-cc{display:grid;justify-items:center;gap:var(--gs-space-6)}
/* x/y de cada posicao do arco. A sobreposicao entre cards e sempre
   menor que o padding (16px), entao nunca cai em cima do texto. */
.gl-cc-arco{
  --cc-x1:190px; --cc-y1:24px;
  --cc-x2:370px; --cc-y2:78px;
  --cc-topo:84px;
  position:relative;width:100%;height:248px;
}
@media(max-width:1039px){.gl-cc-arco{--cc-x1:172px;height:244px}}
@media(max-width:639px){.gl-cc-arco{--cc-topo:90px;height:190px}}

.gl-cc-card{
  position:absolute;top:var(--cc-topo);left:50%;
  width:200px;height:170px;overflow:hidden;
  display:flex;flex-direction:column;align-items:flex-start;gap:var(--gs-space-2);
  text-align:left;font-family:inherit;cursor:pointer;
  padding:var(--gs-space-4);
  background:var(--gs-navy-800);
  border:1px solid var(--gs-border-on-dark);
  border-radius:var(--gs-radius-md);
  transition:transform 680ms var(--gl-ease-saida),opacity 680ms var(--gl-ease-saida),border-color var(--gs-duration-base) var(--gs-ease);
}
@media(prefers-reduced-motion:reduce){.gl-cc-card{transition:none}}

.gl-cc-card[data-off="0"]{transform:translate(-50%,-50%) scale(1);opacity:1;z-index:5;border-color:var(--gs-blue-400)}
.gl-cc-card[data-off="1"]{transform:translate(calc(-50% + var(--cc-x1)),calc(-50% + var(--cc-y1))) scale(.92);opacity:.62;z-index:4}
.gl-cc-card[data-off="-1"]{transform:translate(calc(-50% - var(--cc-x1)),calc(-50% + var(--cc-y1))) scale(.92);opacity:.62;z-index:4}
.gl-cc-card[data-off="2"]{transform:translate(calc(-50% + var(--cc-x2)),calc(-50% + var(--cc-y2))) scale(.84);opacity:.32;z-index:3}
.gl-cc-card[data-off="-2"]{transform:translate(calc(-50% - var(--cc-x2)),calc(-50% + var(--cc-y2))) scale(.84);opacity:.32;z-index:3}
.gl-cc-card[data-off="fora"]{transform:translate(-50%,-50%) scale(.7);opacity:0;z-index:1;pointer-events:none}
.gl-cc-card:not([data-off="0"]):hover{opacity:.85;border-color:var(--gs-blue-400)}
/* abaixo de 1040px o arco encolhe pra 3 cards; no celular, so o do meio */
@media(max-width:1039px){
  .gl-cc-card[data-off="2"],.gl-cc-card[data-off="-2"]{opacity:0;pointer-events:none}
}
@media(max-width:639px){
  .gl-cc-card[data-off="1"],.gl-cc-card[data-off="-1"]{opacity:0;pointer-events:none}
  .gl-cc-card{width:min(260px,78vw)}
}

.gl-cc-tag{
  font-size:var(--gs-text-2xs);font-weight:var(--gs-weight-bold);
  text-transform:uppercase;letter-spacing:var(--gs-tracking-wider);
  color:var(--gs-blue-300);background:rgba(255,255,255,.08);
  padding:3px 9px;border-radius:var(--gs-radius-pill);
}
.gl-cc-titulo{font-size:var(--gs-text-lg);font-weight:var(--gs-weight-bold);color:var(--gs-text-on-dark);letter-spacing:var(--gs-tracking-tight);line-height:1.2}
.gl-cc-desc{font-size:var(--gs-text-sm);color:var(--gs-text-on-dark-muted);line-height:var(--gs-leading-snug)}

.gl-cc-conta{display:flex;align-items:baseline;gap:var(--gs-space-2)}
.gl-cc-conta b{font-size:var(--gs-text-3xl);font-weight:var(--gs-weight-black);color:var(--gs-text-on-dark);letter-spacing:var(--gs-tracking-tight)}
.gl-cc-conta span{font-size:var(--gs-text-sm);color:var(--gs-text-on-dark-muted)}

.gl-cc-ctrl{display:flex;align-items:center;gap:var(--gs-space-4)}
.gl-cc-seta{
  display:grid;place-items:center;width:40px;height:40px;
  color:var(--gs-text-on-dark-muted);background:transparent;
  border:1px solid var(--gs-border-on-dark);border-radius:var(--gs-radius-pill);cursor:pointer;
  transition:color var(--gs-duration-base) var(--gs-ease),background var(--gs-duration-base) var(--gs-ease);
}
.gl-cc-seta:hover{color:var(--gs-text-on-dark);background:rgba(255,255,255,.08)}
.gl-cc-pontos{display:flex;align-items:center;gap:6px}
.gl-cc-ponto{
  width:7px;height:7px;padding:0;border:0;border-radius:var(--gs-radius-pill);
  background:rgba(255,255,255,.24);cursor:pointer;
  transition:width var(--gs-duration-base) var(--gs-ease),background var(--gs-duration-base) var(--gs-ease);
}
.gl-cc-ponto:hover{background:rgba(255,255,255,.45)}
.gl-cc-ponto.on{width:22px;background:var(--gs-white)}

/* --- Comparação --- */
.gl-cmp{display:grid;gap:var(--gs-space-6)}
@media(min-width:820px){.gl-cmp{grid-template-columns:1fr 1fr;align-items:start}}
.gl-cmp-col{border-radius:var(--gs-radius-lg);padding:var(--gs-space-8)}
.gl-cmp-eles{background:var(--gs-surface-sunken)}
.gl-cmp-nos{background:var(--gs-surface);box-shadow:var(--gs-shadow-md)}
.gl-cmp-col h3{font-size:var(--gs-text-md);font-weight:var(--gs-weight-bold);text-transform:uppercase;letter-spacing:var(--gs-tracking-wide);margin-bottom:var(--gs-space-5)}
.gl-cmp-eles h3{color:var(--gs-text-body)}
.gl-cmp-nos h3{color:var(--gs-action)}
.gl-cmp-col ul{list-style:none;display:grid;gap:var(--gs-space-4);margin:0;padding:0}
.gl-cmp-col li{display:grid;grid-template-columns:auto 1fr;gap:var(--gs-space-3);font-size:var(--gs-text-md);line-height:var(--gs-leading-snug);max-width:46ch}
.gl-cmp-col li svg{margin-top:2px}
.gl-cmp-eles li{color:var(--gs-text-body)}
.gl-cmp-eles li svg{color:var(--gs-text-subtle)}
.gl-cmp-nos li{color:var(--gs-text-body)}
.gl-cmp-nos li svg{color:var(--gs-success)}

/* --- Preço --- */
.gl-preco-par{display:grid;gap:var(--gs-space-10);align-items:center}
@media(min-width:960px){.gl-preco-par{grid-template-columns:.9fr 1.1fr;gap:var(--gs-space-16)}}
.gl-preco{max-width:460px;width:100%;background:var(--gs-surface);border-radius:var(--gs-radius-lg);box-shadow:var(--gs-shadow-lg);overflow:hidden}
.gl-preco-topo{background-color:var(--gs-navy-900);background-image:linear-gradient(100deg,var(--gs-navy-950),var(--gs-navy-800) 55%,var(--gs-blue-900));color:var(--gs-text-on-dark);padding:var(--gs-space-8) var(--gs-space-8) var(--gs-space-6);text-align:center}
.gl-preco-vagas{font-size:var(--gs-text-sm);font-weight:var(--gs-weight-bold);color:var(--gs-blue-300)}
.gl-preco-val{font-size:var(--gs-text-5xl);font-weight:var(--gs-weight-black);letter-spacing:var(--gs-tracking-tight);margin-top:var(--gs-space-2);display:block}
.gl-preco-val small{font-size:var(--gs-text-lg);font-weight:var(--gs-weight-medium);color:var(--gs-text-on-dark-muted);letter-spacing:0}
.gl-preco-de{font-size:var(--gs-text-sm);color:var(--gs-text-on-dark-muted);margin-top:var(--gs-space-2)!important}
.gl-preco-corpo{padding:var(--gs-space-8)}
.gl-preco-corpo ul{list-style:none;display:grid;gap:var(--gs-space-4);margin:0 0 var(--gs-space-8);padding:0}
.gl-preco-corpo li{display:grid;grid-template-columns:auto 1fr;gap:var(--gs-space-3);font-size:var(--gs-text-md);align-items:start;max-width:46ch}
.gl-preco-corpo li svg{color:var(--gs-success);margin-top:2px}
.gl-preco-nota{text-align:center;color:var(--gs-text-muted);font-size:var(--gs-text-sm);max-width:46ch;margin-left:auto;margin-right:auto;margin-top:var(--gs-space-4)!important;line-height:var(--gs-leading-snug)}

/* --- FAQ --- */
.gl-faq{max-width:66ch;display:grid;gap:var(--gs-space-2)}
.gl-faq details{border-top:1px solid var(--gs-border)}
.gl-faq details:last-child{border-bottom:1px solid var(--gs-border)}
.gl-faq summary{
  cursor:pointer;list-style:none;padding:var(--gs-space-5) 0;
  font-weight:var(--gs-weight-bold);font-size:var(--gs-text-lg);
  display:flex;justify-content:space-between;align-items:center;gap:var(--gs-space-4);
}
.gl-faq summary::-webkit-details-marker{display:none}
.gl-faq summary:hover{color:var(--gs-action)}
.gl-faq-mais{flex:none;color:var(--gs-action);transition:transform var(--gs-duration-base) var(--gs-ease)}
.gl-faq details[open] .gl-faq-mais{transform:rotate(45deg)}
.gl-faq p{color:var(--gs-text-muted);font-size:var(--gs-text-md);padding-bottom:var(--gs-space-5);max-width:64ch}

/* --- CTA final --- */
.gl-final{background-color:var(--gs-navy-900);background-image:linear-gradient(100deg,var(--gs-navy-950),var(--gs-navy-800) 55%,var(--gs-blue-900));color:var(--gs-text-on-dark);border-radius:var(--gs-radius-lg);padding:var(--gs-space-16) var(--gs-space-8);text-align:center;margin-bottom:var(--gs-space-20)}
.gl-final h2{font-size:var(--gs-text-4xl);font-weight:var(--gs-weight-black);max-width:20ch;margin:0 auto}
.gl-final p{font-size:var(--gs-text-lg);color:var(--gs-text-on-dark-muted);max-width:48ch;margin:var(--gs-space-4) auto var(--gs-space-8)!important}

/* --- Rodapé --- */
.gl-rodape{border-top:1px solid var(--gs-border);padding:var(--gs-space-10) 0;color:var(--gs-text-muted);font-size:var(--gs-text-sm)}
.gl-rodape-row{display:flex;flex-wrap:wrap;gap:var(--gs-space-4);justify-content:space-between;align-items:center}
.gl-rodape .gl-logo{color:var(--gs-text);font-size:var(--gs-text-lg)}
.gl-link-btn{background:none;border:0;font-family:inherit;font-size:var(--gs-text-sm);color:var(--gs-link);font-weight:var(--gs-weight-medium);cursor:pointer;padding:var(--gs-space-2);border-radius:var(--gs-radius-sm)}
.gl-link-btn:hover{text-decoration:underline;text-underline-offset:3px}
`}</style>

      <header className="gl-nav gl-escuro">
        <div className="gl-wrap gl-nav-row">
          <div className="gl-logo"><Marca size={30} /> Gestop</div>
          <nav className="gl-nav-links">
            <a href="#como-funciona">Como funciona</a>
            <a href="#recursos">Recursos</a>
            <a href="#diferenciais">Por que Gestop</a>
            <a href="#preco">Preço</a>
            <button className="gl-nav-entrar" onClick={ir('login')}>Entrar</button>
            <button className="gl-btn gl-btn-1" onClick={ir('cadastro')}>Teste grátis</button>
          </nav>
        </div>
      </header>

      <main>
        <section className="gl-hero gl-escuro">
          <div className="gl-wrap gl-hero-grid">
            <div>
              <h1>Seu restaurante funcionando direito, mesmo quando você não está lá.</h1>
              <ul className="gl-hero-checks">
                <li>
                  <IcCheck size={20} />
                  <div><strong>Prova, não promessa.</strong> Cada tarefa fecha com foto, horário e nome de quem fez. Acabou o “achei que tinham feito”.</div>
                </li>
                <li>
                  <IcCheck size={20} />
                  <div><strong>O salão no seu bolso.</strong> O painel mostra o turno acontecendo, em tempo real, de onde você estiver.</div>
                </li>
                <li>
                  <IcCheck size={20} />
                  <div><strong>Equipe que se cobra sozinha.</strong> Ponto por turno fechado e ranking mensal, sem você no pé.</div>
                </li>
              </ul>
              <div className="gl-hero-cta">
                <button className="gl-btn gl-btn-1" onClick={ir('cadastro')}>
                  Começar teste grátis de {DIAS_TRIAL} dias
                </button>
                <a className="gl-btn gl-btn-2" href="#como-funciona">Ver como funciona</a>
              </div>
              <p className="gl-trust">
                <IcCheck size={17} />
                Sem cartão · Sem demo nem vendedor · Pronto sozinho em 5 minutos
              </p>
            </div>
            <div className="gl-hero-art"><CarrosselApp /></div>
          </div>
        </section>

        {/* A régua do dia: a estrutura real do produto, não uma barra de métricas. */}
        <section className="gl-dia gl-escuro" aria-label="Os três turnos do dia">
          <div className="gl-wrap gl-dia-grid">
            <div className="gl-dia-item">
              <span className="gl-dia-hora">Abertura</span>
              <span className="gl-dia-nome">Começa certo</span>
              <p className="gl-dia-desc">A casa abre com a lista do dia já na mão de cada setor.</p>
            </div>
            <div className="gl-dia-item">
              <span className="gl-dia-hora">Pico</span>
              <span className="gl-dia-nome">Aguenta o movimento</span>
              <p className="gl-dia-desc">No aperto, ninguém para pra pensar no que falta — já está na tela.</p>
            </div>
            <div className="gl-dia-item">
              <span className="gl-dia-hora">Fechamento</span>
              <span className="gl-dia-nome">Fecha com prova</span>
              <p className="gl-dia-desc">O turno só fecha com foto. Amanhã você abre sabendo como ficou.</p>
            </div>
          </div>
        </section>

        <section className="gl-sec gl-claro">
          <div className="gl-wrap gl-prob">
            <div>
              <h2 className="gl-titulo">Cansado de cobrar tarefa no grito?</h2>
              <p className="gl-sub">
                Quando a rotina depende da memória de cada um, sempre falta alguma coisa.
                E quem paga a conta é o cliente que não volta.
              </p>
            </div>
            <div className="gl-prob-lista">
              <div className="gl-prob-item">
                <span className="gl-prob-marca"><IcX size={18} /></span>
                <div>
                  <h3>“Achei que tinham feito”</h3>
                  <p>Ninguém sabe ao certo o que foi concluído no turno. A culpa fica no ar e o problema se repete na semana seguinte.</p>
                </div>
              </div>
              <div className="gl-prob-item">
                <span className="gl-prob-marca"><IcX size={18} /></span>
                <div>
                  <h3>Você preso dentro do salão</h3>
                  <p>Sem painel, a única forma de saber se está tudo certo é estar lá. Todo dia, o dia inteiro.</p>
                </div>
              </div>
              <div className="gl-prob-item">
                <span className="gl-prob-marca"><IcX size={18} /></span>
                <div>
                  <h3>Padrão que não se sustenta</h3>
                  <p>O treinamento some assim que você vira as costas. Sem registro, não há como cobrar nem como melhorar.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="gl-sec" id="como-funciona">
          <div className="gl-wrap">
            <div className="gl-cab">
              <h2 className="gl-titulo">Funcionando em 3 passos</h2>
              <p className="gl-sub">Do cadastro ao primeiro turno acompanhado em tempo real, sem instalar nada.</p>
            </div>
            <div className="gl-passos">
              <div className="gl-passo">
                <h3>Cadastre seu restaurante</h3>
                <p>Crie a conta, defina setores e tarefas em menos de 5 minutos.</p>
              </div>
              <div className="gl-passo">
                <h3>Convide a equipe</h3>
                <p>Compartilhe o código de acesso. Cada pessoa usa no próprio celular.</p>
              </div>
              <div className="gl-passo">
                <h3>Acompanhe de onde estiver</h3>
                <p>O painel mostra, em tempo real, o que foi feito em cada turno.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="gl-sec gl-escuro" id="recursos">
          <div className="gl-wrap">
            <div className="gl-cab">
              <h2 className="gl-titulo">Tudo que o turno precisa, num app só</h2>
              <p className="gl-sub">
                Da lista de abertura ao ranking do mês. Tudo incluído no mesmo plano,
                sem módulo extra nem cobrança por usuário.
              </p>
            </div>
            <CarrosselRecursos />
          </div>
        </section>

        <section className="gl-sec" id="diferenciais">
          <div className="gl-wrap">
            <div className="gl-cab">
              <h2 className="gl-titulo">Por que o Gestop é diferente</h2>
              <p className="gl-sub">
                A maioria dos sistemas de checklist é feita pra grandes redes, e cobra (e complica) como tal.
                O Gestop é pro dono que quer resolver hoje, sozinho.
              </p>
            </div>
            <div className="gl-cmp">
              <div className="gl-cmp-col gl-cmp-eles">
                <h3>A maioria dos sistemas</h3>
                <ul>
                  <li><IcX size={19} /><span>Preço sob consulta — só depois de agendar uma demo com vendedor</span></li>
                  <li><IcX size={19} /><span>Cobrança que cresce por unidade e por usuário</span></li>
                  <li><IcX size={19} /><span>Pensados pra redes e franquias com muitas lojas</span></li>
                  <li><IcX size={19} /><span>Implantação, treinamento e integração com PDV</span></li>
                </ul>
              </div>
              <div className="gl-cmp-col gl-cmp-nos">
                <h3>Gestop</h3>
                <ul>
                  <li><IcCheck size={19} /><span>{PRECO_MENSAL}/mês fixo, preço público, sem demo e sem vendedor</span></li>
                  <li><IcCheck size={19} /><span>Checklists e funcionários ilimitados, sem cobrança extra</span></li>
                  <li><IcCheck size={19} /><span>Feito pra sua casa, do seu jeito, de 1 a poucas unidades</span></li>
                  <li><IcCheck size={19} /><span>Você mesmo começa em 5 minutos, sem instalar nada</span></li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="gl-sec gl-claro" id="preco">
          <div className="gl-wrap">
            <div className="gl-preco-par">
              <div>
                <h2 className="gl-titulo">Preço simples, sem pegadinha</h2>
                <p className="gl-sub">Um plano só, tudo incluído. Preço público na tela: sem demo, sem vendedor, sem surpresa na fatura.</p>
              </div>
              <div className="gl-preco">
              <div className="gl-preco-topo">
                <span className="gl-preco-vagas">Oferta de fundador · {VAGAS_FUNDADOR} primeiras contas</span>
                <span className="gl-preco-val gl-num">{PRECO_FUNDADOR}<small>/mês, vitalício</small></span>
                <p className="gl-preco-de">De <s>{PRECO_MENSAL}/mês</s>. Esse valor fica travado pra sempre nessa conta</p>
              </div>
              <div className="gl-preco-corpo">
                <ul>
                  <li><IcCheck size={19} /><span>Checklists e funcionários ilimitados</span></li>
                  <li><IcCheck size={19} /><span>Fotos, alertas e histórico completo</span></li>
                  <li><IcCheck size={19} /><span>Ranking pra motivar a equipe</span></li>
                  <li><IcCheck size={19} /><span>Painel do gestor em tempo real</span></li>
                  <li><IcCheck size={19} /><span>Suporte direto com a gente</span></li>
                </ul>
                <button className="gl-btn gl-btn-1 gl-btn-bloco" onClick={ir('cadastro')}>
                  Testar grátis por {DIAS_TRIAL} dias
                </button>
                <p className="gl-preco-nota">
                  <IcCadeado size={13} style={{ display: 'inline', verticalAlign: '-2px' }} /> Sem cartão de crédito ·
                  Depois do teste, as {VAGAS_FUNDADOR} primeiras contas pagam {PRECO_FUNDADOR}/mês pra sempre.
                  As próximas pagam {PRECO_MENSAL}/mês · Cancele quando quiser
                </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="gl-sec">
          <div className="gl-wrap">
            <div className="gl-cab">
              <h2 className="gl-titulo">Perguntas frequentes</h2>
              <p className="gl-sub">As dúvidas mais comuns de quem está começando.</p>
            </div>
            <div className="gl-faq">
              <details open>
                <summary>Preciso instalar algum aplicativo? <span className="gl-faq-mais"><IcMais /></span></summary>
                <p>Não. O Gestop funciona direto no navegador do celular e do computador. A equipe acessa pelo link, sem baixar nada da loja de apps.</p>
              </details>
              <details>
                <summary>Funciona pra qualquer tipo de restaurante? <span className="gl-faq-mais"><IcMais /></span></summary>
                <p>Sim. Hamburguerias, pizzarias, bares, cafeterias, restaurantes. Você cria os setores e tarefas do seu jeito, então se adapta a qualquer operação.</p>
              </details>
              <details>
                <summary>Meus funcionários precisam de e-mail e senha? <span className="gl-faq-mais"><IcMais /></span></summary>
                <p>Não precisam criar conta. Eles entram com um código de acesso que você compartilha. Saiu da equipe? Você desativa na hora.</p>
              </details>
              <details>
                <summary>Como funciona o teste grátis? <span className="gl-faq-mais"><IcMais /></span></summary>
                <p>São {DIAS_TRIAL} dias com tudo liberado, sem pedir cartão de crédito. Se gostar, é só assinar. Se não, é só não fazer nada. Não cobramos.</p>
              </details>
              <details>
                <summary>Tem fidelidade ou multa pra cancelar? <span className="gl-faq-mais"><IcMais /></span></summary>
                <p>Nenhuma. O plano é mensal e você cancela quando quiser, sem multa e sem burocracia.</p>
              </details>
            </div>
          </div>
        </section>

        <div className="gl-wrap">
          <div className="gl-final gl-escuro">
            <h2>Pare de cobrar checklist no grito.</h2>
            <p>Em 5 minutos seu restaurante tem rotina organizada, e você tem paz pra cuidar do que importa.</p>
            <button className="gl-btn gl-btn-claro" onClick={ir('cadastro')}>Criar minha conta grátis</button>
          </div>
        </div>
      </main>

      <footer className="gl-rodape">
        <div className="gl-wrap gl-rodape-row">
          <div className="gl-logo"><Marca size={26} /> Gestop</div>
          <div>Operação sob controle · {new Date().getFullYear()}</div>
          <button className="gl-link-btn" onClick={ir('privacidade')}>Política de Privacidade</button>
        </div>
      </footer>
    </div>
  )
}

// O "+" do FAQ que vira "×" quando abre — desenhado, não glifo de teclado.
function IcMais() {
  return (
    <Icone size={20}><path d="M12 5.5v13M5.5 12h13" /></Icone>
  )
}
