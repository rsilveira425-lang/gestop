import { useState } from 'react'
import { getDoc, doc } from 'firebase/firestore'
import { db } from '../../services/firebase'

export default function EntrarRestaurante({ onCriarRestaurante, onEntrou }) {
  const [codigo, setCodigo] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  async function entrar() {
    if (codigo.trim().length < 4) { setErro('Código inválido'); return }
    setCarregando(true)
    setErro('')
    try {
      const cod = codigo.trim().toUpperCase()
      const snap = await getDoc(doc(db, 'convites', cod))
      if (snap.exists()) {
        await onEntrou(snap.data().restaurantId, cod)
      } else {
        setErro('Código não encontrado. Confirme com o dono do restaurante.')
      }
    } catch(e) {
      setErro('Erro ao buscar. Tente novamente.')
    }
    setCarregando(false)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '40px' }}>🍔</div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: '8px 0 0 0' }}>Gestop</h1>
          <p style={{ color: '#64748b', marginTop: '8px' }}>Como deseja continuar?</p>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: '0 0 4px 0' }}>👷 Sou funcionário</h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 16px 0' }}>Digite o código do restaurante:</p>
          <input
            value={codigo}
            onChange={e => setCodigo(e.target.value.toUpperCase())}
            placeholder="Ex: ABC123"
            maxLength={8}
            onKeyDown={e => e.key === 'Enter' && entrar()}
            style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '24px', textAlign: 'center', letterSpacing: '6px', fontWeight: '700', boxSizing: 'border-box' }}
          />
          {erro && <p style={{ color: '#dc2626', fontSize: '13px', margin: '8px 0 0 0' }}>{erro}</p>}
          <button onClick={entrar} disabled={carregando || codigo.trim().length < 4}
            style={{ width: '100%', padding: '13px', marginTop: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', opacity: codigo.trim().length < 4 ? 0.5 : 1 }}>
            {carregando ? 'Buscando...' : 'Entrar no restaurante'}
          </button>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: '0 0 4px 0' }}>🏠 Sou dono/gestor</h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 16px 0' }}>Cadastrar meu restaurante</p>
          <button onClick={onCriarRestaurante}
            style={{ width: '100%', padding: '13px', backgroundColor: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>
            Criar meu restaurante →
          </button>
        </div>
      </div>
    </div>
  )
}
