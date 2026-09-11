/**
 * Abas em pílula — o seletor de turno do Dashboard.
 * Rola na horizontal sem barra visível, porque no celular são 3+ turnos.
 *
 * <PillTabs items={['Abertura','Pico']} value={turno} onChange={setTurno} />
 * items aceita string ou { value, label }.
 */
export default function PillTabs({ items = [], value, onChange, label = 'Turnos', className = '' }) {
  const normalizar = i => (typeof i === 'string' ? { value: i, label: i } : i)
  return (
    <div className={`gs-pills ${className}`.trim()} role="tablist" aria-label={label}>
      {items.map(normalizar).map(item => (
        <button
          key={item.value}
          role="tab"
          type="button"
          aria-selected={value === item.value}
          className="gs-pill"
          onClick={() => onChange?.(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
