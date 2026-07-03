export function Card({ children, className = '', padded = true, interactive = false, ...props }) {
  return <section className={`uiCard ${padded ? 'uiCard--padded' : ''} ${interactive ? 'uiCard--interactive' : ''} ${className}`} {...props}>{children}</section>
}

export function CardHeader({ title, description, action, className = '' }) {
  return <div className={`uiCardHeader ${className}`}>
    <div>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
    {action ? <div className="uiCardHeader__action">{action}</div> : null}
  </div>
}
