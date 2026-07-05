import { Info } from 'lucide-react'

export default function HelpCallout({ title = 'Tip', children, description, icon: Icon = Info }) {
  return <div className="helpCallout">
    <div className="helpCalloutIcon"><Icon size={18} /></div>
    <div>
      <strong>{title}</strong>
      {description ? <p>{description}</p> : children ? <p>{children}</p> : null}
    </div>
  </div>
}
