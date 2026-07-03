import { Home, Users, LayoutDashboard, Monitor, Briefcase, FileText, CheckSquare, DollarSign, BarChart3, Settings } from 'lucide-react'

const navItems = [
  { name: 'Dashboard', icon: Home },
  { name: 'Prospects', icon: Users },
  { name: 'Pipeline', icon: LayoutDashboard },
  { name: 'Demo Websites', icon: Monitor },
  { name: 'Clients', icon: Briefcase },
  { name: 'Proposals', icon: FileText },
  { name: 'Tasks', icon: CheckSquare },
  { name: 'Revenue', icon: DollarSign },
  { name: 'Analytics', icon: BarChart3 },
  { name: 'Settings', icon: Settings },
]

export default function Sidebar({ activeNav, setNav, connected, activeTeam, userEmail }) {
  return <aside className="sidebar">
    <div className="sidebarBrand">
      <div className="brandMark">CD</div>
      <div><strong>Crafted Digital</strong><span>Agency CRM</span></div>
    </div>
    <nav className="sideNav">
      {navItems.map(item => {
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
