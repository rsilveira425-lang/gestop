import { useState } from 'react'
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth'
import { auth } from '../../services/firebase'

export default function Cadastro({ onNavigate }) {
  const [form, setForm] = useState({ responsavel:'', email:'', senha:'', confirmar:'' })
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  function handle(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleCadastro(e) {
    e.preventDefault()
    setErro('')
    if (form.senha !== form.confirmar) { setErro('As senhas não coincidem.'); return }
    if (form.senha.length < 6) { setErro('A senha deve ter no mínimo 6 caracteres.'); return }
    setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.senha)
      if (form.responsavel) {
        await updateProfile(cred.user, { displayName: form.responsavel })
      }
      try { await sendEmailVerification(cred.user) } catch(e) { /* não bloqueia o cadastro */ }
      // restaurante criado no Onboarding (dono) ou via convite (funcionario)
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') setErro('Este e-mail já está cadastrado.')
      else setErro('Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.screen}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.logo}>Gestop</h1>
          <p style={styles.tagline}>Operação sob controle.</p>
        </div>
        <div style={styles.form}>
          <h2 style={styles.title}>Criar conta</h2>
          <form onSubmit={handleCadastro}>
            <input style={styles.input} name="responsavel" placeholder="Seu nome"
              value={form.responsavel} onChange={handle} required />
            <input style={styles.input} type="email" name="email" placeholder="E-mail"
              value={form.email} onChange={handle} required />
            <input style={styles.input} type="password" name="senha" placeholder="Senha (mín. 6 caracteres)"
              value={form.senha} onChange={handle} required />
            <input style={styles.input} type="password" name="confirmar" placeholder="Confirmar senha"
              value={form.confirmar} onChange={handle} required />
            {erro && <p style={styles.erro}>{erro}</p>}
            <button style={styles.btn} type="submit" disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>
          <div style={styles.links}>
            <button style={styles.link} onClick={() => onNavigate('login')}>Já tenho conta</button>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  screen: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
    background:'linear-gradient(135deg, #1e3a8a, #2563eb)', padding:'24px' },
  card: { background:'#fff', borderRadius:'16px', width:'100%', maxWidth:'380px',
    overflow:'hidden', boxShadow:'0 8px 32px rgba(0,0,0,0.2)' },
  header: { background:'#2563eb', padding:'32px 24px', textAlign:'center' },
  logo: { margin:0, color:'#fff', fontSize:'32px', fontWeight:700 },
  tagline: { margin:'4px 0 0', color:'rgba(255,255,255,0.85)', fontSize:'14px' },
  form: { padding:'24px' },
  title: { margin:'0 0 20px', fontSize:'20px', fontWeight:600, color:'#0f172a' },
  input: { width:'100%', padding:'12px', border:'2px solid #e2e8f0', borderRadius:'8px',
    fontSize:'15px', marginBottom:'12px', outline:'none', boxSizing:'border-box' },
  erro: { color:'#dc2626', fontSize:'13px', margin:'-4px 0 8px' },
  btn: { width:'100%', padding:'13px', background:'#2563eb', color:'#fff', border:'none',
    borderRadius:'8px', fontSize:'15px', fontWeight:600, cursor:'pointer' },
  links: { display:'flex', justifyContent:'center', marginTop:'16px' },
  link: { background:'none', border:'none', color:'#2563eb', fontSize:'13px', cursor:'pointer', padding:0 },
}
