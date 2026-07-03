import { Copy, UserCog } from 'lucide-react'

export default function TeamBar({ connected, activeTeam, members, currentRole, isAdmin, copyInvite, onManageTeam }) {
  if (!connected || !activeTeam) return null
  return <section className="teamBar">
    <div><strong>{activeTeam.name}</strong><span>{members.length} team member{members.length === 1 ? '' : 's'} · Your role: {currentRole}</span></div>
    <div className="teamBarActions">
      {isAdmin && <button className="secondaryBtn" onClick={copyInvite}><Copy size={16}/> Invite code: {activeTeam.invite_code}</button>}
      <button className="secondaryBtn" onClick={onManageTeam}><UserCog size={16}/> Manage team</button>
    </div>
  </section>
}
