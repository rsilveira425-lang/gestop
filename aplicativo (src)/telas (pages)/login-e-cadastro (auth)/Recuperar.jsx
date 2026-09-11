import { useState } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../../conexoes (services)/firebase'
import { Screen, Card, Button, Input, Banner } from '../../componentes (design)'

/**
 * Mesma casca do Login e do Cadastro. O sucesso vira <Banner>, que já
 * tem role="status" — o leitor de tela anuncia sem precisar de foco.
 */
export default function Recuperar({ onNavigate }) {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRecuperar(e) {
    e.preventDefault()
    setErro(''); setMsg('')
    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, email)
      setMsg('E-mail de recuperação enviado! Verifique sua caixa de entrada.')
    } catch {
      setErro('E-mail não encontrado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen variant="centered" className="gs-screen--dark">
      <Card variant="raised" pad="none" style={{ width: '100%', maxWidth: '380px', overflow: 'hidden' }}>
        <div style={{ background: 'var(--gs-gradient-band)', padding: 'var(--gs-space-8) var(--gs-space-6)', textAlign: 'center' }}>
          <button onClick={() => onNavigate('landing')} className="gs-appbar__title" style={{ fontSize: 'var(--gs-text-3xl)', fontWeight: 'var(--gs-weight-black)' }}>
            Gestop
          </button>
          <p className="gs-appbar__sub">Operação sob controle.</p>
        </div>

        <div style={{ padding: 'var(--gs-space-6)' }}>
          <h2 className="gs-h4" style={{ marginBottom: 'var(--gs-space-2)' }}>Recuperar senha</h2>
          <p className="gs-muted" style={{ marginBottom: 'var(--gs-space-5)' }}>
            Digite seu e-mail e enviaremos um link para redefinir sua senha.
          </p>

          {msg && (
            <div style={{ marginBottom: 'var(--gs-space-4)' }}>
              <Banner tone="success">{msg}</Banner>
            </div>
          )}

          <form onSubmit={handleRecuperar} noValidate>
            <Input
              label="E-mail" type="email" autoComplete="email" placeholder="voce@restaurante.com.br"
              value={email} onChange={e => setEmail(e.target.value)} required
              error={erro}
            />
            <Button type="submit" block loading={loading} loadingText="Enviando...">Enviar link</Button>
          </form>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--gs-space-4)' }}>
            <button className="gs-linkbtn" onClick={() => onNavigate('login')}>Voltar ao login</button>
          </div>
        </div>
      </Card>
    </Screen>
  )
}
