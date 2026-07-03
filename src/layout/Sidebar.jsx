import { NAV_ITEMS, THEME } from '../config'

export default function Sidebar({ activeNav, setNav, connected, activeTeam, userEmail }) {
  return <aside className="sidebar">
    <div className="sidebarBrand">
      <div className="brandMark">{THEME.brandInitials}</div>
      <div><strong>{THEME.appName}</strong><span>{THEME.productName}</span></div>
    </div>
    <nav className="sideNav">
      {NAV_ITEMS.map(item => {
        const Icon = item.icon
        return <button key={item.name} className={activeNav === item.name ? 'active' : ''} onClick={()=>setNav(item.name)}><Icon size={18}/><span>{item.name}</span></button>
      })}
    </nav>
    <div className="sidebarFooter">
      {connected && activeTeam && <span>{activeTeam.name}</span>}
      {connected && <small>{userEmail}</small>}
    </div>
  </aside>
}
