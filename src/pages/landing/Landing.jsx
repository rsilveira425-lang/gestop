import { PRECO_MENSAL, DIAS_TRIAL } from '../../config/billing'

const HERO_SVG = `<svg class="float-svg" width="460" height="520" viewBox="0 0 460 520" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Tela do app Gestop com checklist de abertura">
        <!-- floating dashboard card behind -->
        <g transform="translate(250,34)">
          <rect x="0" y="0" width="190" height="150" rx="16" fill="#ffffff" stroke="#e2e8f0"/>
          <text x="16" y="28" font-family="sans-serif" font-size="12" font-weight="700" fill="#0f172a">Painel de hoje</text>
          <rect x="16" y="42" width="158" height="8" rx="4" fill="#eef2f7"/>
          <rect x="16" y="42" width="120" height="8" rx="4" fill="#16a34a"/>
          <text x="16" y="72" font-family="sans-serif" font-size="11" fill="#64748b">Abertura</text>
          <text x="158" y="72" font-family="sans-serif" font-size="11" font-weight="700" fill="#16a34a" text-anchor="end">100%</text>
          <text x="16" y="96" font-family="sans-serif" font-size="11" fill="#64748b">Pico</text>
          <text x="158" y="96" font-family="sans-serif" font-size="11" font-weight="700" fill="#f59e0b" text-anchor="end">67%</text>
          <text x="16" y="120" font-family="sans-serif" font-size="11" fill="#64748b">Fechamento</text>
          <text x="158" y="120" font-family="sans-serif" font-size="11" font-weight="700" fill="#94a3b8" text-anchor="end">—</text>
          <line x1="16" y1="132" x2="174" y2="132" stroke="#eef2f7"/>
          <text x="16" y="146" font-family="sans-serif" font-size="10" fill="#94a3b8">Atualizado agora · tempo real</text>
        </g>

        <!-- PHONE -->
        <g transform="translate(8,28)">
          <rect x="0" y="0" width="250" height="492" rx="38" fill="#0f172a"/>
          <rect x="8" y="8" width="234" height="476" rx="31" fill="#f5f5f7"/>
          <!-- notch -->
          <rect x="95" y="16" width="60" height="14" rx="7" fill="#0f172a"/>
          <!-- app header -->
          <g>
            <path d="M8 39 h234 v44 h-234 z" fill="#1a1a1a"/>
            <text x="22" y="58" font-family="sans-serif" font-size="13" font-weight="700" fill="#fff">🍔 Checklist da Casa</text>
            <text x="22" y="74" font-family="sans-serif" font-size="10" fill="#cbd5e1">Abertura · Cozinha · 08:12</text>
          </g>
          <!-- tabs -->
          <g font-family="sans-serif" font-size="10" font-weight="700">
            <rect x="22" y="94" width="62" height="24" rx="12" fill="#1a1a1a"/>
            <text x="53" y="110" fill="#fff" text-anchor="middle">Abertura</text>
            <rect x="90" y="94" width="44" height="24" rx="12" fill="#e8e8ed"/>
            <text x="112" y="110" fill="#475569" text-anchor="middle">Pico</text>
            <rect x="140" y="94" width="80" height="24" rx="12" fill="#e8e8ed"/>
            <text x="180" y="110" fill="#475569" text-anchor="middle">Fechamento</text>
          </g>
          <!-- progress -->
          <g>
            <rect x="22" y="128" width="206" height="40" rx="12" fill="#fff" stroke="#e8e8ed"/>
            <text x="34" y="144" font-family="sans-serif" font-size="10" fill="#64748b">Progresso</text>
            <text x="216" y="144" font-family="sans-serif" font-size="10" font-weight="700" fill="#16a34a" text-anchor="end">8/12</text>
            <rect x="34" y="150" width="182" height="7" rx="4" fill="#eef2f7"/>
            <rect x="34" y="150" width="121" height="7" rx="4" fill="#16a34a"/>
          </g>
          <!-- checklist items -->
          <g font-family="sans-serif">
            <!-- item 1 done -->
            <rect x="22" y="178" width="206" height="34" rx="10" fill="#fff" stroke="#e8e8ed"/>
            <circle cx="40" cy="195" r="9" fill="#16a34a"/>
            <path d="M36 195 l3 3 l5 -6" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <text x="56" y="199" font-size="10.5" fill="#0f172a">Ligar fritadeiras e chapa</text>
            <!-- item 2 done with photo -->
            <rect x="22" y="218" width="206" height="44" rx="10" fill="#fff" stroke="#e8e8ed"/>
            <circle cx="40" cy="240" r="9" fill="#16a34a"/>
            <path d="M36 240 l3 3 l5 -6" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <text x="56" y="236" font-size="10.5" fill="#0f172a">Conferir temperatura geladeira</text>
            <rect x="56" y="244" width="26" height="12" rx="3" fill="#dbeafe"/>
            <text x="69" y="253" font-size="8" fill="#2563eb" text-anchor="middle">📷 foto</text>
            <!-- item 3 done -->
            <rect x="22" y="268" width="206" height="34" rx="10" fill="#fff" stroke="#e8e8ed"/>
            <circle cx="40" cy="285" r="9" fill="#16a34a"/>
            <path d="M36 285 l3 3 l5 -6" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <text x="56" y="289" font-size="10.5" fill="#0f172a">Higienizar bancadas</text>
            <!-- item 4 pending -->
            <rect x="22" y="308" width="206" height="34" rx="10" fill="#fff" stroke="#e8e8ed"/>
            <circle cx="40" cy="325" r="9" fill="#fff" stroke="#cbd5e1" stroke-width="1.6"/>
            <text x="56" y="329" font-size="10.5" fill="#475569">Repor estoque de pães</text>
            <!-- item 5 pending -->
            <rect x="22" y="348" width="206" height="34" rx="10" fill="#fff" stroke="#e8e8ed"/>
            <circle cx="40" cy="365" r="9" fill="#fff" stroke="#cbd5e1" stroke-width="1.6"/>
            <text x="56" y="369" font-size="10.5" fill="#475569">Testar máquina de cartão</text>
          </g>
          <!-- bottom bar (rounded bottom corners to match phone) -->
          <path d="M8 430 H242 V453 A31 31 0 0 1 211 484 H39 A31 31 0 0 1 8 453 Z" fill="#fff"/>
          <line x1="8" y1="430" x2="242" y2="430" stroke="#e8e8ed"/>
          <g font-family="sans-serif" font-size="9" text-anchor="middle">
            <text x="55" y="455" font-size="15">📋</text><text x="55" y="470" fill="#2563eb" font-weight="700">Turno</text>
            <text x="125" y="455" font-size="15">📊</text><text x="125" y="470" fill="#94a3b8">Painel</text>
            <text x="195" y="455" font-size="15">👥</text><text x="195" y="470" fill="#94a3b8">Equipe</text>
          </g>
        </g>
      </svg>`
