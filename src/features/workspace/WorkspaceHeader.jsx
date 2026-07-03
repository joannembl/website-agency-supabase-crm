import Button from '../../components/ui/Button'

function defaultInitials(value = '') {
  return value.split(' ').filter(Boolean).slice(0, 2).map(word => word[0]).join('').toUpperCase() || 'CD'
}

export default function WorkspaceHeader({ title, subtitle, eyebrow, avatar, backLabel = 'Back', onBack, actions }) {
  return <div className="workspaceHeader entityWorkspaceHeader">
    {onBack ? <Button variant="ghost" onClick={onBack}>{backLabel}</Button> : null}
    <div className="workspaceHeaderMain">
      <div className="workspaceAvatar">{avatar || defaultInitials(title)}</div>
      <div>
        {eyebrow ? <p className="workspaceEyebrow">{eyebrow}</p> : null}
        <h1>{title || 'Untitled'}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
    </div>
    {actions ? <div className="workspaceHeaderActions">{actions}</div> : null}
  </div>
}
