/**
 * Superfície de conteúdo.
 *
 * variant: default (sombra sutil) | flat (só traço) | raised (destaque) | brand (azul suave)
 * pad: sm | md | lg | none
 * `interactive` liga hover/elevação — use só quando o card inteiro é clicável.
 * `muted` esmaece o card (ex.: membro da equipe desativado).
 */
export default function Card({
  variant = 'default',
  pad = 'md',
  interactive = false,
  muted = false,
  as: Tag = 'div',
  className = '',
  children,
  ...rest
}) {
  const classes = [
    'gs-card',
    variant !== 'default' ? `gs-card--${variant}` : '',
    pad !== 'none' ? `gs-card--pad-${pad}` : '',
    interactive ? 'gs-card--interactive' : '',
    muted ? 'gs-card--muted' : '',
    className,
  ].filter(Boolean).join(' ')

  return <Tag className={classes} {...rest}>{children}</Tag>
}
