import { useEffect, useRef } from 'react'

/**
 * Diálogo centrado. Fecha no Esc e no clique fora, trava o scroll do fundo
 * e devolve o foco pra onde estava quando fecha.
 *
 * <Modal open={x} onClose={...} title="Mover tarefa" footer={<Button ...>}>…</Modal>
 */
export default function Modal({ open, onClose, title, footer, children, maxWidth }) {
  const caixa = useRef(null)
  const focoAnterior = useRef(null)

  useEffect(() => {
    if (!open) return
    focoAnterior.current = document.activeElement
    const overflowAntes = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const aoTeclar = e => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', aoTeclar)
    caixa.current?.focus()
    return () => {
      document.removeEventListener('keydown', aoTeclar)
      document.body.style.overflow = overflowAntes
      focoAnterior.current?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="gs-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose?.() }}>
      <div
        className="gs-modal"
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        tabIndex={-1}
        ref={caixa}
        style={maxWidth ? { maxWidth } : undefined}
      >
        {(title || onClose) && (
          <div className="gs-modal__head">
            {title && <h2 className="gs-modal__title">{title}</h2>}
            {onClose && <button className="gs-modal__close" onClick={onClose} aria-label="Fechar">×</button>}
          </div>
        )}
        <div className="gs-modal__body">{children}</div>
        {footer && <div className="gs-modal__foot">{footer}</div>}
      </div>
    </div>
  )
}

/** Foto em tela cheia. Clique em qualquer lugar fecha. */
export function Lightbox({ src, onClose, alt = 'Foto' }) {
  useEffect(() => {
    if (!src) return
    const aoTeclar = e => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [src, onClose])

  if (!src) return null
  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-label={alt}
      style={{
        position: 'fixed', inset: 0, zIndex: 'var(--gs-z-overlay)',
        background: 'rgba(5,11,36,.94)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out',
      }}
    >
      <img src={src} alt={alt} style={{ maxWidth: '96vw', maxHeight: '96vh', objectFit: 'contain', borderRadius: 'var(--gs-radius-sm)' }} />
    </div>
  )
}
