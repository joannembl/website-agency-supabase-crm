export function Section({ title, description, action, children, className = '' }) {
  return <section className={`uiSection ${className}`}>
    {(title || description || action) ? <div className="uiSection__header">
      <div>
        {title ? <h2>{title}</h2> : null}
        {description ? <p>{description}</p> : null}
      </div>
      {action ? <div className="uiSection__action">{action}</div> : null}
    </div> : null}
    {children}
  </section>
}
