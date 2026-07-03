import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Search, Plus, ExternalLink, Download, RefreshCw, LogOut, Lock, Users, Copy } from 'lucide-react'
import { supabase } from './supabase'
import './styles.css'

const blankLead = {
  business_name: '', instagram_handle: '', category: 'Mobile Detailing', city: 'Phoenix', followers: '',
  website_status: 'Needs verification', website_url: '', email: '', phone: '', google_rating: '',
  google_reviews: '', priority: 'B', status: 'Research', notes: ''
}

function AuthScreen({ onAuthed }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('sign-in')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault(); setMessage(''); setLoading(true)
    const action = mode === 'sign-up'
      ? supabase.auth.signUp({ email, password })
      : supabase.auth.signInWithPassword({ email, password })
    const { data, error } = await action
    setLoading(false)
    if (error) return setMessage(error.message)
    if (mode === 'sign-up' && !data.session) return setMessage('Account created. Check your email to confirm your login, then come back and sign in.')
    onAuthed(data.session)
  }

  return <div className="authPage"><form onSubmit={handleSubmit} className="authCard">
    <div className="authIcon"><Lock size={24}/></div>
    <h1>Website Agency CRM</h1><p>Sign in to manage your shared lead database.</p>
    {message && <div className="notice authNotice">{message}</div>}
    <label>Email</label><input type="email" required placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
    <label>Password</label><input type="password" required minLength="6" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} />
    <button type="submit" disabled={loading}>{loading ? 'Please wait...' : mode === 'sign-up' ? 'Create account' : 'Sign in'}</button>
    <button type="button" className="secondaryBtn" onClick={()=>{ setMode(mode === 'sign-up' ? 'sign-in' : 'sign-up'); setMessage('') }}>
      {mode === 'sign-up' ? 'Already have an account? Sign in' : 'Need an account? Create one'}
    </button>
  </form></div>
}

