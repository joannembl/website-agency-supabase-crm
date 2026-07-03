export default function PageHeader({ eyebrow, title, description, actions, meta, className = '' }) {
  return <header className={`uiPageHeader ${className}`}>
    <div className="uiPageHeader__content">
      {eyebrow ? <span className="uiEyebrow">{eyebrow}</span> : null}
      <h1>{title}</h1>
      {description ? <p>{description}</p> : null}
      {meta ? <div className="uiPageHeader__meta">{meta}</div> : null}
    </div>
    {actions ? <div className="uiPageHeader__actions">{actions}</div> : null}
  </header>
}
