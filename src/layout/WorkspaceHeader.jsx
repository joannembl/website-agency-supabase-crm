import { RefreshCw, LogOut } from 'lucide-react'

export default function WorkspaceHeader({ activeNav, connected, userEmail, teams, activeTeamId, setActiveTeamId, loadLeads, signOut }) {
  return <header className="workspaceHeader">
    <div><h1>{activeNav}</h1><p>{connected ? `Signed in as ${userEmail}` : 'Local mode — add Supabase keys to sync online'}</p></div>
    <div className="headerActions">
      {connected && <select className="teamSelect" value={activeTeamId} onChange={e=>setActiveTeamId(e.target.value)}>{teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select>}
      <button onClick={()=>loadLeads()}><RefreshCw size={16}/> Refresh</button>
      {connected && <button onClick={signOut}><LogOut size={16}/> Sign out</button>}
    </div>
  </header>
}
