import { useEffect, useState } from 'react'
import { getDoc, setDoc, updateDoc, doc } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { db, auth } from './services/firebase'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { getTurnos } from './config/turnos'
import Login from './pages/auth/Login'
import Cadastro from './pages/auth/Cadastro'
import Recuperar from './pages/auth/Recuperar'
import Onboarding from './pages/onboarding/Onboarding'
import Dashboard from './pages/dashboard/Dashboard'
import EntrarRestaurante from './pages/auth/EntrarRestaurante'
import Landing from './pages/landing/Landing'
import Privacidade from './pages/legal/Privacidade'
import Paywall from './pages/billing/Paywall'
import { diasRestantesTrial } from './config/billing'

function AppContent() {
  const { user, loading } = useAuth()
  const [page, setPage] = useState('landing')
  const [restaurantData, setRestaurantData] = useState(null)
  const [usuarioData, setUsuarioData] = useState(null)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (user) {
      setLoadingData(true)
      getDoc(doc(db, 'usuarios', user.uid)).then(async snap => {
        if (snap.exists()) {
          const u = snap.data()
          setUsuarioData(u)
          const r = await getDoc(doc(db, 'restaurants', u.restaurantId))
          if (r.exists()) {
            const restData = r.data()
            if (u.role === 'dono' && !restData.codigoAcesso) {
              const code = Math.random().toString(36).substring(2, 8).toUpperCase()
              await updateDoc(doc(db, 'restaurants', u.restaurantId), { codigoAcesso: code })
              await setDoc(doc(db, 'convites', code), { restaurantId: u.restaurantId, nomeRestaurante: restData.nomeRestaurante || '' })
              restData.codigoAcesso = code
            }
            // Inicia o trial de contas que ainda não têm (contas antigas)
            if (u.role === 'dono' && restData.onboardingCompleto && !restData.trialInicio) {
              const inicio = new Date().toISOString()
              await updateDoc(doc(db, 'restaurants', u.restaurantId), { trialInicio: inicio })
              restData.trialInicio = inicio
            }
            setRestaurantData(restData)
          } else { setRestaurantData(null) }
          setLoadingData(false)
        } else {
          // Usuário existente antes do multi-usuário - migrar automaticamente
          const r = await getDoc(doc(db, 'restaurants', user.uid))
          if (r.exists()) {
            const restData = r.data()
            let code = restData.codigoAcesso
            if (!code) {
              code = Math.random().toString(36).substring(2, 8).toUpperCase()
              await updateDoc(doc(db, 'restaurants', user.uid), { codigoAcesso: code })
              await setDoc(doc(db, 'convites', code), { restaurantId: user.uid, nomeRestaurante: restData.nomeRestaurante || '' })
            }
            const u = { restaurantId: user.uid, role: 'dono', nome: user.email, email: user.email }
            await setDoc(doc(db, 'usuarios', user.uid), u)
            setUsuarioData(u)
            setRestaurantData(restData)
          } else {
            setUsuarioData(null)
            setRestaurantData(null)
          }
          setLoadingData(false)
        }
      }).catch(() => setLoadingData(false))
    } else {
      setUsuarioData(null)
      setRestaurantData(null)
      setLoadingData(false)
    }
  }, [user])

  if (loading || loadingData) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p style={{ color: '#64748b', fontSize: '16px' }}>Carregando...</p>
    </div>
  )

  if (page === 'privacidade') return <Privacidade onBack={() => setPage(user ? 'app' : 'landing')} />

  if (!user) {
    if (page === 'cadastro') return <Cadastro onNavigate={setPage} onBack={() => setPage('login')} onSuccess={() => setPage('login')} />
    if (page === 'recuperar') return <Recuperar onBack={() => setPage('login')} />
    if (page === 'login') return <Login onNavigate={setPage} />
    return <Landing onNavigate={setPage} />
  }

  if (!usuarioData) {
    return (
      <EntrarRestaurante
        onCriarRestaurante={async () => {
          const u = { restaurantId: user.uid, role: 'dono', nome: user.email, email: user.email }
          await setDoc(doc(db, 'usuarios', user.uid), u)
          setUsuarioData(u)
          setRestaurantData(null)
        }}
        onEntrou={async (restaurantId, codigo) => {
          const u = { restaurantId, role: 'funcionario', nome: user.displayName || user.email, email: user.email, codigo, ativo: true }
          await setDoc(doc(db, 'usuarios', user.uid), u)
          setUsuarioData(u)
          const r = await getDoc(doc(db, 'restaurants', restaurantId))
          setRestaurantData(r.exists() ? r.data() : null)
        }}
      />
    )
  }

  if (usuarioData.ativo === false) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', backgroundColor: '#f8fafc', textAlign: 'center' }}>
        <p style={{ fontSize: '40px', margin: 0 }}>🔒</p>
        <h2 style={{ color: '#1e293b', margin: '12px 0 4px' }}>Acesso desativado</h2>
        <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '300px' }}>Seu acesso a este restaurante foi desativado pelo gestor.</p>
        <button onClick={() => signOut(auth)} style={{ marginTop: '20px', padding: '12px 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>Sair</button>
      </div>
    )
  }

  // Trial expirado e sem assinatura: bloqueia
  const diasTrial = diasRestantesTrial(restaurantData)
  if (restaurantData?.onboardingCompleto && !restaurantData?.assinaturaAtiva && diasTrial !== null && diasTrial <= 0) {
    return <Paywall papel={usuarioData.role} restaurantId={usuarioData.restaurantId} />
  }

  if (usuarioData.role === 'dono' && (!restaurantData || !restaurantData.onboardingCompleto)) {
    return <Onboarding onConcluir={async () => {
      const r = await getDoc(doc(db, 'restaurants', user.uid))
      if (r.exists()) {
        const restData = r.data()
        if (!restData.codigoAcesso) {
          const code = Math.random().toString(36).substring(2, 8).toUpperCase()
          await updateDoc(doc(db, 'restaurants', user.uid), { codigoAcesso: code })
          await setDoc(doc(db, 'convites', code), { restaurantId: user.uid, nomeRestaurante: restData.nomeRestaurante || '' })
        }
        setRestaurantData(r.data())
      }
    }} />
  }

  return (
    <Dashboard
      restaurantId={usuarioData.restaurantId}
      userRole={usuarioData.role}
      userName={usuarioData.nome || user.email}
      codigoAcesso={restaurantData?.codigoAcesso || ''}
      turnos={getTurnos(restaurantData)}
      diasTrial={diasTrial}
      onRestaurantUpdate={partial => setRestaurantData(prev => ({ ...(prev || {}), ...partial }))}
    />
  )
}

export default function App() {
  return <AuthProvider><AppContent /></AuthProvider>
}