const FOTO_SVG = `<svg width="240" height="430" viewBox="0 0 240 430" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Item do checklist com foto enviada como prova">
          <rect x="0" y="0" width="240" height="430" rx="34" fill="#0f172a"/>
          <rect x="7" y="7" width="226" height="416" rx="28" fill="#f5f5f7"/>
          <rect x="92" y="14" width="56" height="12" rx="6" fill="#0f172a"/>
          <path d="M7 34 h226 v40 h-226 z" fill="#1a1a1a"/>
          <text x="20" y="54" font-family="sans-serif" font-size="12" font-weight="700" fill="#fff">Detalhe da tarefa</text>
          <text x="20" y="69" font-family="sans-serif" font-size="9.5" fill="#cbd5e1">Conferir temperatura · Cozinha</text>
          <!-- task card -->
          <rect x="20" y="88" width="200" height="40" rx="10" fill="#fff" stroke="#e8e8ed"/>
          <circle cx="38" cy="108" r="9" fill="#16a34a"/>
          <path d="M34 108 l3 3 l5 -6" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          <text x="54" y="105" font-family="sans-serif" font-size="10" fill="#0f172a">Geladeira a 4°C</text>
          <text x="54" y="118" font-family="sans-serif" font-size="8.5" fill="#16a34a">Concluído por Marcos · 08:07</text>
          <!-- photo proof -->
          <text x="20" y="150" font-family="sans-serif" font-size="9" font-weight="700" fill="#64748b">FOTO ENVIADA</text>
          <rect x="20" y="158" width="200" height="150" rx="12" fill="url(#gp)"/>
          <defs><linearGradient id="gp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c7d2fe"/><stop offset="1" stop-color="#e2e8f0"/></linearGradient></defs>
          <rect x="60" y="200" width="120" height="58" rx="6" fill="#cbd5e1"/>
          <circle cx="88" cy="220" r="9" fill="#94a3b8"/>
          <path d="M64 258 l30 -28 l22 18 l20 -16 l24 24 z" fill="#94a3b8"/>
          <text x="120" y="332" font-family="sans-serif" font-size="9" fill="#64748b" text-anchor="middle">📍 Registrado no local · 08:07</text>
          <!-- comment -->
          <rect x="20" y="346" width="200" height="50" rx="10" fill="#eff4ff"/>
          <text x="32" y="366" font-family="sans-serif" font-size="9" font-weight="700" fill="#2563eb">💬 Comentário</text>
          <text x="32" y="383" font-family="sans-serif" font-size="9" fill="#475569">"Tudo certo, sem variação hoje."</text>
        </svg>`
