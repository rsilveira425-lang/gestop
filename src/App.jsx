
import { useEffect, useState } from 'react'
import { getDoc, doc } from 'firebase/firestore'
import { db } from './services/firebase'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/auth/Login'
import Cadastro from './pages/auth/Cadastro'
import Recuperar from './pages/auth/Recuperar'
import Onboarding from './pages/onboarding/Onboarding'
import Dashboard from './pages/dashboard/Dashboard'

function AppContent() {
  const { user, loading } = useAuth()
  const [page, setPage] = useState('login')
  const [restaurantData, setRestaurantData] = useState(null)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (user) {
      setLoadingData(true)
      getDoc(doc(db, 'restaurants', user.uid)).then(snap => {
        setRestaurantData(snap.exists() ? snap.data() : null)
        setLoadingData(false)
      }).catch(() => setLoadingData(false))
    } else {
      setRestaurantData(null)
      setLoadingData(false)
    }
  }, [user])

  if (loading || loadingData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p style={{ color: '#64748b', fontSize: '16px' }}>Carregando...</p>
      </div>
    )
  }

  if (!user) {
    if (page === 'cadastro') return <Cadastro onBack={() => setPage('login')} onSuccess={() => setPage('login')} />
    if (page === 'recuperar') return <Recuperar onBack={() => setPage('login')} />
    return <Login onCadastro={() => setPage('cadastro')} onRecuperar={() => setPage('recuperar')} />
  }

  if (!restaurantData || !restaurantData.onboardingCompleto) {
    return <Onboarding onComplete={() => {
      getDoc(doc(db, 'restaurants', user.uid)).then(snap => {
        if (snap.exists()) setRestaurantData(snap.data())
      })
    }} />
  }

  return <Dashboard />
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
