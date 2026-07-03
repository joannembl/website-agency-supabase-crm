import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabase'

export default function useTeams(session, setMessage = () => {}) {
  const [teams, setTeams] = useState([])
  const [activeTeamId, setActiveTeamId] = useState(localStorage.getItem('active_team_id') || '')
  const [members, setMembers] = useState([])

  const activeTeam = useMemo(() => teams.find(team => team.id === activeTeamId), [teams, activeTeamId])
  const currentMember = useMemo(() => members.find(member => member.user_id === session?.user?.id), [members, session])
  const currentRole = currentMember?.role || 'member'
  const isOwner = currentRole === 'owner'
  const isAdmin = currentRole === 'owner' || currentRole === 'admin'

  async function loadTeams() {
    if (!supabase || !session) return
    setMessage('')
    const { data, error } = await supabase.from('teams').select('*').order('created_at', { ascending: true })
    if (error) { setMessage(error.message); return }
    setTeams(data || [])
    if ((data || []).length && !data.some(team => team.id === activeTeamId)) {
      setActiveTeamId(data[0].id)
      localStorage.setItem('active_team_id', data[0].id)
    }
  }

  async function loadMembers(teamId = activeTeamId) {
    if (!supabase || !teamId) return
    const { data } = await supabase.from('team_members').select('user_id, role, created_at').eq('team_id', teamId).order('created_at')
    setMembers(data || [])
  }

  function copyInvite() {
    if (!activeTeam?.invite_code) return
    navigator.clipboard.writeText(activeTeam.invite_code)
    setMessage(`Invite code copied: ${activeTeam.invite_code}`)
  }

  function shortUserId(id) {
    if (!id) return ''
    return id === session?.user?.id ? 'You' : `${id.slice(0, 8)}…${id.slice(-4)}`
  }

  async function changeMemberRole(member, nextRole) {
    if (!isOwner) return setMessage('Only team owners can change roles.')
    if (member.user_id === session?.user?.id) return setMessage('Owners cannot change their own role from the app.')
    const { error } = await supabase.rpc('update_team_member_role', { member_team_id: activeTeamId, member_user_id: member.user_id, new_role: nextRole })
    if (error) return setMessage(error.message)
    loadMembers(activeTeamId)
  }

  async function removeMember(member) {
    if (!isOwner) return setMessage('Only team owners can remove members.')
    if (member.user_id === session?.user?.id) return setMessage('You cannot remove yourself from the app.')
    if (!confirm('Remove this team member?')) return
    const { error } = await supabase.rpc('remove_team_member', { member_team_id: activeTeamId, member_user_id: member.user_id })
    if (error) return setMessage(error.message)
    loadMembers(activeTeamId)
  }

  useEffect(() => { if (session) loadTeams() }, [session])
  useEffect(() => { if (activeTeamId) { localStorage.setItem('active_team_id', activeTeamId); loadMembers(activeTeamId) } }, [activeTeamId, session])

  return { teams, setTeams, activeTeamId, setActiveTeamId, members, activeTeam, currentMember, currentRole, isOwner, isAdmin, loadTeams, loadMembers, copyInvite, shortUserId, changeMemberRole, removeMember }
}