const DASH_SVG = `<svg width="420" height="320" viewBox="0 0 420 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Painel do gestor mostrando turnos e equipe">
          <rect x="0" y="0" width="420" height="320" rx="16" fill="#fff" stroke="#e2e8f0"/>
          <!-- topbar -->
          <path d="M0 16 a16 16 0 0 1 16 -16 h388 a16 16 0 0 1 16 16 v22 h-420 z" fill="#1a1a1a"/>
          <circle cx="18" cy="19" r="4" fill="#ff5f57"/><circle cx="34" cy="19" r="4" fill="#febc2e"/><circle cx="50" cy="19" r="4" fill="#28c840"/>
          <text x="210" y="23" font-family="sans-serif" font-size="10" fill="#cbd5e1" text-anchor="middle">gestop.app · Painel do gestor</text>
          <!-- title -->
          <text x="22" y="62" font-family="sans-serif" font-size="14" font-weight="800" fill="#0f172a">Hoje, terça · 24 jun</text>
          <text x="398" y="62" font-family="sans-serif" font-size="10" fill="#16a34a" text-anchor="end" font-weight="700">● Ao vivo</text>
          <!-- 3 turno cards -->
          <g font-family="sans-serif">
            <rect x="22" y="76" width="120" height="78" rx="12" fill="#f0fdf4" stroke="#bbf7d0"/>
            <text x="36" y="98" font-size="10" font-weight="700" fill="#0f172a">Abertura</text>
            <text x="36" y="128" font-size="26" font-weight="800" fill="#16a34a">100%</text>
            <text x="36" y="144" font-size="9" fill="#64748b">12/12 · 08:14</text>

            <rect x="150" y="76" width="120" height="78" rx="12" fill="#fffbeb" stroke="#fde68a"/>
            <text x="164" y="98" font-size="10" font-weight="700" fill="#0f172a">Pico</text>
            <text x="164" y="128" font-size="26" font-weight="800" fill="#f59e0b">67%</text>
            <text x="164" y="144" font-size="9" fill="#64748b">6/9 · em andamento</text>

            <rect x="278" y="76" width="120" height="78" rx="12" fill="#f8fafc" stroke="#e2e8f0"/>
            <text x="292" y="98" font-size="10" font-weight="700" fill="#0f172a">Fechamento</text>
            <text x="292" y="128" font-size="26" font-weight="800" fill="#94a3b8">—</text>
            <text x="292" y="144" font-size="9" fill="#64748b">abre às 22:00</text>
          </g>
          <!-- activity list -->
          <text x="22" y="182" font-family="sans-serif" font-size="11" font-weight="700" fill="#0f172a">Atividade recente</text>
          <g font-family="sans-serif" font-size="9.5">
            <rect x="22" y="192" width="376" height="30" rx="8" fill="#f8fafc"/>
            <circle cx="40" cy="207" r="8" fill="#16a34a"/><path d="M36.5 207 l2.5 2.5 l4.5 -5" stroke="#fff" stroke-width="1.5" fill="none" stroke-linecap="round"/>
            <text x="56" y="210" fill="#0f172a">Marcos concluiu "Conferir temperatura"</text>
            <text x="392" y="210" fill="#94a3b8" text-anchor="end">08:07 📷</text>

            <rect x="22" y="226" width="376" height="30" rx="8" fill="#f8fafc"/>
            <circle cx="40" cy="241" r="8" fill="#16a34a"/><path d="M36.5 241 l2.5 2.5 l4.5 -5" stroke="#fff" stroke-width="1.5" fill="none" stroke-linecap="round"/>
            <text x="56" y="244" fill="#0f172a">Júlia concluiu "Higienizar bancadas"</text>
            <text x="392" y="244" fill="#94a3b8" text-anchor="end">08:02</text>

            <rect x="22" y="260" width="376" height="30" rx="8" fill="#fff7ed"/>
            <circle cx="40" cy="275" r="8" fill="#f59e0b"/><text x="40" y="278" font-size="10" fill="#fff" text-anchor="middle">!</text>
            <text x="56" y="278" fill="#0f172a">Pendente: "Repor estoque de pães"</text>
            <text x="392" y="278" fill="#f59e0b" text-anchor="end" font-weight="700">atrasada</text>
          </g>
        </svg>`

