import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'

const icons = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertTriangle,
  info: Info
}

export default function Toast({ message, tone = 'success', onClose }) {
  if (!message) return null
  const Icon = icons[tone] || Info
  return <div className={`uiToast uiToast--${tone}`} role="status" aria-live="polite">
    <Icon size={18}/>
    <span>{message}</span>
    {onClose ? <button type="button" aria-label="Dismiss" onClick={onClose}><X size={14}/></button> : null}
  </div>
}
