import { useState } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../../services/firebase'

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
    <div style={styles.screen}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.logo}>Gestop</h1>
          <p style={styles.tagline}>Operação sob controle.</p>
        </div>
        <div style={styles.form}>
          <h2 style={styles.title}>Recuperar senha</h2>
          <p style={styles.desc}>Digite seu e-mail e enviaremos um link para redefinir sua senha.</p>
          <form onSubmit={handleRecuperar}>
            <input style={styles.input} type="email" placeholder="Seu e-mail"
              value={email} onChange={e => setEmail(e.target.value)} required />
            {erro && <p style={styles.erro}>{erro}</p>}
            {msg && <p style={styles.sucesso}>{msg}</p>}
            <button style={styles.btn} type="submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar link'}
            </button>
          </form>
          <div style={styles.links}>
            <button style={styles.link} onClick={() => onNavigate('login')}>Voltar ao login</button>
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
  title: { margin:'0 0 8px', fontSize:'20px', fontWeight:600, color:'#0f172a' },
  desc: { margin:'0 0 16px', fontSize:'13px', color:'#64748b' },
  input: { width:'100%', padding:'12px', border:'2px solid #e2e8f0', borderRadius:'8px',
    fontSize:'15px', marginBottom:'12px', outline:'none', boxSizing:'border-box' },
  erro: { color:'#dc2626', fontSize:'13px', margin:'-4px 0 8px' },
  sucesso: { color:'#16a34a', fontSize:'13px', margin:'-4px 0 8px' },
  btn: { width:'100%', padding:'13px', background:'#2563eb', color:'#fff', border:'none',
    borderRadius:'8px', fontSize:'15px', fontWeight:600, cursor:'pointer' },
  links: { display:'flex', justifyContent:'center', marginTop:'16px' },
  link: { background:'none', border:'none', color:'#2563eb', fontSize:'13px', cursor:'pointer', padding:0 },
}
