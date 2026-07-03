import { RefreshCw, LogOut, Bell, Search } from 'lucide-react'
import { Button, Badge } from '../components/ui'

export default function Topbar({ connected, userEmail, teams, activeTeamId, setActiveTeamId, loadLeads, signOut }) {
  return <header className="topbar saasTopbar">
    <div className="topbarSearch saasGlobalSearch" aria-label="Global search placeholder">
      <Search size={16}/>
      <span>Search workspace...</span>
    </div>

    <div className="topbarActions saasTopbarActions">
      {connected ? <Badge tone="success" dot>Connected</Badge> : <Badge tone="warning" dot>Local</Badge>}
      {connected && <select className="teamSelect" value={activeTeamId} onChange={e=>setActiveTeamId(e.target.value)} aria-label="Select team">{teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select>}
      <Button variant="ghost" size="sm" icon={RefreshCw} onClick={()=>loadLeads()}>Refresh</Button>
      <button className="topbarIconButton" title="Notifications" type="button"><Bell size={17}/></button>
      {connected && <Button variant="secondary" size="sm" icon={LogOut} onClick={signOut}>Sign out</Button>}
      <div className="topbarUser">
        <div className="topbarAvatar">{(userEmail || 'CD').slice(0,2).toUpperCase()}</div>
        <span>{connected ? userEmail : 'Local mode'}</span>
      </div>
    </div>
  </header>
}
