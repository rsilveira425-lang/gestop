/**
 * Cabeçalho navy das telas do app.
 *
 * <AppBar title="Gestop" subtitle="terça, 24 de junho" meta={userName}
 *         actions={<Button variant="onDark" size="sm">Sair</Button>} />
 *
 * Em telas internas, passe `onBack` pro botão de voltar.
 * `title` vira botão quando recebe `onTitleClick` (o logo leva pra home).
 */
export default function AppBar({ title, subtitle, meta, actions, onBack, onTitleClick, className = '' }) {
  return (
    <header className={`gs-appbar ${className}`.trim()}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--gs-space-3)', minWidth: 0 }}>
        {onBack && <button className="gs-appbar__back" onClick={onBack} aria-label="Voltar">←</button>}
        <div style={{ minWidth: 0 }}>
          {onTitleClick
            ? <button className="gs-appbar__title" onClick={onTitleClick}>{title}</button>
            : <h1 className="gs-appbar__title">{title}</h1>}
          {subtitle && <p className="gs-appbar__sub">{subtitle}</p>}
          {meta && <p className="gs-appbar__sub" style={{ opacity: .75, fontSize: 'var(--gs-text-xs)' }}>{meta}</p>}
        </div>
      </div>
      {actions && <div className="gs-appbar__actions">{actions}</div>}
    </header>
  )
}
