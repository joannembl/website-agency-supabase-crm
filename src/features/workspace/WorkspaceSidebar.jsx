import { ExternalLink } from 'lucide-react'
import { Card } from '../../components/ui/Card'

export function WorkspaceSidebar({ sections = [], children }) {
  return <aside className="workspaceSidePanel entityWorkspaceSidebar">
    {sections.map(section => <WorkspaceSidebarSection key={section.title} {...section} />)}
    {children}
  </aside>
}

export function WorkspaceSidebarSection({ title, items = [] }) {
  return <Card className="workspaceSideCard">
    {title ? <h3>{title}</h3> : null}
    {items.map((item, index) => item.href
      ? <WorkspaceSidebarLink key={`${item.label}-${index}`} {...item} />
      : <WorkspaceSidebarItem key={`${item.label}-${index}`} {...item} />)}
  </Card>
}

export function WorkspaceSidebarItem({ icon: Icon, label, value }) {
  return <div className="workspaceSideItem">
    {Icon ? <Icon size={15} /> : null}
    <span>{label}</span>
    <strong>{value || '—'}</strong>
  </div>
}

export function WorkspaceSidebarLink({ icon: Icon, label, value, href }) {
  const content = <>
    {Icon ? <Icon size={15} /> : null}
    <span>{label}</span>
    <strong>{value || '—'}</strong>
    {href ? <ExternalLink size={12} /> : null}
  </>
  if (!href) return <div className="workspaceSideItem">{content}</div>
  return <a className="workspaceSideItem" href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">{content}</a>
}
