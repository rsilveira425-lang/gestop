import { useState } from 'react'
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth'
import { auth } from '../../conexoes (services)/firebase'
import { Screen, Card, Button, Input } from '../../componentes (design)'

/**
 * Par do Login: mesma casca, mesmos componentes, mesmos tokens.
 * Nenhum hex e nenhum px solto — se a marca mudar, muda em tokens.css.
 */
export default function Cadastro({ onNavigate }) {
  const [form, setForm] = useState({ responsavel: '', email: '', senha: '', confirmar: '' })
  const [erro, setErro] = useState({ campo: '', texto: '' })
  const [loading, setLoading] = useState(false)

  function handle(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleCadastro(e) {
    e.preventDefault()
    setErro({ campo: '', texto: '' })

    // O erro nasce colado no campo que o causou, em vez de num aviso solto
    // no fim do formulário: assim o leitor de tela o anuncia junto do campo.
    if (form.senha !== form.confirmar) {
      setErro({ campo: 'confirmar', texto: 'As senhas não coincidem.' }); return
    }
    if (form.senha.length < 6) {
      setErro({ campo: 'senha', texto: 'A senha deve ter no mínimo 6 caracteres.' }); return
    }

    setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.senha)
      if (form.responsavel) {
        await updateProfile(cred.user, { displayName: form.responsavel })
      }
      try { await sendEmailVerification(cred.user) } catch { /* não bloqueia o cadastro */ }
      if (window.fbq) window.fbq('track', 'CompleteRegistration')
      // restaurante criado no Onboarding (dono) ou via convite (funcionario)
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setErro({ campo: 'email', texto: 'Este e-mail já está cadastrado.' })
      } else {
        setErro({ campo: 'email', texto: 'Erro ao criar conta. Tente novamente.' })
      }
    } finally {
      setLoading(false)
    }
  }

  const erroDe = (campo) => (erro.campo === campo ? erro.texto : undefined)

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
          <h2 className="gs-h4" style={{ marginBottom: 'var(--gs-space-5)' }}>Criar conta</h2>

          <form onSubmit={handleCadastro} noValidate>
            <Input
              label="Seu nome" name="responsavel" autoComplete="name" placeholder="Como a equipe te chama"
              value={form.responsavel} onChange={handle} required
            />
            <Input
              label="E-mail" name="email" type="email" autoComplete="email" placeholder="voce@restaurante.com.br"
              value={form.email} onChange={handle} required
              error={erroDe('email')}
            />
            <Input
              label="Senha" name="senha" type="password" autoComplete="new-password" placeholder="Mínimo 6 caracteres"
              value={form.senha} onChange={handle} required
              error={erroDe('senha')}
            />
            <Input
              label="Confirmar senha" name="confirmar" type="password" autoComplete="new-password" placeholder="Repita a senha"
              value={form.confirmar} onChange={handle} required
              error={erroDe('confirmar')}
            />
            <Button type="submit" block loading={loading} loadingText="Criando conta...">Criar conta</Button>
          </form>

          <p className="gs-muted" style={{ textAlign: 'center', marginTop: 'var(--gs-space-4)' }}>
            Ao criar conta, você concorda com a{' '}
            <button type="button" className="gs-linkbtn" onClick={() => onNavigate('privacidade')}>
              Política de Privacidade
            </button>.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--gs-space-4)' }}>
            <button className="gs-linkbtn" onClick={() => onNavigate('login')}>Já tenho conta</button>
          </div>
        </div>
      </Card>
    </Screen>
  )
}
