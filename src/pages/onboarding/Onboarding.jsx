import { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../services/firebase'
import { useAuth } from '../../contexts/AuthContext'
import Step1Setores from './Step1Setores'
import Step2Tarefas from './Step2Tarefas'
import Step3Colaboradores from './Step3Colaboradores'

export default function Onboarding({ restaurant, onConcluir, codigoAcesso }) {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [setores, setSetores] = useState([])
  const [codigoGerado, setCodigoGerado] = useState('')

  async function concluir() {
    try {
      await updateDoc(doc(db, 'restaurants', user.uid), { onboardingCompleto: true, codigoAcesso: codigoGerado })
      await onConcluir()
    } catch(e) {
      console.error('Erro concluir:', e)
      alert('Erro: ' + e.message)
    }
  }

  return (
    <div style={styles.screen}>
      <div style={styles.container}>
        <div style={styles.topbar}>
          <span style={styles.logo}>Gestop</span>
          <span style={styles.steps}>Etapa {step} de 3</span>
        </div>
        <div style={styles.progress}>
          <div style={{ ...styles.progressBar, width: `${(step/3)*100}%` }} />
        </div>

        {step === 1 && (
          <Step1Setores
            restaurantId={user.uid}
            nomeRestaurante={restaurant?.nomeRestaurante}
            onNext={(s) => { setSetores(s); setStep(2) }}
          />
        )}
        {step === 2 && (
          <Step2Tarefas
            restaurantId={user.uid}
            setores={setores}
            onNext={() => {
            const code = Math.random().toString(36).substring(2, 8).toUpperCase()
            setCodigoGerado(code)
            setStep(3)
          }}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <Step3Colaboradores
            codigoAcesso={codigoGerado}
            onConcluir={concluir}
            onBack={() => setStep(2)}
          />
        )}
      </div>
    </div>
  )
}

const styles = {
  screen: { minHeight:'100vh', background:'#f8fafc', display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'16px' },
  container: { background:'#fff', borderRadius:'16px', width:'100%', maxWidth:'560px', boxShadow:'0 4px 12px rgba(0,0,0,0.08)', overflow:'hidden', marginTop:'24px' },
  topbar: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 24px 0' },
  logo: { fontSize:'20px', fontWeight:700, color:'#2563eb' },
  steps: { fontSize:'13px', color:'#64748b' },
  progress: { height:'4px', background:'#e2e8f0', margin:'16px 0 0' },
  progressBar: { height:'100%', background:'#2563eb', transition:'width 0.3s ease' },
}
