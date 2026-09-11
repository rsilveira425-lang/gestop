/**
 * Botão do Gestop.
 *
 * variant: primary | secondary | ghost | danger | light | onDark
 *   - primary   ação principal da tela. Só uma por tela.
 *   - secondary ação de apoio sobre fundo claro.
 *   - ghost     ação terciária, sem peso visual.
 *   - danger    ação destrutiva (excluir, desativar).
 *   - light     ação principal sobre o navy (hero, CTA final).
 *   - onDark    ação de apoio sobre o navy (barra do app).
 *
 * `loading` troca o texto e trava o clique — não precisa gerenciar disabled à mão.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  loading = false,
  loadingText,
  disabled = false,
  as: Tag = 'button',
  className = '',
  children,
  ...rest
}) {
  const classes = [
    'gs-btn',
    `gs-btn--${variant === 'onDark' ? 'on-dark' : variant}`,
    `gs-btn--${size}`,
    block ? 'gs-btn--block' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <Tag
      className={classes}
      disabled={Tag === 'button' ? (disabled || loading) : undefined}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (loadingText || 'Aguarde...') : children}
    </Tag>
  )
}
