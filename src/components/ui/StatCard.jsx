import { Card } from './Card'

export default function StatCard({ label, value, helper, icon: Icon, tone = 'neutral' }) {
  return <Card className={`uiStatCard uiStatCard--${tone}`}>
    <div className="uiStatCard__top">
      <span>{label}</span>
      {Icon ? <div className="uiStatCard__icon"><Icon size={17} /></div> : null}
    </div>
    <strong>{value}</strong>
    {helper ? <small>{helper}</small> : null}
  </Card>
}
