import { PRECO_MENSAL, DIAS_TRIAL } from '../../config/billing'

const RECURSOS = [
  { icone: '✅', titulo: 'Checklists por turno', desc: 'Abertura, pico e fechamento. Cada setor sabe exatamente o que fazer e quando.' },
  { icone: '📸', titulo: 'Foto como prova', desc: 'A equipe registra com foto. Você confere de onde estiver, sem precisar estar no salão.' },
  { icone: '🔔', titulo: 'Alertas de turno', desc: 'Turno não concluído no horário? O painel avisa antes de virar problema com cliente.' },
  { icone: '👥', titulo: 'Gestão de equipe', desc: 'Funcionários entram com um código. Saiu da equipe? Desativa na hora, sem dor de cabeça.' },
  { icone: '📊', titulo: 'Painel do gestor', desc: 'Quem fez, o que fez, a que horas. Tudo num painel simples, dia a dia.' },
  { icone: '🕒', titulo: 'Histórico de 15 dias', desc: 'Auditoria rápida: navegue pelos checklists anteriores com respostas, fotos e comentários.' },
]

const PASSOS = [
  { n: '1', titulo: 'Cadastre seu restaurante', desc: 'Crie a conta, defina setores e tarefas em menos de 5 minutos.' },
  { n: '2', titulo: 'Convide a equipe', desc: 'Compartilhe o código de acesso. Cada funcionário usa no próprio celular.' },
  { n: '3', titulo: 'Acompanhe de onde estiver', desc: 'O painel mostra em tempo real o que foi feito em cada turno.' },
]

export default function Landing({ onNavigate }) {
  const s = styles
  return (
    <div style={s.page}>
      {/* Header */}
      <header style={s.header}>
        <span style={s.logo}>Gestop</span>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={s.btnGhost} onClick={() => onNavigate('login')}>Entrar</button>
          <button style={s.btnSmall} onClick={() => onNavigate('cadastro')}>Teste grátis</button>
        </div>
      </header>

      {/* Hero */}
      <section style={s.hero}>
        <h1 style={s.heroTitle}>Seu restaurante funcionando direito,<br />mesmo quando você não está lá.</h1>
        <p style={s.heroSub}>
          O Gestop transforma a operação do seu restaurante em checklists simples por turno —
          com foto como prova e um painel pra você acompanhar tudo do celular.
        </p>
        <button style={s.btnHero} onClick={() => onNavigate('cadastro')}>
          Começar teste grátis de {DIAS_TRIAL} dias →
        </button>
        <p style={s.heroNote}>Sem cartão de crédito. Cancele quando quiser.</p>
      </section>

      {/* Como funciona */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>Como funciona</h2>
        <div style={s.grid3}>
          {PASSOS.map(p => (
            <div key={p.n} style={s.passo}>
              <div style={s.passoNum}>{p.n}</div>
              <h3 style={s.cardTitle}>{p.titulo}</h3>
              <p style={s.cardDesc}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recursos */}
      <section style={{ ...s.section, backgroundColor: 'white' }}>
        <h2 style={s.sectionTitle}>Tudo que a operação precisa</h2>
        <div style={s.grid3}>
          {RECURSOS.map(r => (
            <div key={r.titulo} style={s.card}>
              <div style={{ fontSize: '28px' }}>{r.icone}</div>
              <h3 style={s.cardTitle}>{r.titulo}</h3>
              <p style={s.cardDesc}>{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Preço */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>Preço simples, sem pegadinha</h2>
        <div style={s.precoCard}>
          <p style={s.precoLabel}>Plano único</p>
          <p style={s.preco}>{PRECO_MENSAL}<span style={s.precoMes}>/mês</span></p>
          <ul style={s.precoLista}>
            <li style={s.precoItem}>✓ Checklists ilimitados</li>
            <li style={s.precoItem}>✓ Funcionários ilimitados</li>
            <li style={s.precoItem}>✓ Fotos, alertas e histórico</li>
            <li style={s.precoItem}>✓ Suporte direto com a gente</li>
          </ul>
          <button style={{ ...s.btnHero, width: '100%' }} onClick={() => onNavigate('cadastro')}>
            Testar grátis por {DIAS_TRIAL} dias
          </button>
        </div>
      </section>

      {/* CTA final */}
      <section style={{ ...s.section, backgroundColor: '#1e3a8a', textAlign: 'center' }}>
        <h2 style={{ ...s.sectionTitle, color: 'white' }}>Pare de cobrar checklist no grito.</h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', maxWidth: '480px', margin: '0 auto 24px', fontSize: '15px', lineHeight: 1.6 }}>
          Em 5 minutos seu restaurante tem rotina organizada e você tem paz pra cuidar do que importa.
        </p>
        <button style={s.btnHero} onClick={() => onNavigate('cadastro')}>Criar minha conta grátis →</button>
      </section>

      <footer style={s.footer}>
        <span style={{ fontWeight: 700, color: '#2563eb' }}>Gestop</span> · Operação sob controle · {new Date().getFullYear()}
        <br />
        <button onClick={() => onNavigate('privacidade')} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline', padding: '8px 0 0' }}>Política de Privacidade</button>
      </footer>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 },
  logo: { fontSize: '22px', fontWeight: 800, color: '#2563eb' },
  btnGhost: { padding: '9px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontSize: '14px', fontWeight: 600, color: '#0f172a', cursor: 'pointer' },
  btnSmall: { padding: '9px 16px', borderRadius: '8px', border: 'none', background: '#2563eb', color: 'white', fontSize: '14px', fontWeight: 700, cursor: 'pointer' },
  hero: { textAlign: 'center', padding: '64px 24px 56px', maxWidth: '720px', margin: '0 auto' },
  heroTitle: { fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, lineHeight: 1.2, margin: '0 0 16px' },
  heroSub: { fontSize: '17px', color: '#64748b', lineHeight: 1.6, margin: '0 0 28px' },
  btnHero: { padding: '15px 28px', borderRadius: '12px', border: 'none', background: '#2563eb', color: 'white', fontSize: '16px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' },
  heroNote: { fontSize: '13px', color: '#94a3b8', marginTop: '12px' },
  section: { padding: '56px 24px' },
  sectionTitle: { textAlign: 'center', fontSize: '26px', fontWeight: 800, margin: '0 0 32px' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', maxWidth: '900px', margin: '0 auto' },
  passo: { backgroundColor: 'white', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', textAlign: 'center' },
  passoNum: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#2563eb', color: 'white', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '16px' },
  card: { backgroundColor: '#f8fafc', borderRadius: '14px', padding: '24px', border: '1px solid #e2e8f0' },
  cardTitle: { fontSize: '16px', fontWeight: 700, margin: '10px 0 6px' },
  cardDesc: { fontSize: '14px', color: '#64748b', lineHeight: 1.55, margin: 0 },
  precoCard: { maxWidth: '380px', margin: '0 auto', backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', border: '2px solid #2563eb', textAlign: 'center' },
  precoLabel: { margin: 0, fontSize: '13px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '1px' },
  preco: { margin: '8px 0 16px', fontSize: '44px', fontWeight: 800 },
  precoMes: { fontSize: '16px', fontWeight: 500, color: '#64748b' },
  precoLista: { listStyle: 'none', padding: 0, margin: '0 0 24px', textAlign: 'left' },
  precoItem: { padding: '7px 0', fontSize: '14px', color: '#475569', borderBottom: '1px solid #f1f5f9' },
  footer: { textAlign: 'center', padding: '24px', fontSize: '13px', color: '#94a3b8', backgroundColor: 'white', borderTop: '1px solid #e2e8f0' },
}
