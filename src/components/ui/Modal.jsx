import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open = true, title, description, children, footer, onClose, className = '', size = 'md' }) {
  useEffect(() => {
    if (!open) return
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return <div className="uiModalBackdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget && onClose) onClose() }}>
    <section className={`uiModal uiModal--${size} ${className}`} role="dialog" aria-modal="true" aria-label={title || 'Dialog'}>
      <div className="uiModal__header">
        <div>
          {title ? <h2>{title}</h2> : null}
          {description ? <p>{description}</p> : null}
        </div>
        {onClose ? <button type="button" className="uiIconButton" onClick={onClose} aria-label="Close"><X size={18}/></button> : null}
      </div>
      <div className="uiModal__body">{children}</div>
      {footer ? <div className="uiModal__footer">{footer}</div> : null}
    </section>
  </div>
}
