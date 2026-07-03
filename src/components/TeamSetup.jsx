import React, { useState } from 'react'
import { Users } from 'lucide-react'
import { supabase } from '../supabase'

export default function TeamSetup({ onTeamReady }) {
  const [teamName, setTeamName] = useState('Crafted Digital')
  const [inviteCode, setInviteCode] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function createTeam(e) {
    e.preventDefault(); setMessage(''); setLoading(true)
    const { data, error } = await supabase.rpc('create_team', { team_name: teamName })
    setLoading(false)
    if (error) return setMessage(error.message)
    onTeamReady(data)
  }

  async function joinTeam(e) {
    e.preventDefault(); setMessage(''); setLoading(true)
    const { data, error } = await supabase.rpc('join_team_by_code', { code: inviteCode })
    setLoading(false)
    if (error) return setMessage(error.message)
    onTeamReady(data)
  }

  return <div className="authPage"><div className="authCard teamCard">
    <div className="authIcon"><Users size={24}/></div>
    <h1>Create or Join a Team</h1>
    <p>Teams let multiple users share the same leads, pipeline, demos, and MRR dashboard.</p>
    {message && <div className="notice authNotice">{message}</div>}
    <form onSubmit={createTeam} className="miniForm">
      <label>New team name</label>
      <input required value={teamName} onChange={e=>setTeamName(e.target.value)} />
      <button disabled={loading}>Create team</button>
    </form>
    <div className="divider">or</div>
    <form onSubmit={joinTeam} className="miniForm">
      <label>Invite code</label>
      <input required placeholder="Example: A1B2C3D4" value={inviteCode} onChange={e=>setInviteCode(e.target.value.toUpperCase())} />
      <button disabled={loading} className="secondaryDark">Join team</button>
    </form>
  </div></div>
}
