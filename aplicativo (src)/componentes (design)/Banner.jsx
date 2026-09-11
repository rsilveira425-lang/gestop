/**
 * Faixa de aviso no topo da tela — trial acabando, e-mail não confirmado,
 * lembretes desligados, turno em atraso.
 *
 * tone: info | success | warning | danger
 * `actions` recebe botões (use <Button size="sm">).
 */
export default function Banner({ tone = 'info', actions, className = '', children, ...rest }) {
  return (
    <div className={`gs-banner gs-banner--${tone} ${className}`.trim()} role="status" {...rest}>
      <p>{children}</p>
      {actions && <div className="gs-banner__actions">{actions}</div>}
    </div>
  )
}
