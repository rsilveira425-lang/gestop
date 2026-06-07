import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../contexts/AuthContext'

export function useRestaurant() {
  const { user } = useAuth()
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getDoc(doc(db, 'restaurants', user.uid)).then(snap => {
      if (snap.exists()) setRestaurant({ id: snap.id, ...snap.data() })
      setLoading(false)
    })
  }, [user])

  return { restaurant, loading, setRestaurant }
}
