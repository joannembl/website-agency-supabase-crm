export default function Modal({ open = true, title, description, children, footer, onClose, className = '' }) {
  if (!open) return null
  return <div className="uiModalBackdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget && onClose) onClose() }}>
    <section className={`uiModal ${className}`} role="dialog" aria-modal="true" aria-label={title || 'Dialog'}>
      <div className="uiModal__header">
        <div>
          {title ? <h2>{title}</h2> : null}
          {description ? <p>{description}</p> : null}
        </div>
        {onClose ? <button type="button" className="uiIconButton" onClick={onClose} aria-label="Close">×</button> : null}
      </div>
      <div className="uiModal__body">{children}</div>
      {footer ? <div className="uiModal__footer">{footer}</div> : null}
    </section>
  </div>
}
