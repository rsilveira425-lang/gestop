/**
 * Anel de progresso — o medidor do turno. Vira verde em 100%.
 * <ProgressRing value={67} size={62} />
 */
export function ProgressRing({ value = 0, size = 62, thickness = 7, showValue = true, label }) {
  const pct = Math.max(0, Math.min(100, value))
  const r = (size - thickness) / 2
  const circ = 2 * Math.PI * r
  const cor = pct === 100 ? 'var(--gs-success)' : 'var(--gs-action)'

  return (
    <div className="gs-ring" style={{ width: size, height: size }}
      role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label || 'Progresso'}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--gs-surface-sunken)" strokeWidth={thickness} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={cor} strokeWidth={thickness} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {showValue && (
        <span className="gs-ring__value" style={{ fontSize: size < 50 ? 'var(--gs-text-xs)' : 'var(--gs-text-sm)', color: cor }}>
          {pct}%
        </span>
      )}
    </div>
  )
}

/** Barra de progresso linear, pra listas e cards compactos. */
export function ProgressBar({ value = 0, label }) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div className="gs-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label || 'Progresso'}>
      <div className={`gs-bar__fill ${pct === 100 ? 'gs-bar__fill--success' : ''}`.trim()} style={{ width: `${pct}%` }} />
    </div>
  )
}
