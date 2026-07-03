export function Tabs({ tabs = [], active, onChange, className = '' }) {
  return <div className={`uiTabs ${className}`} role="tablist">
    {tabs.map(tab => <button key={tab.value} type="button" role="tab" aria-selected={active === tab.value} className={active === tab.value ? 'active' : ''} onClick={() => onChange(tab.value)}>{tab.label}</button>)}
  </div>
}
