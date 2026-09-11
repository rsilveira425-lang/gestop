/**
 * Lista vazia, carregando ou erro. Sempre diga o que fazer a seguir —
 * nunca deixe só "Nenhum resultado".
 *
 * <EmptyState icon="📋" title="Nenhuma tarefa ainda" text="Crie a primeira…" action={<Button/>} />
 */
export default function EmptyState({ icon, title, text, action, className = '' }) {
  return (
    <div className={`gs-empty ${className}`.trim()}>
      {icon && <p className="gs-empty__icon" aria-hidden="true">{icon}</p>}
      {title && <p className="gs-empty__title">{title}</p>}
      {text && <p className="gs-empty__text">{text}</p>}
      {action && <div style={{ marginTop: 'var(--gs-space-5)' }}>{action}</div>}
    </div>
  )
}

/** Estado de carregamento padrão — usado nas telas enquanto o Firestore responde. */
export function Loading({ text = 'Carregando...' }) {
  return (
    <div className="gs-empty" role="status" aria-live="polite">
      <p className="gs-empty__text">{text}</p>
    </div>
  )
}
