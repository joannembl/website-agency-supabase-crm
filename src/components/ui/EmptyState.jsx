export default function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return <div className={`uiEmptyState ${className}`}>
    {Icon ? <div className="uiEmptyState__icon"><Icon size={26} /></div> : null}
    <strong>{title}</strong>
    {description ? <p>{description}</p> : null}
    {action ? <div className="uiEmptyState__action">{action}</div> : null}
  </div>
}
