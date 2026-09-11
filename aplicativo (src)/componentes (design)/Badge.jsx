/**
 * Etiqueta curta de estado. tone: neutral | brand | success | warning | danger | solid
 * Badge marca ESTADO ("Concluído", "Gestor"). Pra chamar atenção no topo da tela, use Banner.
 */
export default function Badge({ tone = 'neutral', className = '', children, ...rest }) {
  return (
    <span className={`gs-badge gs-badge--${tone} ${className}`.trim()} {...rest}>{children}</span>
  )
}

/** Rótulo caixa-alta acima de um valor. Ex.: "CÓDIGO DE ACESSO". */
export function Eyebrow({ className = '', children, ...rest }) {
  return <p className={`gs-eyebrow ${className}`.trim()} {...rest}>{children}</p>
}
