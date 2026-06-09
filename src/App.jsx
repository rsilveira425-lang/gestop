import { useEffect, useState } from 'react'
import { getDoc, setDoc, updateDoc, doc } from 'firebase/firestore'
import { db } from './services/firebase'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/auth/Login'
import Cadastro from './pages/auth/Cadastro'
import Recuperar from './pages/auth/Recuperar'
import Onboarding from './pages/onboarding/Onboarding'
import Dashboard from './pages/dashboard/Dashboard'
import EntrarRestaurante from './pages/auth/EntrarRestaurante'

function AppContent() {
  const { user, loading } = useAuth()
  const [page, setPage] = useState('login')
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

  if (!user) {
    if (page === 'cadastro') return <Cadastro onBack={() => setPage('login')} onSuccess={() => setPage('login')} />
    if (page === 'recuperar') return <Recuperar onBack={() => setPage('login')} />
    return <Login onNavigate={setPage} />
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
        onEntrou={async (restaurantId) => {
          const u = { restaurantId, role: 'funcionario', nome: user.displayName || user.email, email: user.email }
          await setDoc(doc(db, 'usuarios', user.uid), u)
          setUsuarioData(u)
          const r = await getDoc(doc(db, 'restaurants', restaurantId))
          setRestaurantData(r.exists() ? r.data() : null)
        }}
      />
    )
  }

  if (usuarioData.role === 'dono' && (!restaurantData || !restaurantData.onboardingCompleto)) {
    return <Onboarding onComplete={async () => {
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
    />
  )
}

export default function App() {
  return <AuthProvider><AppContent /></AuthProvider>
}