const Check = () => (
  <svg width="20" height="20" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" stroke="#16a34a" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
)
const CmpCheck = () => (
  <svg className="glp-cmp-ic" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
)
const CmpCross = () => (
  <svg className="glp-cmp-ic" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="#b4b4bd" strokeWidth="2.6" strokeLinecap="round"/></svg>
)

export default function Landing({ onNavigate }) {
  const ir = (r) => () => onNavigate(r)
  return (
    <div className="glp-page">
      <style>{`
.glp-page{--blue:#2563eb;--blue-dark:#1d4ed8;--blue-soft:#eff4ff;--ink:#0f172a;--muted:#64748b;--line:#e2e8f0;--bg:#ffffff;--bg-soft:#f8fafc;--green:#16a34a;--radius:16px;--shadow:0 10px 30px -12px rgba(15,23,42,.18);--shadow-lg:0 30px 60px -20px rgba(15,23,42,.30);--font:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Inter,sans-serif;font-family:var(--font);color:var(--ink);background:var(--bg);line-height:1.55;-webkit-font-smoothing:antialiased}
.glp-page *{box-sizing:border-box}
.glp-page svg{display:block;max-width:100%}
.glp-page a{color:inherit;text-decoration:none}
.glp-wrap{width:100%;max-width:1140px;margin:0 auto;padding:0 20px}
.glp-btn{display:inline-flex;align-items:center;gap:8px;font-weight:700;font-size:16px;border-radius:12px;padding:14px 22px;cursor:pointer;border:0;transition:.18s;white-space:nowrap;font-family:inherit}
.glp-btn-primary{background:var(--blue);color:#fff;box-shadow:0 8px 20px -6px rgba(37,99,235,.55)}
.glp-btn-primary:hover{background:var(--blue-dark);transform:translateY(-1px)}
.glp-btn-ghost{background:transparent;color:var(--ink);padding:10px 16px}
.glp-btn-light{background:#fff;color:var(--blue)}
.glp-btn-light:hover{transform:translateY(-1px)}
.glp-eyebrow{display:inline-block;font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--blue);background:var(--blue-soft);padding:6px 12px;border-radius:99px;margin-bottom:16px}
.glp-page h1,.glp-page h2,.glp-page h3{line-height:1.12;letter-spacing:-.02em;margin:0}
.glp-section-title{font-size:clamp(26px,4vw,40px);font-weight:800;text-align:center;margin-bottom:12px}
.glp-section-sub{text-align:center;color:var(--muted);font-size:18px;max-width:620px;margin:0 auto 48px}
.glp-section{padding:84px 0}
.glp-nav{position:sticky;top:0;z-index:60;background:rgba(255,255,255,.85);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
.glp-nav-row{display:flex;align-items:center;justify-content:space-between;height:64px}
.glp-logo{display:flex;align-items:center;gap:9px;font-weight:800;font-size:20px;letter-spacing:-.02em}
.glp-dot{width:30px;height:30px;border-radius:9px;background:var(--blue);display:grid;place-items:center;color:#fff;font-size:17px}
.glp-nav-links{display:flex;align-items:center;gap:10px}
.glp-nav-links a.glp-link{display:none;color:var(--muted);font-weight:600;padding:8px 12px}
@media(min-width:860px){.glp-nav-links a.glp-link{display:inline}}
.glp-hero{background:radial-gradient(1200px 500px at 80% -10%,#eaf1ff 0%,transparent 60%),var(--bg);padding:64px 0 72px}
.glp-hero-grid{display:grid;gap:48px;align-items:center}
@media(min-width:920px){.glp-hero-grid{grid-template-columns:1.05fr .95fr;gap:32px}}
.glp-hero h1{font-size:clamp(32px,5.2vw,52px);font-weight:800}
.glp-lead{font-size:clamp(17px,2.2vw,20px);color:var(--muted);margin:20px 0 28px;max-width:540px}
.glp-hero-cta{display:flex;flex-wrap:wrap;gap:14px;align-items:center}
.glp-trust{display:flex;align-items:center;gap:8px;color:var(--muted);font-size:14px;margin-top:18px}
.glp-trust svg{flex:none}
.glp-hero-art{display:flex;justify-content:center;position:relative}
.glp-badges{display:flex;flex-wrap:wrap;gap:10px 22px;justify-content:center;align-items:center;margin-top:18px;padding:22px 0 0;color:var(--muted);font-weight:600;font-size:14px}
.glp-badges span{display:inline-flex;align-items:center;gap:7px}
.glp-stats{background:var(--blue);color:#fff;padding:42px 0}
.glp-stats-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:28px;text-align:center}
@media(min-width:760px){.glp-stats-grid{grid-template-columns:repeat(4,1fr)}}
.glp-stat b{display:block;font-size:34px;font-weight:800;letter-spacing:-.02em}
.glp-stat span{opacity:.85;font-size:14px}
.glp-problem{background:var(--bg-soft)}
.glp-prob-grid{display:grid;gap:18px}
@media(min-width:760px){.glp-prob-grid{grid-template-columns:repeat(3,1fr)}}
.glp-prob-card{background:#fff;border:1px solid var(--line);border-radius:var(--radius);padding:24px}
.glp-prob-card .glp-ic{font-size:24px}
.glp-prob-card h3{font-size:18px;margin:12px 0 6px;font-weight:700}
.glp-prob-card p{color:var(--muted);font-size:15px;margin:0}
.glp-steps-grid{display:grid;gap:24px}
@media(min-width:820px){.glp-steps-grid{grid-template-columns:repeat(3,1fr)}}
.glp-step{text-align:center;padding:8px}
.glp-num{width:48px;height:48px;border-radius:14px;background:var(--blue-soft);color:var(--blue);font-weight:800;font-size:20px;display:grid;place-items:center;margin:0 auto 16px}
.glp-step h3{font-size:19px;font-weight:700;margin-bottom:8px}
.glp-step p{color:var(--muted);font-size:15px;margin:0}
.glp-split{display:grid;gap:40px;align-items:center}
@media(min-width:920px){.glp-split{grid-template-columns:1fr 1fr}}
.glp-split.glp-rev .glp-art{order:-1}
.glp-feat-list{display:grid;gap:18px}
.glp-feat{display:flex;gap:14px;align-items:flex-start}
.glp-fic{flex:none;width:42px;height:42px;border-radius:11px;background:var(--blue-soft);display:grid;place-items:center;font-size:20px}
.glp-feat h3{font-size:17px;font-weight:700;margin-bottom:2px}
.glp-feat p{color:var(--muted);font-size:15px;margin:0}
.glp-art-card{background:linear-gradient(160deg,#eef4ff,#f8fafc);border:1px solid var(--line);border-radius:24px;padding:28px;display:flex;justify-content:center;box-shadow:var(--shadow)}
.glp-pricing{background:var(--bg-soft)}
.glp-price-card{max-width:440px;margin:0 auto;background:#fff;border:1px solid var(--line);border-radius:24px;box-shadow:var(--shadow-lg);overflow:hidden}
.glp-price-top{background:var(--ink);color:#fff;padding:30px 30px 26px;text-align:center}
.glp-tag{font-size:12px;letter-spacing:.08em;text-transform:uppercase;opacity:.7;font-weight:700}
.glp-val{font-size:48px;font-weight:800;margin-top:8px}
.glp-val small{font-size:17px;font-weight:600;opacity:.8}
.glp-price-body{padding:28px 30px 32px}
.glp-price-body ul{list-style:none;display:grid;gap:14px;margin:0 0 24px;padding:0}
.glp-price-body li{display:flex;gap:10px;align-items:flex-start;font-size:16px}
.glp-price-body li svg{flex:none;margin-top:3px}
.glp-price-card .glp-btn{width:100%;justify-content:center}
.glp-price-note{text-align:center;color:var(--muted);font-size:13px;margin-top:14px}
.glp-compare{display:grid;gap:18px;max-width:900px;margin:0 auto}
@media(min-width:780px){.glp-compare{grid-template-columns:1fr 1fr}}
.glp-cmp-card{border:1px solid var(--line);border-radius:18px;padding:26px 24px;background:#fff}
.glp-cmp-card.glp-them{background:var(--bg-soft)}
.glp-cmp-card.glp-us{border:2px solid var(--blue);box-shadow:var(--shadow)}
.glp-cmp-card h3{font-size:18px;font-weight:800;margin-bottom:16px;display:flex;align-items:center;gap:8px}
.glp-tagline{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:4px 10px;border-radius:99px}
.glp-cmp-card.glp-them .glp-tagline{background:#f1f1f4;color:var(--muted)}
.glp-cmp-card.glp-us .glp-tagline{background:var(--blue-soft);color:var(--blue)}
.glp-cmp-card ul{list-style:none;display:grid;gap:13px;margin:0;padding:0}
.glp-cmp-card li{display:flex;gap:10px;font-size:15px;line-height:1.4}
.glp-cmp-card.glp-them li{color:var(--muted)}
.glp-cmp-card.glp-us li{color:var(--ink);font-weight:500}
.glp-cmp-ic{flex:none;width:20px;height:20px;margin-top:1px}
.glp-faq-list{max-width:760px;margin:0 auto;display:grid;gap:12px}
.glp-page details{background:var(--bg-soft);border:1px solid var(--line);border-radius:14px;padding:0 20px}
.glp-page summary{cursor:pointer;list-style:none;padding:18px 0;font-weight:700;font-size:17px;display:flex;justify-content:space-between;align-items:center;gap:16px}
.glp-page summary::-webkit-details-marker{display:none}
.glp-chev{flex:none;transition:.2s;color:var(--blue)}
.glp-page details[open] summary .glp-chev{transform:rotate(45deg)}
.glp-page details p{color:var(--muted);padding:0 0 20px;font-size:15px;margin:0}
.glp-final{background:linear-gradient(135deg,var(--blue),#4f46e5);color:#fff;text-align:center;border-radius:28px;padding:60px 28px;margin:40px 0}
.glp-final h2{font-size:clamp(26px,4vw,38px);font-weight:800;margin-bottom:12px}
.glp-final p{opacity:.92;font-size:18px;max-width:540px;margin:0 auto 26px}
.glp-footer{border-top:1px solid var(--line);padding:36px 0;color:var(--muted);font-size:14px}
.glp-foot-row{display:flex;flex-wrap:wrap;gap:14px;justify-content:space-between;align-items:center}
.glp-page .float-svg{filter:drop-shadow(0 30px 50px rgba(15,23,42,.25))}
.glp-link-btn{background:none;border:0;color:var(--blue);font-weight:600;cursor:pointer;font-family:inherit;font-size:14px;padding:8px 0 0}
`}</style>

      <header className="glp-nav">
        <div className="glp-wrap glp-nav-row">
          <div className="glp-logo"><span className="glp-dot">{'✓'}</span> Gestop</div>
          <nav className="glp-nav-links">
            <a className="glp-link" href="#como-funciona">Como funciona</a>
            <a className="glp-link" href="#recursos">Recursos</a>
            <a className="glp-link" href="#diferenciais">Por que Gestop</a>
            <a className="glp-link" href="#preco">Preço</a>
            <button className="glp-btn glp-btn-ghost" onClick={ir('login')}>Entrar</button>
            <button className="glp-btn glp-btn-primary" onClick={ir('cadastro')}>Teste grátis</button>
          </nav>
        </div>
      </header>

      <section className="glp-hero">
        <div className="glp-wrap glp-hero-grid">
          <div>
            <span className="glp-eyebrow">Operação sob controle</span>
            <h1>Seu restaurante funcionando direito, mesmo quando você não está lá.</h1>
            <p className="glp-lead">O Gestop transforma a rotina do seu restaurante em checklists simples por turno — com <strong>foto como prova</strong> e um painel pra você acompanhar tudo pelo celular.</p>
            <div className="glp-hero-cta">
              <button className="glp-btn glp-btn-primary" onClick={ir('cadastro')}>Começar teste grátis de {DIAS_TRIAL} dias →</button>
              <a className="glp-btn glp-btn-ghost" href="#como-funciona">Ver como funciona</a>
            </div>
            <div className="glp-trust">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Sem cartão · Sem demo nem vendedor · Pronto sozinho em 5 minutos
            </div>
          </div>
          <div className="glp-hero-art" dangerouslySetInnerHTML={{ __html: HERO_SVG }} />
        </div>
        <div className="glp-wrap">
          <div className="glp-badges">
            <span>Feito para:</span>
            <span>{'🍔'} Hamburguerias</span>
            <span>{'🍕'} Pizzarias</span>
            <span>{'🍻'} Bares</span>
            <span>{'🍽️'} Restaurantes</span>
            <span>{'☕'} Cafeterias</span>
          </div>
        </div>
      </section>

      <section className="glp-stats" style={{ padding: '42px 0' }}>
        <div className="glp-wrap glp-stats-grid">
          <div className="glp-stat"><b>5 min</b><span>pra configurar tudo</span></div>
          <div className="glp-stat"><b>3 turnos</b><span>abertura, pico e fechamento</span></div>
          <div className="glp-stat"><b>100%</b><span>no celular da equipe</span></div>
          <div className="glp-stat"><b>{PRECO_MENSAL}</b><span>por mês, plano único</span></div>
        </div>
      </section>

      <section className="glp-section glp-problem">
        <div className="glp-wrap">
          <h2 className="glp-section-title">Cansado de cobrar tarefa no grito?</h2>
          <p className="glp-section-sub">Quando a rotina depende da memória de cada um, sempre falta alguma coisa — e quem sente é o cliente.</p>
          <div className="glp-prob-grid">
            <div className="glp-prob-card"><div className="glp-ic">{'😵‍💫'}</div><h3>"Achei que tinham feito"</h3><p>Ninguém sabe ao certo o que foi concluído no turno. A culpa fica no ar e o problema se repete.</p></div>
            <div className="glp-prob-card"><div className="glp-ic">{'📵'}</div><h3>Você preso dentro do salão</h3><p>Sem um painel, a única forma de saber se está tudo certo é estar lá fisicamente, todo dia.</p></div>
            <div className="glp-prob-card"><div className="glp-ic">{'🔁'}</div><h3>Padrão que não se mantém</h3><p>O treinamento some quando você vira as costas. Sem registro, não há cobrança nem melhoria.</p></div>
          </div>
        </div>
      </section>

      <section className="glp-section" id="como-funciona">
        <div className="glp-wrap">
          <h2 className="glp-section-title">Funcionando em 3 passos</h2>
          <p className="glp-section-sub">Do cadastro ao primeiro turno acompanhado em tempo real — sem instalar nada.</p>
          <div className="glp-steps-grid">
            <div className="glp-step"><div className="glp-num">1</div><h3>Cadastre seu restaurante</h3><p>Crie a conta, defina setores e tarefas em menos de 5 minutos.</p></div>
            <div className="glp-step"><div className="glp-num">2</div><h3>Convide a equipe</h3><p>Compartilhe o código de acesso. Cada funcionário usa no próprio celular.</p></div>
            <div className="glp-step"><div className="glp-num">3</div><h3>Acompanhe de onde estiver</h3><p>O painel mostra em tempo real o que foi feito em cada turno.</p></div>
          </div>
        </div>
      </section>

      <section className="glp-section" id="recursos" style={{ background: 'var(--bg-soft)' }}>
        <div className="glp-wrap glp-split">
          <div>
            <span className="glp-eyebrow">A rotina, organizada</span>
            <h2 style={{ fontSize: 'clamp(24px,3.5vw,34px)', fontWeight: 800, marginBottom: '20px' }}>Cada turno com tarefas claras — e prova de que foi feito.</h2>
            <div className="glp-feat-list">
              <div className="glp-feat"><div className="glp-fic">{'✅'}</div><div><h3>Checklists por turno</h3><p>Abertura, pico e fechamento. Cada setor sabe exatamente o que fazer e quando.</p></div></div>
              <div className="glp-feat"><div className="glp-fic">{'📸'}</div><div><h3>Foto como prova</h3><p>A equipe registra com foto. Você confere de onde estiver, sem precisar estar no salão.</p></div></div>
              <div className="glp-feat"><div className="glp-fic">{'🔔'}</div><div><h3>Alertas de turno</h3><p>Turno não concluído no horário? O painel avisa antes de virar problema com cliente.</p></div></div>
            </div>
          </div>
          <div className="glp-art"><div className="glp-art-card" dangerouslySetInnerHTML={{ __html: FOTO_SVG }} /></div>
        </div>
      </section>

      <section className="glp-section">
        <div className="glp-wrap glp-split glp-rev">
          <div>
            <span className="glp-eyebrow">Visão de gestor</span>
            <h2 style={{ fontSize: 'clamp(24px,3.5vw,34px)', fontWeight: 800, marginBottom: '20px' }}>Quem fez, o que fez e a que horas — num painel só.</h2>
            <div className="glp-feat-list">
              <div className="glp-feat"><div className="glp-fic">{'📊'}</div><div><h3>Painel do gestor</h3><p>Acompanhe cada turno em tempo real, do celular ou do computador, esteja onde estiver.</p></div></div>
              <div className="glp-feat"><div className="glp-fic">{'👥'}</div><div><h3>Gestão de equipe</h3><p>Funcionários entram com um código. Saiu da equipe? Desativa na hora, sem dor de cabeça.</p></div></div>
              <div className="glp-feat"><div className="glp-fic">{'🕒'}</div><div><h3>Histórico de 15 dias</h3><p>Auditoria rápida: navegue pelos checklists anteriores com respostas, fotos e comentários.</p></div></div>
            </div>
          </div>
          <div className="glp-art"><div className="glp-art-card" dangerouslySetInnerHTML={{ __html: DASH_SVG }} /></div>
        </div>
      </section>

      <section className="glp-section" id="diferenciais">
        <div className="glp-wrap">
          <h2 className="glp-section-title">Por que o Gestop é diferente</h2>
          <p className="glp-section-sub">A maioria dos sistemas de checklist é feita pra grandes redes — e cobra (e complica) como tal. O Gestop é pro dono que quer resolver hoje, sozinho.</p>
          <div className="glp-compare">
            <div className="glp-cmp-card glp-them">
              <h3><span className="glp-tagline">A maioria dos sistemas</span></h3>
              <ul>
                <li><CmpCross /> Preço sob consulta — só depois de agendar uma demo com vendedor</li>
                <li><CmpCross /> Cobrança que cresce por unidade e por usuário</li>
                <li><CmpCross /> Pensados pra redes e franquias com muitas lojas</li>
                <li><CmpCross /> Implantação, treinamento e integração com PDV</li>
              </ul>
            </div>
            <div className="glp-cmp-card glp-us">
              <h3><span className="glp-tagline">Gestop</span></h3>
              <ul>
                <li><CmpCheck /> {PRECO_MENSAL}/mês fixo, preço público — sem demo, sem vendedor</li>
                <li><CmpCheck /> Checklists e funcionários ilimitados, sem cobrança extra</li>
                <li><CmpCheck /> Feito pra sua casa, do seu jeito — de 1 a poucas unidades</li>
                <li><CmpCheck /> Você mesmo começa em 5 minutos, sem instalar nada</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="glp-section glp-pricing" id="preco">
        <div className="glp-wrap">
          <h2 className="glp-section-title">Preço simples, sem pegadinha</h2>
          <p className="glp-section-sub">Um plano só, tudo incluído. Preço público na tela — sem demo, sem vendedor, sem surpresa na fatura.</p>
          <div className="glp-price-card">
            <div className="glp-price-top">
              <div className="glp-tag">Plano único</div>
              <div className="glp-val">{PRECO_MENSAL}<small>/mês</small></div>
            </div>
            <div className="glp-price-body">
              <ul>
                <li><Check /> Checklists ilimitados</li>
                <li><Check /> Funcionários ilimitados</li>
                <li><Check /> Fotos, alertas e histórico</li>
                <li><Check /> Painel do gestor em tempo real</li>
                <li><Check /> Suporte direto com a gente</li>
              </ul>
              <button className="glp-btn glp-btn-primary" onClick={ir('cadastro')}>Testar grátis por {DIAS_TRIAL} dias</button>
              <p className="glp-price-note">Sem cartão de crédito · Sem taxa de implantação · Cancele quando quiser</p>
            </div>
          </div>
        </div>
      </section>

      <section className="glp-section">
        <div className="glp-wrap">
          <h2 className="glp-section-title">Perguntas frequentes</h2>
          <p className="glp-section-sub">As dúvidas mais comuns de quem está começando.</p>
          <div className="glp-faq-list">
            <details open><summary>Preciso instalar algum aplicativo? <span className="glp-chev">+</span></summary><p>Não. O Gestop funciona direto no navegador do celular e do computador. A equipe acessa pelo link, sem baixar nada da loja de apps.</p></details>
            <details><summary>Funciona pra qualquer tipo de restaurante? <span className="glp-chev">+</span></summary><p>Sim. Hamburguerias, pizzarias, bares, cafeterias, restaurantes — você cria os setores e tarefas do seu jeito, então se adapta a qualquer operação.</p></details>
            <details><summary>Meus funcionários precisam de e-mail e senha? <span className="glp-chev">+</span></summary><p>Não precisam criar conta. Eles entram com um código de acesso que você compartilha. Saiu da equipe? Você desativa na hora.</p></details>
            <details><summary>Como funciona o teste grátis? <span className="glp-chev">+</span></summary><p>São {DIAS_TRIAL} dias com tudo liberado, sem pedir cartão de crédito. Se gostar, é só assinar. Se não, é só não fazer nada — não cobramos.</p></details>
            <details><summary>Tem fidelidade ou multa pra cancelar? <span className="glp-chev">+</span></summary><p>Nenhuma. O plano é mensal e você cancela quando quiser, sem multa e sem burocracia.</p></details>
          </div>
        </div>
      </section>

      <div className="glp-wrap">
        <div className="glp-final">
          <h2>Pare de cobrar checklist no grito.</h2>
          <p>Em 5 minutos seu restaurante tem rotina organizada e você tem paz pra cuidar do que importa.</p>
          <button className="glp-btn glp-btn-light" onClick={ir('cadastro')}>Criar minha conta grátis →</button>
        </div>
      </div>

      <footer className="glp-footer">
        <div className="glp-wrap glp-foot-row">
          <div className="glp-logo" style={{ fontSize: '17px' }}><span className="glp-dot" style={{ width: '26px', height: '26px', fontSize: '14px' }}>{'✓'}</span> Gestop</div>
          <div>Operação sob controle · {new Date().getFullYear()}</div>
          <button className="glp-link-btn" onClick={ir('privacidade')}>Política de Privacidade</button>
        </div>
      </footer>
    </div>
  )
}
