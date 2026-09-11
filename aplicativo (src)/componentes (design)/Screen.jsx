/**
 * Casca de tela: fundo, altura mínima e o respiro embaixo pra barra fixa.
 *
 * variant: default (fundo claro) | centered (conteúdo no meio) | dark (gradiente navy)
 */
export default function Screen({ variant = 'default', className = '', children, style, ...rest }) {
  const classes = [
    'gs-screen',
    variant !== 'default' ? `gs-screen--${variant}` : '',
    className,
  ].filter(Boolean).join(' ')
  return <div className={classes} style={style} {...rest}>{children}</div>
}

/** Área de conteúdo com o padding padrão de tela (24px). */
export function ScreenBody({ className = '', children, ...rest }) {
  return <div className={`gs-screen__body ${className}`.trim()} {...rest}>{children}</div>
}
