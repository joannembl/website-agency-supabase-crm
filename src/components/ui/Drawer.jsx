import { X } from 'lucide-react'

export default function Drawer({
  open = true,
  title,
  description,
  children,
  footer,
  onClose,
  side = 'right',
  className = ''
}) {
  if (!open) return null
  return <div className="uiDrawerBackdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget && onClose) onClose() }}>
    <aside className={`uiDrawer uiDrawer--${side} ${className}`} role="dialog" aria-modal="true" aria-label={title || 'Drawer'} onMouseDown={e => e.stopPropagation()}>
      <div className="uiDrawer__header">
        <div>
          {title ? <h2>{title}</h2> : null}
          {description ? <p>{description}</p> : null}
        </div>
        {onClose ? <button type="button" className="uiIconButton" onClick={onClose} aria-label="Close"><X size={18}/></button> : null}
      </div>
      <div className="uiDrawer__body">{children}</div>
      {footer ? <div className="uiDrawer__footer">{footer}</div> : null}
    </aside>
  </div>
}
