import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../aplicativo (src)/estilos (styles)/global.css'
import Landing from './Landing.jsx'

// Este é um laboratório de design — não existe login/cadastro de verdade aqui,
// então os botões da landing só avisam pra onde iriam, em vez de navegar.
function onNavigate(pagina) {
  console.log('[landing-lab] navegaria para:', pagina)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Landing onNavigate={onNavigate} />
  </StrictMode>,
)
