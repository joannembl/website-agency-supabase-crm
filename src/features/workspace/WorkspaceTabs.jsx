export default function WorkspaceTabs({ tabs = [], activeTab, onChange }) {
  return <div className="workspaceTabs entityWorkspaceTabs" role="tablist">
    {tabs.map(tab => {
      const id = typeof tab === 'string' ? tab : tab.id
      const label = typeof tab === 'string' ? tab : tab.label
      return <button key={id} type="button" className={activeTab === id ? 'active' : ''} onClick={() => onChange(id)}>{label}</button>
    })}
  </div>
}