function TeamSetup({ onTeamReady }) {
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

function App() {
  const [session, setSession] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [teams, setTeams] = useState([])
  const [activeTeamId, setActiveTeamId] = useState(localStorage.getItem('active_team_id') || '')
  const [members, setMembers] = useState([])
  const [leads, setLeads] = useState([])
  const [form, setForm] = useState(blankLead)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [category, setCategory] = useState('All')
  const [message, setMessage] = useState('')

  const connected = Boolean(supabase)
  const activeTeam = teams.find(t => t.id === activeTeamId)

  useEffect(() => {
    if (!supabase) { setAuthReady(true); return }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthReady(true) })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))
    return () => listener.subscription.unsubscribe()
  }, [])

  async function loadTeams() {
    if (!supabase || !session) return
    setMessage('')
    const { data, error } = await supabase.from('teams').select('*').order('created_at', { ascending: true })
    if (error) { setMessage(error.message); return }
    setTeams(data || [])
    if ((data || []).length && !data.some(t => t.id === activeTeamId)) {
      setActiveTeamId(data[0].id)
      localStorage.setItem('active_team_id', data[0].id)
    }
  }

  async function loadMembers(teamId = activeTeamId) {
    if (!supabase || !teamId) return
    const { data } = await supabase.from('team_members').select('user_id, role, created_at').eq('team_id', teamId).order('created_at')
    setMembers(data || [])
  }

  async function loadLeads(teamId = activeTeamId) {
    setMessage('')
    if (!supabase) {
      const local = JSON.parse(localStorage.getItem('crm_leads') || '[]')
      setLeads(local); return
    }
    if (!session || !teamId) return
    const { data, error } = await supabase.from('leads').select('*').eq('team_id', teamId).order('created_at', { ascending: false })
    if (error) setMessage(error.message)
    else setLeads(data || [])
  }

  useEffect(() => { if (session) loadTeams() }, [session])
  useEffect(() => { if (activeTeamId) { localStorage.setItem('active_team_id', activeTeamId); loadLeads(activeTeamId); loadMembers(activeTeamId) } }, [activeTeamId, session])

  async function addLead(e) {
    e.preventDefault(); setMessage('')
    if (!form.business_name.trim()) return
    const payload = {
      ...form,
      owner_id: session?.user?.id,
      team_id: activeTeamId || null,
      followers: form.followers ? Number(form.followers) : null,
      google_rating: form.google_rating ? Number(form.google_rating) : null,
      google_reviews: form.google_reviews ? Number(form.google_reviews) : null
    }
    if (!supabase) {
      const newLead = { ...payload, id: crypto.randomUUID(), created_at: new Date().toISOString() }
      const next = [newLead, ...leads]
      setLeads(next); localStorage.setItem('crm_leads', JSON.stringify(next)); setForm(blankLead); return
    }
    if (!activeTeamId) return setMessage('Create or join a team first.')
    const { error } = await supabase.from('leads').insert(payload)
    if (error) setMessage(error.message)
    else { setForm(blankLead); loadLeads() }
  }

  async function updateLead(id, patch) {
    setMessage('')
    if (!supabase) {
      const next = leads.map(l => l.id === id ? { ...l, ...patch } : l)
      setLeads(next); localStorage.setItem('crm_leads', JSON.stringify(next)); return
    }
    const { error } = await supabase.from('leads').update(patch).eq('id', id).eq('team_id', activeTeamId)
    if (error) setMessage(error.message)
    loadLeads()
  }

  async function signOut() {
    await supabase.auth.signOut(); setSession(null); setTeams([]); setActiveTeamId(''); setLeads([])
  }

  function copyInvite() {
    if (!activeTeam?.invite_code) return
    navigator.clipboard.writeText(activeTeam.invite_code)
    setMessage(`Invite code copied: ${activeTeam.invite_code}`)
  }

  const filtered = useMemo(() => leads.filter(l => {
    const hay = `${l.business_name} ${l.instagram_handle} ${l.category} ${l.city} ${l.notes}`.toLowerCase()
    return hay.includes(query.toLowerCase()) && (status === 'All' || l.status === status) && (category === 'All' || l.category === category)
  }), [leads, query, status, category])

  const mrr = leads.filter(l => l.status === 'Won').length * 99
  const demos = leads.filter(l => ['Demo Built','DM Sent','Follow-up','Meeting','Proposal','Won'].includes(l.status)).length
  const noWebsite = leads.filter(l => ['No website','Likely no/weak site','Social-only'].includes(l.website_status)).length

  function exportCsv() {
    const columns = Object.keys(blankLead)
    const rows = [columns, ...leads.map(l => columns.map(k => JSON.stringify(l[k] ?? '')))]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob); a.download = 'website-agency-crm-leads.csv'; a.click()
  }

  if (!authReady) return <div className="loading">Loading CRM...</div>
  if (supabase && !session) return <AuthScreen onAuthed={setSession} />
  if (supabase && session && teams.length === 0) return <TeamSetup onTeamReady={(team)=>{ setTeams([team]); setActiveTeamId(team.id); localStorage.setItem('active_team_id', team.id) }} />

  return <div>
    <header>
      <div><h1>Website Agency CRM</h1><p>{connected ? `Signed in as ${session?.user?.email}` : 'Local mode — add Supabase keys to sync online'}</p></div>
      <div className="headerActions">
        {connected && <select className="teamSelect" value={activeTeamId} onChange={e=>setActiveTeamId(e.target.value)}>{teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select>}
        <button onClick={()=>loadLeads()}><RefreshCw size={16}/> Refresh</button>
        {connected && <button onClick={signOut}><LogOut size={16}/> Sign out</button>}
      </div>
    </header>

    {connected && activeTeam && <section className="teamBar">
      <div><strong>{activeTeam.name}</strong><span>{members.length} team member{members.length === 1 ? '' : 's'}</span></div>
      <button className="secondaryBtn" onClick={copyInvite}><Copy size={16}/> Invite code: {activeTeam.invite_code}</button>
    </section>}

    {message && <div className="notice">{message}</div>}

    <section className="stats">
      <div><span>Total Leads</span><strong>{leads.length}</strong></div>
      <div><span>No/Weak Website</span><strong>{noWebsite}</strong></div>
      <div><span>Demos/Pipeline</span><strong>{demos}</strong></div>
      <div><span>Projected MRR</span><strong>${mrr}</strong></div>
    </section>

    <main>
      <form onSubmit={addLead} className="card form">
        <h2><Plus size={18}/> Add Lead</h2>
        <input placeholder="Business name" value={form.business_name} onChange={e=>setForm({...form,business_name:e.target.value})}/>
        <input placeholder="Instagram handle" value={form.instagram_handle} onChange={e=>setForm({...form,instagram_handle:e.target.value})}/>
        <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{['Mobile Detailing','Detail Shop','Tint / PPF','Wrap Shop','Repair Shop','Mobile Mechanic','Performance Shop','Automotive Photographer','Wheel Repair','Other'].map(x=><option key={x}>{x}</option>)}</select>
        <input placeholder="City" value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/>
        <input placeholder="Followers" value={form.followers} onChange={e=>setForm({...form,followers:e.target.value})}/>
        <select value={form.website_status} onChange={e=>setForm({...form,website_status:e.target.value})}>{['Needs verification','No website','Likely no/weak site','Social-only','Website found','Strong website'].map(x=><option key={x}>{x}</option>)}</select>
        <input placeholder="Website URL" value={form.website_url} onChange={e=>setForm({...form,website_url:e.target.value})}/>
        <input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
        <input placeholder="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>
        <textarea placeholder="Notes" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/>
        <button type="submit">Add Prospect</button>
      </form>

      <section className="card tableWrap">
        <div className="toolbar"><div className="search"><Search size={16}/><input placeholder="Search leads" value={query} onChange={e=>setQuery(e.target.value)}/></div><select value={status} onChange={e=>setStatus(e.target.value)}>{['All','Research','Demo Built','DM Sent','Follow-up','Meeting','Proposal','Won','Lost'].map(x=><option key={x}>{x}</option>)}</select><select value={category} onChange={e=>setCategory(e.target.value)}>{['All','Mobile Detailing','Detail Shop','Tint / PPF','Wrap Shop','Repair Shop','Mobile Mechanic','Performance Shop','Automotive Photographer','Wheel Repair','Other'].map(x=><option key={x}>{x}</option>)}</select><button onClick={exportCsv}><Download size={16}/> CSV</button></div>
        <table><thead><tr><th>Business</th><th>IG</th><th>Category</th><th>Website</th><th>Priority</th><th>Status</th><th>Notes</th></tr></thead><tbody>{filtered.map(l=><tr key={l.id}><td><strong>{l.business_name}</strong><small>{l.city}</small></td><td>{l.instagram_handle}</td><td>{l.category}</td><td>{l.website_url ? <a href={l.website_url} target="_blank">{l.website_status} <ExternalLink size={12}/></a> : l.website_status}</td><td><select value={l.priority || 'B'} onChange={e=>updateLead(l.id,{priority:e.target.value})}>{['A','B','C','D'].map(x=><option key={x}>{x}</option>)}</select></td><td><select value={l.status || 'Research'} onChange={e=>updateLead(l.id,{status:e.target.value})}>{['Research','Demo Built','DM Sent','Follow-up','Meeting','Proposal','Won','Lost'].map(x=><option key={x}>{x}</option>)}</select></td><td>{l.notes}</td></tr>)}</tbody></table>
      </section>
    </main>
  </div>
}

createRoot(document.getElementById('root')).render(<App />)
