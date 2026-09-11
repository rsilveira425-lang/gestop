import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../conexoes (services)/firebase'
import { Screen, Card, Button, Input } from '../../componentes (design)'

/**
 * Tela de referência do design system: nenhum hex, nenhum px solto.
 * Tudo que é visual vem de <Screen>, <Card>, <Input>, <Button> e dos tokens.
 */
export default function Login({ onNavigate }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, senha)
    } catch {
      setErro('E-mail ou senha incorretos.')
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
          <h2 className="gs-h4" style={{ marginBottom: 'var(--gs-space-5)' }}>Entrar</h2>

          <form onSubmit={handleLogin} noValidate>
            <Input
              label="E-mail" type="email" autoComplete="email" placeholder="voce@restaurante.com.br"
              value={email} onChange={e => setEmail(e.target.value)} required
            />
            <Input
              label="Senha" type="password" autoComplete="current-password" placeholder="Sua senha"
              value={senha} onChange={e => setSenha(e.target.value)} required
              error={erro}
            />
            <Button type="submit" block loading={loading} loadingText="Entrando...">Entrar</Button>
          </form>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--gs-space-3)', marginTop: 'var(--gs-space-4)' }}>
            <button className="gs-linkbtn" onClick={() => onNavigate('recuperar')}>Esqueci minha senha</button>
            <button className="gs-linkbtn" onClick={() => onNavigate('cadastro')}>Criar conta</button>
          </div>
        </div>
      </Card>
    </Screen>
  )
}
