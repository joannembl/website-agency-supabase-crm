import { RefreshCw, LogOut } from 'lucide-react'
import { Button, PageHeader, Badge } from '../components/ui'

export default function WorkspaceHeader({ activeNav, connected, userEmail, teams, activeTeamId, setActiveTeamId, loadLeads, signOut }) {
  const meta = connected ? <Badge tone="success" dot>Supabase connected</Badge> : <Badge tone="warning" dot>Local mode</Badge>

  return <PageHeader
    className="workspaceHeader"
    eyebrow="Crafted Digital OS"
    title={activeNav}
    description={connected ? `Signed in as ${userEmail}` : 'Local mode — add Supabase keys to sync online'}
    meta={meta}
    actions={<>
      {connected && <select className="teamSelect" value={activeTeamId} onChange={e=>setActiveTeamId(e.target.value)}>{teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select>}
      <Button variant="secondary" icon={RefreshCw} onClick={()=>loadLeads()}>Refresh</Button>
      {connected && <Button variant="secondary" icon={LogOut} onClick={signOut}>Sign out</Button>}
    </>}
  />
}
