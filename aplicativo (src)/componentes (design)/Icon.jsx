/**
 * Ícones do Gestop.
 *
 * Todos no mesmo grid de 24, traço 1.75, pontas e junções arredondadas.
 * É o que separa um app desenhado de um app montado: emoji muda de forma
 * em cada aparelho (o 👥 do Android não é o do iPhone) e não aceita a cor
 * do texto ao redor. Estes aceitam.
 *
 *   <Icon name="camera" />              herda a cor e 1em de tamanho
 *   <Icon name="check" size={18} />
 *   <Icon name="users" title="Equipe" />  vira imagem com nome pro leitor de tela
 */

const D = {
  check:   <path d="M4 12.5l5 5L20 6.5" />,
  checkCircle: <><circle cx="12" cy="12" r="8.6" /><path d="M8.2 12.3l2.7 2.7 5-5.4" /></>,
  x:       <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  xCircle: <><circle cx="12" cy="12" r="8.6" /><path d="M9.2 9.2l5.6 5.6M14.8 9.2l-5.6 5.6" /></>,
  camera:  <><path d="M3 8.5a2 2 0 012-2h2.2l1.2-2h6.8l1.2 2H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2v-9z" /><circle cx="12" cy="13" r="3.4" /></>,
  comment: <path d="M20.5 12.2c0 3.9-3.8 7-8.5 7a9.8 9.8 0 01-2.7-.37L4.5 20.5l1.2-3.5A6.6 6.6 0 013.5 12.2c0-3.9 3.8-7 8.5-7s8.5 3.1 8.5 7z" />,
  clipboard: <><path d="M9 4.5H6.5A1.5 1.5 0 005 6v13a1.5 1.5 0 001.5 1.5h11A1.5 1.5 0 0019 19V6a1.5 1.5 0 00-1.5-1.5H15" /><rect x="9" y="2.8" width="6" height="3.4" rx="1.2" /><path d="M8.5 11.5h7M8.5 15h4.5" /></>,
  chart:   <><path d="M4 19.5V4.5M4 19.5h16" /><path d="M8 16v-4.5M12.5 16V7.5M17 16v-6.5" /></>,
  users:   <><circle cx="9" cy="8" r="3.4" /><path d="M3 20a6 6 0 0112 0M16.5 5.2a3.4 3.4 0 010 6.6M17 14.4a5.6 5.6 0 014 5.6" /></>,
  user:    <><circle cx="12" cy="8" r="3.6" /><path d="M5.5 20a6.5 6.5 0 0113 0" /></>,
  crown:   <path d="M4 17.5h16M4.5 17.5L3 7.5l4.8 3.3L12 4.5l4.2 6.3L21 7.5l-1.5 10z" />,
  warning: <><path d="M12 4.6l8.4 14.4H3.6z" /><path d="M12 10v3.8M12 16.4v.2" /></>,
  refresh: <><path d="M19.5 11A7.5 7.5 0 106 16.8" /><path d="M4.5 20.5V15.5h5" /></>,
  grip:    <><circle cx="9.5" cy="6.5" r="1.3" /><circle cx="14.5" cy="6.5" r="1.3" /><circle cx="9.5" cy="12" r="1.3" /><circle cx="14.5" cy="12" r="1.3" /><circle cx="9.5" cy="17.5" r="1.3" /><circle cx="14.5" cy="17.5" r="1.3" /></>,
  back:    <path d="M14.5 5.5L8 12l6.5 6.5" />,
  forward: <path d="M9.5 5.5L16 12l-6.5 6.5" />,
  down:    <path d="M5.5 9.5L12 16l6.5-6.5" />,
  clock:   <><circle cx="12" cy="12" r="8.6" /><path d="M12 7.6V12l3 2" /></>,
  thermometer: <><path d="M14 13.6V6a2 2 0 10-4 0v7.6a4.2 4.2 0 104 0z" /><path d="M12 9.5v5" /></>,
  trophy:  <><path d="M7.5 4.5h9v5a4.5 4.5 0 01-9 0z" /><path d="M7.5 6H5a2 2 0 000 4h2.2M16.5 6H19a2 2 0 010 4h-2.2" /><path d="M12 14v3.5M8.8 20.5h6.4" /></>,
  bulb:    <><path d="M9.2 16.5a5.5 5.5 0 115.6 0v1.8a1 1 0 01-1 1h-3.6a1 1 0 01-1-1z" /><path d="M10 21.2h4" /></>,
  bell:    <><path d="M6.5 16.5V11a5.5 5.5 0 1111 0v5.5l1.5 2h-14z" /><path d="M10.2 21a2 2 0 003.6 0" /></>,
  lock:    <><rect x="5" y="10.5" width="14" height="9.5" rx="2" /><path d="M8.5 10.5V8a3.5 3.5 0 017 0v2.5" /></>,
  plus:    <path d="M12 5.5v13M5.5 12h13" />,
  trash:   <><path d="M4.5 6.5h15M9.5 6.5V5a1.5 1.5 0 011.5-1.5h2A1.5 1.5 0 0114.5 5v1.5" /><path d="M6.5 6.5l.9 12.2a1.5 1.5 0 001.5 1.3h6.2a1.5 1.5 0 001.5-1.3l.9-12.2" /></>,
  pencil:  <><path d="M4.5 19.5l.8-3.6L15.6 5.6a1.9 1.9 0 012.7 0l1.6 1.6a1.9 1.9 0 010 2.7L9.6 20.2z" /><path d="M14.2 7l3.4 3.4" /></>,
  pause:   <><rect x="7.5" y="5.5" width="3.5" height="13" rx="1.2" /><rect x="13" y="5.5" width="3.5" height="13" rx="1.2" /></>,
  rocket:  <><path d="M13.5 4.5c3.5 1 6 3.5 7 7l-8 8-6-6z" /><circle cx="14.5" cy="9.5" r="1.8" /><path d="M6.5 13.5l-2 5.5 5.5-2" /></>,
  logout:  <><path d="M15 8.2V6a1.8 1.8 0 00-1.8-1.8H6A1.8 1.8 0 004.2 6v12A1.8 1.8 0 006 19.8h7.2A1.8 1.8 0 0015 18v-2.2" /><path d="M10 12h10M16.8 8.8L20 12l-3.2 3.2" /></>,
}

export default function Icon({ name, size = '1em', title, className = '', style, ...rest }) {
  const d = D[name]
  if (!d) return null
  return (
    <svg
      viewBox="0 0 24 24" width={size} height={size}
      fill="none" stroke="currentColor" strokeWidth="1.75"
      strokeLinecap="round" strokeLinejoin="round"
      className={className}
      style={{ flex: 'none', display: 'block', ...style }}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : 'true'}
      aria-label={title}
      {...rest}
    >
      {title && <title>{title}</title>}
      {d}
    </svg>
  )
}
