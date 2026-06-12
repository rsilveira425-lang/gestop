import { signOut } from 'firebase/auth'
import { auth } from '../../services/firebase'
import { PRECO_MENSAL, DIAS_TRIAL, LINK_ASSINATURA, EMAIL_CONTATO, linkAssinaturaPara } from '../../config/billing'

export default function Paywall({ papel = 'dono', restaurantId = '' }) {
  if (papel !== 'dono') {
    return (
      <div style={s.screen}>
        <div style={s.card}>
          <div style={{ fontSize: '40px' }}>⏸️</div>
          <h2 style={s.titulo}>Assinatura inativa</h2>
          <p style={s.texto}>A assinatura deste restaurante está inativa. Fale com o gestor do restaurante para reativar o acesso.</p>
          <button style={s.btnGhost} onClick={() => signOut(auth)}>Sair</button>
        </div>
      </div>
    )
  }

  return (
    <div style={s.screen}>
      <div style={s.card}>
        <div style={{ fontSize: '40px' }}>🚀</div>
        <h2 style={s.titulo}>Seu teste grátis de {DIAS_TRIAL} dias terminou</h2>
        <p style={s.texto}>
          Gostou do Gestop? Pra continuar usando — com sua equipe, seus checklists e todo o histórico exatamente
          como deixou — é só assinar:
        </p>
        <p style={s.preco}>{PRECO_MENSAL}<span style={s.precoMes}>/mês</span></p>
        {LINK_ASSINATURA ? (
          <>
            <a href={linkAssinaturaPara(restaurantId)} target="_blank" rel="noreferrer" style={s.btnAssinar}>
              Assinar com Mercado Pago →
            </a>
            <p style={s.nota}>Após o pagamento, seu acesso é liberado automaticamente em alguns minutos. Dúvidas: {EMAIL_CONTATO}</p>
          </>
        ) : (
          <p style={s.nota}>
            Pra assinar, fale com a gente: <a href={`mailto:${EMAIL_CONTATO}`} style={{ color: '#2563eb', fontWeight: 600 }}>{EMAIL_CONTATO}</a>
          </p>
        )}
        <button style={s.btnGhost} onClick={() => signOut(auth)}>Sair</button>
      </div>
    </div>
  )
}

const s = {
  screen: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '24px' },
  card: { backgroundColor: 'white', borderRadius: '16px', padding: '36px 28px', maxWidth: '420px', width: '100%', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
  titulo: { margin: '12px 0 8px', fontSize: '22px', fontWeight: 800, color: '#0f172a' },
  texto: { margin: '0 0 16px', fontSize: '14px', color: '#64748b', lineHeight: 1.6 },
  preco: { margin: '0 0 20px', fontSize: '40px', fontWeight: 800, color: '#0f172a' },
  precoMes: { fontSize: '15px', fontWeight: 500, color: '#64748b' },
  btnAssinar: { display: 'block', padding: '15px', borderRadius: '12px', background: '#2563eb', color: 'white', fontSize: '16px', fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' },
  nota: { fontSize: '12px', color: '#94a3b8', marginTop: '12px', lineHeight: 1.5 },
  btnGhost: { marginTop: '20px', padding: '10px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontSize: '13px', color: '#64748b', cursor: 'pointer' },
}
