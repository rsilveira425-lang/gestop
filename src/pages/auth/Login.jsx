import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../services/firebase'

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
    } catch (err) {
      setErro('E-mail ou senha incorretos.')
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
          <h2 style={styles.title}>Entrar</h2>
          <form onSubmit={handleLogin}>
            <input style={styles.input} type="email" placeholder="E-mail" value={email}
              onChange={e => setEmail(e.target.value)} required />
            <input style={styles.input} type="password" placeholder="Senha" value={senha}
              onChange={e => setSenha(e.target.value)} required />
            {erro && <p style={styles.erro}>{erro}</p>}
            <button style={styles.btn} type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          <div style={styles.links}>
            <button style={styles.link} onClick={() => onNavigate('recuperar')}>Esqueci minha senha</button>
            <button style={styles.link} onClick={() => onNavigate('cadastro')}>Criar conta</button>
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
  links: { display:'flex', justifyContent:'space-between', marginTop:'16px' },
  link: { background:'none', border:'none', color:'#2563eb', fontSize:'13px', cursor:'pointer', padding:0 },
}
