import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Search, Plus, ExternalLink, Download, RefreshCw, LogOut, Lock, Users, Copy, Pencil, Trash2, X, Save, LayoutDashboard, Table2, ChevronRight, ChevronLeft, GripVertical, MessageSquare } from 'lucide-react'
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
  const [editingLead, setEditingLead] = useState(null)
  const [editForm, setEditForm] = useState(blankLead)
  const [viewMode, setViewMode] = useState(localStorage.getItem('crm_view_mode') || 'kanban')
  const [showAddModal, setShowAddModal] = useState(false)
  const [draggingLeadId, setDraggingLeadId] = useState(null)
  const [activityLead, setActivityLead] = useState(null)
  const [activities, setActivities] = useState([])
  const [activityForm, setActivityForm] = useState({ activity_type: 'DM', body: '' })

  const connected = Boolean(supabase)
  const activeTeam = teams.find(t => t.id === activeTeamId)
  const pipelineStages = ['Research','Demo Built','DM Sent','Follow-up','Meeting','Proposal','Won','Lost']

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

  function normalizeLeadPayload(source) {
    return {
      ...source,
      followers: source.followers ? Number(source.followers) : null,
      google_rating: source.google_rating ? Number(source.google_rating) : null,
      google_reviews: source.google_reviews ? Number(source.google_reviews) : null
    }
  }

  async function addLead(e) {
    e.preventDefault(); setMessage('')
    if (!form.business_name.trim()) return
    const payload = {
      ...normalizeLeadPayload(form),
      owner_id: session?.user?.id,
      team_id: activeTeamId || null
    }
    if (!supabase) {
      const newLead = { ...payload, id: crypto.randomUUID(), created_at: new Date().toISOString() }
      const next = [newLead, ...leads]
      setLeads(next); localStorage.setItem('crm_leads', JSON.stringify(next)); setForm(blankLead); return
    }
    if (!activeTeamId) return setMessage('Create or join a team first.')
    const { error } = await supabase.from('leads').insert(payload)
    if (error) setMessage(error.message)
    else { setForm(blankLead); setShowAddModal(false); loadLeads() }
  }

  function setView(nextView) {
    setViewMode(nextView)
    localStorage.setItem('crm_view_mode', nextView)
  }


  async function moveLeadToStage(leadId, nextStage) {
    if (!leadId || !nextStage) return
    const currentLead = leads.find(l => l.id === leadId)
    if (!currentLead || (currentLead.status || 'Research') === nextStage) return
    await updateLead(leadId, { status: nextStage })
    setDraggingLeadId(null)
  }

  function handleDragStart(e, leadId) {
    setDraggingLeadId(leadId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', leadId)
  }

  function handleDrop(e, stage) {
    e.preventDefault()
    const leadId = e.dataTransfer.getData('text/plain') || draggingLeadId
    moveLeadToStage(leadId, stage)
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

  function startEdit(lead) {
    setEditingLead(lead)
    setEditForm({
      ...blankLead,
      ...lead,
      followers: lead.followers ?? '',
      google_rating: lead.google_rating ?? '',
      google_reviews: lead.google_reviews ?? ''
    })
  }

  async function saveEdit(e) {
    e.preventDefault(); setMessage('')
    if (!editingLead?.id) return
    const payload = normalizeLeadPayload(editForm)
    delete payload.id
    delete payload.created_at
    delete payload.owner_id
    delete payload.team_id
    if (!supabase) {
      const next = leads.map(l => l.id === editingLead.id ? { ...l, ...payload } : l)
      setLeads(next); localStorage.setItem('crm_leads', JSON.stringify(next))
      setEditingLead(null); return
    }
    const { error } = await supabase.from('leads').update(payload).eq('id', editingLead.id).eq('team_id', activeTeamId)
    if (error) return setMessage(error.message)
    setEditingLead(null); setEditForm(blankLead); loadLeads()
  }

  async function deleteLead(id) {
    if (!confirm('Delete this prospect? This cannot be undone.')) return
    setMessage('')
    if (!supabase) {
      const next = leads.filter(l => l.id !== id)
      setLeads(next); localStorage.setItem('crm_leads', JSON.stringify(next)); return
    }
    const { error } = await supabase.from('leads').delete().eq('id', id).eq('team_id', activeTeamId)
    if (error) return setMessage(error.message)
    loadLeads()
  }

  async function openActivities(lead) {
    setActivityLead(lead)
    setActivityForm({ activity_type: 'DM', body: '' })
    if (!supabase) {
      const local = JSON.parse(localStorage.getItem('crm_activities') || '[]')
      setActivities(local.filter(a => a.lead_id === lead.id).sort((a,b)=> new Date(b.created_at) - new Date(a.created_at)))
      return
    }
    const { data, error } = await supabase
      .from('lead_activities')
      .select('*')
      .eq('lead_id', lead.id)
      .eq('team_id', activeTeamId)
      .order('created_at', { ascending: false })
    if (error) { setMessage(error.message); setActivities([]) }
    else setActivities(data || [])
  }

  async function addActivity(e) {
    e.preventDefault()
    if (!activityLead?.id || !activityForm.body.trim()) return
    const payload = {
      lead_id: activityLead.id,
      team_id: activeTeamId || null,
      user_id: session?.user?.id || null,
      activity_type: activityForm.activity_type,
      body: activityForm.body.trim()
    }
    if (!supabase) {
      const newActivity = { ...payload, id: crypto.randomUUID(), created_at: new Date().toISOString() }
      const all = JSON.parse(localStorage.getItem('crm_activities') || '[]')
      const nextAll = [newActivity, ...all]
      localStorage.setItem('crm_activities', JSON.stringify(nextAll))
      setActivities([newActivity, ...activities])
      setActivityForm({ activity_type: 'DM', body: '' })
      return
    }
    const { error } = await supabase.from('lead_activities').insert(payload)
    if (error) return setMessage(error.message)
    setActivityForm({ activity_type: 'DM', body: '' })
    openActivities(activityLead)
  }

  async function deleteActivity(id) {
    if (!confirm('Delete this activity note?')) return
    if (!supabase) {
      const all = JSON.parse(localStorage.getItem('crm_activities') || '[]')
      const nextAll = all.filter(a => a.id !== id)
      localStorage.setItem('crm_activities', JSON.stringify(nextAll))
      setActivities(activities.filter(a => a.id !== id))
      return
    }
    const { error } = await supabase.from('lead_activities').delete().eq('id', id).eq('team_id', activeTeamId)
    if (error) return setMessage(error.message)
    setActivities(activities.filter(a => a.id !== id))
  }

  function formatActivityDate(value) {
    if (!value) return ''
    return new Date(value).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
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
  const pipelineCounts = pipelineStages.reduce((acc, stage) => { acc[stage] = filtered.filter(l => (l.status || 'Research') === stage).length; return acc }, {})

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

    <main className="fullBoardMain">
      <section className="card tableWrap fullBoardCard">
        <div className="toolbar"><div className="search"><Search size={16}/><input placeholder="Search leads" value={query} onChange={e=>setQuery(e.target.value)}/></div><select value={status} onChange={e=>setStatus(e.target.value)}>{['All',...pipelineStages].map(x=><option key={x}>{x}</option>)}</select><select value={category} onChange={e=>setCategory(e.target.value)}>{['All','Mobile Detailing','Detail Shop','Tint / PPF','Wrap Shop','Repair Shop','Mobile Mechanic','Performance Shop','Automotive Photographer','Wheel Repair','Other'].map(x=><option key={x}>{x}</option>)}</select><div className="viewToggle"><button type="button" className={viewMode === 'kanban' ? 'active' : ''} onClick={()=>setView('kanban')}><LayoutDashboard size={16}/> Kanban</button><button type="button" className={viewMode === 'table' ? 'active' : ''} onClick={()=>setView('table')}><Table2 size={16}/> Table</button></div><button type="button" className="addLeadBtn" onClick={()=>setShowAddModal(true)}><Plus size={16}/> Add Prospect</button><button onClick={exportCsv}><Download size={16}/> CSV</button></div>

        {viewMode === 'kanban' ? <div className="kanbanBoard">{pipelineStages.map((stage, stageIndex)=><section className={`kanbanColumn ${draggingLeadId ? 'dropReady' : ''}`} key={stage} onDragOver={e=>e.preventDefault()} onDrop={e=>handleDrop(e, stage)}><div className="kanbanHeader"><strong>{stage}</strong><span>{pipelineCounts[stage] || 0}</span></div><div className="kanbanCards">{filtered.filter(l => (l.status || 'Research') === stage).map(l=><article className={`kanbanCard ${draggingLeadId === l.id ? 'dragging' : ''}`} key={l.id} draggable onDragStart={e=>handleDragStart(e, l.id)} onDragEnd={()=>setDraggingLeadId(null)}><div className="kanbanTop"><div className="dragHandle" title="Drag to another stage"><GripVertical size={16}/></div><div className="kanbanTitle"><strong>{l.business_name}</strong><small>{l.city || 'Phoenix'} · {l.category}</small></div><span className={`priorityBadge priority${l.priority || 'B'}`}>{l.priority || 'B'}</span></div><p>{l.instagram_handle || 'No Instagram added'}</p><div className="kanbanMeta"><span>{l.website_status}</span>{l.google_reviews ? <span>{l.google_reviews} reviews</span> : null}</div>{l.notes && <p className="kanbanNotes">{l.notes}</p>}<div className="kanbanActions"><button className="iconBtn" disabled={stageIndex === 0} onClick={()=>updateLead(l.id,{status:pipelineStages[stageIndex-1]})} title="Move back"><ChevronLeft size={15}/></button><button className="iconBtn" onClick={()=>openActivities(l)} title="Activity notes"><MessageSquare size={15}/></button><button className="iconBtn" onClick={()=>startEdit(l)} title="Edit prospect"><Pencil size={15}/></button><button className="iconBtn dangerBtn" onClick={()=>deleteLead(l.id)} title="Delete prospect"><Trash2 size={15}/></button><button className="iconBtn" disabled={stageIndex === pipelineStages.length - 1} onClick={()=>updateLead(l.id,{status:pipelineStages[stageIndex+1]})} title="Move forward"><ChevronRight size={15}/></button></div></article>)}</div></section>)}</div> : <table><thead><tr><th>Business</th><th>IG</th><th>Category</th><th>Website</th><th>Priority</th><th>Status</th><th>Notes</th><th>Activity</th><th>Actions</th></tr></thead><tbody>{filtered.map(l=><tr key={l.id}><td><strong>{l.business_name}</strong><small>{l.city}</small></td><td>{l.instagram_handle}</td><td>{l.category}</td><td>{l.website_url ? <a href={l.website_url} target="_blank">{l.website_status} <ExternalLink size={12}/></a> : l.website_status}</td><td><select value={l.priority || 'B'} onChange={e=>updateLead(l.id,{priority:e.target.value})}>{['A','B','C','D'].map(x=><option key={x}>{x}</option>)}</select></td><td><select value={l.status || 'Research'} onChange={e=>updateLead(l.id,{status:e.target.value})}>{pipelineStages.map(x=><option key={x}>{x}</option>)}</select></td><td>{l.notes}</td><td><button className="secondaryBtn compactBtn" onClick={()=>openActivities(l)}><MessageSquare size={14}/> Log</button></td><td><div className="rowActions"><button className="iconBtn" onClick={()=>openActivities(l)} title="Activity notes"><MessageSquare size={15}/></button><button className="iconBtn" onClick={()=>startEdit(l)} title="Edit prospect"><Pencil size={15}/></button><button className="iconBtn dangerBtn" onClick={()=>deleteLead(l.id)} title="Delete prospect"><Trash2 size={15}/></button></div></td></tr>)}</tbody></table>}
      </section>
    </main>



    {showAddModal && <div className="modalBackdrop" onMouseDown={e=>{ if (e.target.className === 'modalBackdrop') setShowAddModal(false) }}>
      <form className="editModal" onSubmit={addLead}>
        <div className="modalHeader"><div><h2>Add Prospect</h2><p>Create a new lead in the Research stage.</p></div><button type="button" className="iconBtn" onClick={()=>setShowAddModal(false)}><X size={18}/></button></div>
        <div className="editGrid">
          <label>Business name<input required placeholder="Business name" value={form.business_name} onChange={e=>setForm({...form,business_name:e.target.value})}/></label>
          <label>Instagram handle<input placeholder="@handle" value={form.instagram_handle} onChange={e=>setForm({...form,instagram_handle:e.target.value})}/></label>
          <label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{['Mobile Detailing','Detail Shop','Tint / PPF','Wrap Shop','Repair Shop','Mobile Mechanic','Performance Shop','Automotive Photographer','Wheel Repair','Other'].map(x=><option key={x}>{x}</option>)}</select></label>
          <label>City<input placeholder="Phoenix" value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/></label>
          <label>Followers<input placeholder="Followers" value={form.followers} onChange={e=>setForm({...form,followers:e.target.value})}/></label>
          <label>Website status<select value={form.website_status} onChange={e=>setForm({...form,website_status:e.target.value})}>{['Needs verification','No website','Likely no/weak site','Social-only','Website found','Strong website'].map(x=><option key={x}>{x}</option>)}</select></label>
          <label>Website URL<input placeholder="https://..." value={form.website_url} onChange={e=>setForm({...form,website_url:e.target.value})}/></label>
          <label>Email<input placeholder="email@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
          <label>Phone<input placeholder="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label>
          <label>Google rating<input placeholder="4.9" value={form.google_rating} onChange={e=>setForm({...form,google_rating:e.target.value})}/></label>
          <label>Google reviews<input placeholder="125" value={form.google_reviews} onChange={e=>setForm({...form,google_reviews:e.target.value})}/></label>
          <label>Priority<select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>{['A','B','C','D'].map(x=><option key={x}>{x}</option>)}</select></label>
          <label>Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>{pipelineStages.map(x=><option key={x}>{x}</option>)}</select></label>
          <label className="fullWidth">Notes<textarea placeholder="Notes" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></label>
        </div>
        <div className="modalActions"><button type="button" className="secondaryBtn" onClick={()=>setShowAddModal(false)}>Cancel</button><button type="submit"><Plus size={16}/> Add prospect</button></div>
      </form>
    </div>}

    {activityLead && <div className="modalBackdrop" onMouseDown={e=>{ if (e.target.className === 'modalBackdrop') setActivityLead(null) }}>
      <div className="editModal activityModalV2">
        <div className="activityModalHeader">
          <div>
            <span className="eyebrow">Prospect activity</span>
            <h2>{activityLead.business_name}</h2>
            <div className="activityLeadMeta">
              <span>{activityLead.category || 'No category'}</span>
              <span>{activityLead.city || 'Phoenix'}</span>
              <span>{activityLead.status || 'Research'}</span>
            </div>
          </div>
          <button type="button" className="iconBtn" onClick={()=>setActivityLead(null)}><X size={18}/></button>
        </div>

        <div className="activityModalGrid">
          <section className="activityComposer">
            <h3>Log a new activity</h3>
            <p>Track every DM, call, meeting, email, and follow-up so you always know the next step.</p>

            <div className="quickActivityRow">
              <button type="button" className="quickChip" onClick={()=>setActivityForm({activity_type:'DM', body:'Sent first DM with demo site link.'})}>First DM</button>
              <button type="button" className="quickChip" onClick={()=>setActivityForm({activity_type:'Follow-up', body:'Followed up after sending the demo link.'})}>Follow-up</button>
              <button type="button" className="quickChip" onClick={()=>setActivityForm({activity_type:'Call', body:'Called business. No answer / left voicemail.'})}>Call attempt</button>
              <button type="button" className="quickChip" onClick={()=>setActivityForm({activity_type:'Meeting', body:'Meeting booked to review the demo site.'})}>Meeting booked</button>
            </div>

            <form className="activityFormV2" onSubmit={addActivity}>
              <label>Activity type
                <select value={activityForm.activity_type} onChange={e=>setActivityForm({...activityForm, activity_type:e.target.value})}>{['DM','Call','Meeting','Follow-up','Email','Note'].map(x=><option key={x}>{x}</option>)}</select>
              </label>
              <label>What happened?
                <textarea placeholder="Example: Sent first DM with demo link. They replied asking for pricing." value={activityForm.body} onChange={e=>setActivityForm({...activityForm, body:e.target.value})}></textarea>
              </label>
              <button type="submit" disabled={!activityForm.body.trim()}><Plus size={16}/> Add activity</button>
            </form>
          </section>

          <section className="activityHistoryPanel">
            <div className="historyHeader">
              <h3>Timeline</h3>
              <span>{activities.length} {activities.length === 1 ? 'entry' : 'entries'}</span>
            </div>
            <div className="activityTimelineV2">
              {activities.length === 0 ? <div className="emptyActivityState">
                <MessageSquare size={28}/>
                <strong>No activity yet</strong>
                <p>Start by logging the first DM, call, meeting, or follow-up.</p>
              </div> : activities.map(a=><article className="activityItemV2" key={a.id}>
                <div className={`activityTypeBadge type${String(a.activity_type || 'Note').replace(/[^a-zA-Z]/g,'')}`}>{a.activity_type}</div>
                <div className="activityContentV2">
                  <div className="activityHeaderV2"><span>{formatActivityDate(a.created_at)}</span><button type="button" className="textDanger" onClick={()=>deleteActivity(a.id)} title="Delete activity">Delete</button></div>
                  <p>{a.body}</p>
                </div>
              </article>)}
            </div>
          </section>
        </div>
      </div>
    </div>}

    {editingLead && <div className="modalBackdrop" onMouseDown={e=>{ if (e.target.className === 'modalBackdrop') setEditingLead(null) }}>
      <form className="editModal" onSubmit={saveEdit}>
        <div className="modalHeader"><div><h2>Edit Prospect</h2><p>{editingLead.business_name}</p></div><button type="button" className="iconBtn" onClick={()=>setEditingLead(null)}><X size={18}/></button></div>
        <div className="editGrid">
          <label>Business name<input required value={editForm.business_name || ''} onChange={e=>setEditForm({...editForm,business_name:e.target.value})}/></label>
          <label>Instagram handle<input value={editForm.instagram_handle || ''} onChange={e=>setEditForm({...editForm,instagram_handle:e.target.value})}/></label>
          <label>Category<select value={editForm.category || 'Other'} onChange={e=>setEditForm({...editForm,category:e.target.value})}>{['Mobile Detailing','Detail Shop','Tint / PPF','Wrap Shop','Repair Shop','Mobile Mechanic','Performance Shop','Automotive Photographer','Wheel Repair','Other'].map(x=><option key={x}>{x}</option>)}</select></label>
          <label>City<input value={editForm.city || ''} onChange={e=>setEditForm({...editForm,city:e.target.value})}/></label>
          <label>Followers<input value={editForm.followers || ''} onChange={e=>setEditForm({...editForm,followers:e.target.value})}/></label>
          <label>Website status<select value={editForm.website_status || 'Needs verification'} onChange={e=>setEditForm({...editForm,website_status:e.target.value})}>{['Needs verification','No website','Likely no/weak site','Social-only','Website found','Strong website'].map(x=><option key={x}>{x}</option>)}</select></label>
          <label>Website URL<input value={editForm.website_url || ''} onChange={e=>setEditForm({...editForm,website_url:e.target.value})}/></label>
          <label>Email<input value={editForm.email || ''} onChange={e=>setEditForm({...editForm,email:e.target.value})}/></label>
          <label>Phone<input value={editForm.phone || ''} onChange={e=>setEditForm({...editForm,phone:e.target.value})}/></label>
          <label>Google rating<input value={editForm.google_rating || ''} onChange={e=>setEditForm({...editForm,google_rating:e.target.value})}/></label>
          <label>Google reviews<input value={editForm.google_reviews || ''} onChange={e=>setEditForm({...editForm,google_reviews:e.target.value})}/></label>
          <label>Priority<select value={editForm.priority || 'B'} onChange={e=>setEditForm({...editForm,priority:e.target.value})}>{['A','B','C','D'].map(x=><option key={x}>{x}</option>)}</select></label>
          <label>Status<select value={editForm.status || 'Research'} onChange={e=>setEditForm({...editForm,status:e.target.value})}>{['Research','Demo Built','DM Sent','Follow-up','Meeting','Proposal','Won','Lost'].map(x=><option key={x}>{x}</option>)}</select></label>
          <label className="fullWidth">Notes<textarea value={editForm.notes || ''} onChange={e=>setEditForm({...editForm,notes:e.target.value})}/></label>
        </div>
        <div className="modalActions"><button type="button" className="secondaryBtn" onClick={()=>setEditingLead(null)}>Cancel</button><button type="submit"><Save size={16}/> Save changes</button></div>
      </form>
    </div>}

  </div>
}

createRoot(document.getElementById('root')).render(<App />)
