// Política de Privacidade do Gestop.
// Texto base em linguagem simples, alinhado à LGPD. Recomenda-se revisão por
// advogado se o negócio crescer. Para atualizar, edite o texto abaixo e a data.

const ATUALIZADO_EM = '22 de junho de 2026'
const CONTATO = 'rsilveira819@gmail.com'
const RESPONSAVEL = 'Rodrigo Schinnaider'

export default function Privacidade({ onBack = () => {} }) {
  const s = {
    page: { minHeight: '100vh', backgroundColor: '#f8fafc', color: '#1e293b' },
    header: { backgroundColor: '#2563eb', color: 'white', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '12px' },
    back: { background: 'none', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer' },
    body: { maxWidth: '760px', margin: '0 auto', padding: '24px 20px 64px', lineHeight: 1.6, fontSize: '15px' },
    h2: { fontSize: '18px', fontWeight: 700, margin: '28px 0 8px', color: '#0f172a' },
    p: { margin: '0 0 12px', color: '#334155' },
    li: { margin: '0 0 6px', color: '#334155' },
    small: { fontSize: '13px', color: '#94a3b8' },
    a: { color: '#2563eb' },
  }
  return (
    <div style={s.page}>
      <div style={s.header}>
        <button style={s.back} onClick={onBack}>{String.fromCharCode(8592)}</button>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Política de Privacidade</h1>
      </div>
      <div style={s.body}>
        <p style={s.small}>Última atualização: {ATUALIZADO_EM}</p>

        <p style={s.p}>
          Esta política explica, de forma simples, como o Gestop coleta, usa e protege os dados
          pessoais de quem usa o serviço. Ao usar o Gestop, você concorda com o aqui descrito.
        </p>

        <h2 style={s.h2}>1. Quem é o responsável</h2>
        <p style={s.p}>
          O Gestop é operado por {RESPONSAVEL}. Para qualquer assunto relacionado a dados
          pessoais, o contato é <a style={s.a} href={'mailto:' + CONTATO}>{CONTATO}</a>.
        </p>

        <h2 style={s.h2}>2. Quais dados coletamos</h2>
        <ul>
          <li style={s.li}><b>Dados de cadastro:</b> nome e e-mail do dono e dos funcionários que acessam a conta.</li>
          <li style={s.li}><b>Dados de operação:</b> setores, turnos, tarefas, respostas dos checklists, comentários e fotos que você registra no app.</li>
          <li style={s.li}><b>Dados de pagamento:</b> ao assinar, o pagamento é processado pelo Mercado Pago. Não armazenamos números de cartão — apenas a informação de que a assinatura está ativa.</li>
          <li style={s.li}><b>Dados técnicos e de uso:</b> informações coletadas automaticamente para funcionamento e medição (por exemplo, identificadores de acesso e estatísticas de navegação).</li>
        </ul>

        <h2 style={s.h2}>3. Para que usamos os dados</h2>
        <ul>
          <li style={s.li}>Permitir o login e o funcionamento do app (criar checklists, relatórios e equipe).</li>
          <li style={s.li}>Processar e controlar a assinatura.</li>
          <li style={s.li}>Garantir a segurança e prevenir uso indevido.</li>
          <li style={s.li}>Medir o uso e melhorar o serviço.</li>
        </ul>

        <h2 style={s.h2}>4. Com quem compartilhamos</h2>
        <p style={s.p}>
          Não vendemos seus dados. Eles são tratados apenas pelos serviços que tornam o Gestop possível:
        </p>
        <ul>
          <li style={s.li}><b>Google Firebase</b> — autenticação, banco de dados e armazenamento dos dados.</li>
          <li style={s.li}><b>Vercel</b> — hospedagem do aplicativo.</li>
          <li style={s.li}><b>Mercado Pago</b> — processamento dos pagamentos da assinatura.</li>
          <li style={s.li}><b>Meta (Facebook/Instagram) e Google Analytics</b> — medição de visitas e conversões, por meio de cookies, nas páginas públicas.</li>
        </ul>

        <h2 style={s.h2}>5. Dados dos funcionários</h2>
        <p style={s.p}>
          Quando o dono do restaurante cadastra funcionários, ele é responsável por informá-los de que
          os dados (nome e e-mail) serão usados no Gestop para a operação dos checklists.
        </p>

        <h2 style={s.h2}>6. Por quanto tempo guardamos</h2>
        <p style={s.p}>
          Mantemos os dados enquanto a conta estiver ativa. Após o cancelamento, os dados podem ser
          mantidos por um período adicional para fins legais e administrativos e depois excluídos,
          salvo quando a lei exigir prazo diferente.
        </p>

        <h2 style={s.h2}>7. Seus direitos</h2>
        <p style={s.p}>
          Conforme a Lei Geral de Proteção de Dados (LGPD), você pode solicitar a qualquer momento o
          acesso, a correção, a exclusão dos seus dados, a portabilidade ou a revogação de
          consentimento. Basta escrever para <a style={s.a} href={'mailto:' + CONTATO}>{CONTATO}</a>.
        </p>

        <h2 style={s.h2}>8. Segurança</h2>
        <p style={s.p}>
          Adotamos medidas para proteger os dados, como autenticação de acesso e regras que limitam
          cada usuário a ver apenas os dados do seu próprio restaurante. Nenhum sistema é 100% imune,
          mas trabalhamos para reduzir riscos.
        </p>

        <h2 style={s.h2}>9. Crianças e adolescentes</h2>
        <p style={s.p}>O Gestop é destinado a empresas e a maiores de 18 anos.</p>

        <h2 style={s.h2}>10. Alterações nesta política</h2>
        <p style={s.p}>
          Podemos atualizar esta política. Quando isso acontecer, mudaremos a data de “última
          atualização” no topo. Recomendamos revisá-la periodicamente.
        </p>

        <p style={{ ...s.small, marginTop: '28px' }}>
          Em caso de dúvidas, escreva para {CONTATO}.
        </p>
      </div>
    </div>
  )
}
