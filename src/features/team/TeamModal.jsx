import { Copy, ShieldCheck, Users, X } from 'lucide-react'

export default function TeamModal({ open, activeTeam, currentRole, isAdmin, isOwner, members, session, copyInvite, shortUserId, changeMemberRole, removeMember, onClose }) {
  if (!open) return null
  return <div className="modalBackdrop" onMouseDown={e=>{ if (e.target.className === 'modalBackdrop') onClose() }}>
    <div className="editModal teamMembersModal">
      <div className="modalHeader"><div><span className="eyebrow">Team access</span><h2>Manage Team</h2><p>{activeTeam?.name} · Your role: {currentRole}</p></div><button type="button" className="iconBtn" onClick={onClose}><X size={18}/></button></div>
      {isAdmin && <div className="invitePanel"><div><strong>Invite new member</strong><p>Share this code. New users will join as Members by default.</p></div><button className="secondaryBtn" onClick={copyInvite}><Copy size={16}/> {activeTeam?.invite_code}</button></div>}
      <div className="roleLegend">
        <div><ShieldCheck size={16}/><strong>Owner</strong><span>Full access, can manage roles and remove members.</span></div>
        <div><ShieldCheck size={16}/><strong>Admin</strong><span>Can manage prospects, activities, and invite members.</span></div>
        <div><Users size={16}/><strong>Member</strong><span>Can view, add, edit, and log activity.</span></div>
      </div>
      <div className="membersList">
        {members.map(member=><div className="memberRow" key={member.user_id}>
          <div><strong>{shortUserId(member.user_id)}</strong><span>{member.user_id}</span></div>
          {isOwner && member.user_id !== session?.user?.id ? <select value={member.role} onChange={e=>changeMemberRole(member, e.target.value)}>{['owner','admin','member'].map(role=><option key={role}>{role}</option>)}</select> : <span className={`rolePill role${member.role}`}>{member.role}</span>}
          {isOwner && member.user_id !== session?.user?.id && <button className="textDanger" onClick={()=>removeMember(member)}>Remove</button>}
        </div>)}
      </div>
    </div>
  </div>
}
