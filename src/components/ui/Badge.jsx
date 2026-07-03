const toneMap = {
  neutral: 'neutral',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  info: 'info',
  purple: 'purple',
  dark: 'dark'
}

export default function Badge({ children, tone = 'neutral', dot = false, className = '' }) {
  const safeTone = toneMap[tone] || toneMap.neutral
  return <span className={`uiBadge uiBadge--${safeTone} ${className}`}>{dot ? <i /> : null}{children}</span>
}

export function statusTone(status = '') {
  const s = status.toLowerCase()
  if (s.includes('won') || s.includes('live') || s.includes('ready')) return 'success'
  if (s.includes('proposal') || s.includes('sent')) return 'purple'
  if (s.includes('building') || s.includes('demo')) return 'info'
  if (s.includes('follow') || s.includes('waiting')) return 'warning'
  if (s.includes('lost') || s.includes('blocked')) return 'danger'
  return 'neutral'
}
