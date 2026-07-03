import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from './supabase'
import AuthScreen from './components/AuthScreen'
import TeamSetup from './components/TeamSetup'
import { blankDemo, blankLead, pipelineStages } from './constants'
import useAuthSession from './hooks/useAuthSession'
import useTeams from './hooks/useTeams'
import useLeads from './hooks/useLeads'
import useActivities from './hooks/useActivities'
import * as leadService from './features/leads/leadService'
import * as demoBuilder from './features/demos/demoBuilder'
import * as demoService from './features/demos/demoService'

import Sidebar from './layout/Sidebar'
import WorkspaceHeader from './layout/WorkspaceHeader'
import TeamBar from './layout/TeamBar'
import DashboardView from './features/dashboard/DashboardView'
import PlaceholderModule from './features/modules/PlaceholderModule'
import LeadBoard from './features/leads/LeadBoard'
import LeadFormModal from './features/leads/LeadFormModal'
import EditLeadModal from './features/leads/EditLeadModal'
import TeamModal from './features/team/TeamModal'
import ActivityModal from './features/activities/ActivityModal'
import BuildDemoModal from './features/demos/BuildDemoModal'
import DemoManagerModal from './features/demos/DemoManagerModal'
import './styles.css'

function App() {
  const [message, setMessage] = useState('')
  const { session, setSession, authReady, signOut: authSignOut } = useAuthSession()
  const {
    teams, setTeams, activeTeamId, setActiveTeamId, members, activeTeam,
    currentRole, isOwner, isAdmin, loadMembers, copyInvite, shortUserId,
    changeMemberRole, removeMember
  } = useTeams(session, setMessage)
  const { leads, setLeads, loadLeads, addLead: createLeadRecord, updateLead, deleteLead: removeLeadRecord } = useLeads({ session, activeTeamId, setMessage })
  const {
    activityLead, setActivityLead, activities, activityForm, setActivityForm,
    openActivities, addActivity, deleteActivity, formatActivityDate
  } = useActivities({ session, activeTeamId, setMessage })
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [form, setForm] = useState(blankLead)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [category, setCategory] = useState('All')
  const [editingLead, setEditingLead] = useState(null)
  const [editForm, setEditForm] = useState(blankLead)
  const [viewMode, setViewMode] = useState(localStorage.getItem('crm_view_mode') || 'kanban')
  const [activeNav, setActiveNav] = useState(localStorage.getItem('crm_active_nav') || 'Dashboard')
  const [showAddModal, setShowAddModal] = useState(false)
  const [draggingLeadId, setDraggingLeadId] = useState(null)
  const [demoLead, setDemoLead] = useState(null)
  const [demoRecord, setDemoRecord] = useState(null)
  const [demoForm, setDemoForm] = useState(blankDemo)
  const [demoInitialForm, setDemoInitialForm] = useState(blankDemo)
  const [demoSaving, setDemoSaving] = useState(false)
  const [buildLead, setBuildLead] = useState(null)
  const [buildForm, setBuildForm] = useState({ template: 'Mobile Detailing', style: 'Modern / clean', services: '', photos: '', notes: '' })
  const [buildBrief, setBuildBrief] = useState('')
  const [generatedSiteCopy, setGeneratedSiteCopy] = useState('')
  const [generatedSiteHtml, setGeneratedSiteHtml] = useState('')
  const [buildSaving, setBuildSaving] = useState(false)
  const [toast, setToast] = useState('')

  const connected = Boolean(supabase)
  const normalizeDemoForm = demoBuilder.normalizeDemoForm

  const demoDirty = JSON.stringify(normalizeDemoForm(demoForm)) !== JSON.stringify(normalizeDemoForm(demoInitialForm))

  function showToast(text) {
    setToast(text)
    window.clearTimeout(showToast._timer)
    showToast._timer = window.setTimeout(() => setToast(''), 2800)
  }

  function requestCloseDemoManager() {
    if (demoDirty && !confirm('Discard changes? You have unsaved changes to this demo.')) return
    setDemoLead(null)
    setDemoRecord(null)
    setDemoForm(blankDemo)
    setDemoInitialForm(blankDemo)
  }


  function openBuildDemo(lead) {
    const defaultTemplate = lead.category && lead.category !== 'Other' ? lead.category : 'Mobile Detailing'
    setBuildLead(lead)
    setBuildForm({
      template: defaultTemplate,
      style: 'Modern / clean',
      services: lead.notes || '',
      photos: '',
      notes: ''
    })
    setBuildBrief('')
    setGeneratedSiteCopy('')
    setGeneratedSiteHtml('')
  }

  function generateDemoBrief(lead = buildLead, source = buildForm) { return demoBuilder.generateDemoBrief(lead, source) }
  function slugify(value = '') { return demoBuilder.slugify(value) }
  function generateSiteCopy(lead = buildLead, source = buildForm) { return demoBuilder.generateSiteCopy(lead, source) }
  function generateSiteHtml(lead = buildLead, source = buildForm) { return demoBuilder.generateSiteHtml(lead, source) }

  function generateTemplateSite() {
    const copy = generateSiteCopy(buildLead, buildForm)
    const html = generateSiteHtml(buildLead, buildForm)
    setGeneratedSiteCopy(copy)
    setGeneratedSiteHtml(html)
    setBuildBrief([generateDemoBrief(buildLead, buildForm), '', '--- GENERATED WEBSITE COPY ---', copy, '', '--- GENERATED INDEX.HTML CREATED ---', `Filename: ${slugify(buildLead?.business_name)}-index.html`].join('\n'))
    showToast('Template site generated')
  }

  function downloadGeneratedHtml() {
    const html = generatedSiteHtml || generateSiteHtml(buildLead, buildForm)
    if (!html) return
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${slugify(buildLead?.business_name)}-index.html`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  async function saveBuildDemo(e) {
    e?.preventDefault?.()
    if (!buildLead?.id || buildSaving) return
    setBuildSaving(true)
    setMessage('')
    const brief = buildBrief || generateDemoBrief(buildLead, buildForm)
    const htmlNote = generatedSiteHtml ? `\n\nGenerated file: ${slugify(buildLead?.business_name)}-index.html\nUse the Download index.html button in Build Demo V2 before closing if you want the static file.` : ''
    const payload = {
      lead_id: buildLead.id,
      demo_status: 'Building',
      hosting_provider: 'Netlify',
      deploy_status: 'Brief generated — ready to build',
      preview_note: `${brief}${htmlNote}`,
      feedback: buildForm.notes || null,
      built: false
    }
    try {
      if (!supabase) {
        const all = JSON.parse(localStorage.getItem('crm_demos') || '[]')
        const existing = all.find(d => d.lead_id === buildLead.id)
        const saved = existing ? { ...existing, ...payload, updated_at: new Date().toISOString() } : { ...payload, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        const nextAll = existing ? all.map(d => d.id === existing.id ? saved : d) : [saved, ...all]
        localStorage.setItem('crm_demos', JSON.stringify(nextAll))
      } else {
        const { data: existing } = await supabase.from('demos').select('id').eq('lead_id', buildLead.id).maybeSingle()
        if (existing?.id) {
          const { error } = await supabase.from('demos').update(payload).eq('id', existing.id)
          if (error) throw error
        } else {
          const { error } = await supabase.from('demos').insert(payload)
          if (error) throw error
        }
      }
      await logDemoActivity(buildLead, 'Build demo website brief created and demo status changed to Building.')
      setBuildLead(null)
      setBuildBrief('')
      setGeneratedSiteCopy('')
      setGeneratedSiteHtml('')
      setView('kanban')
      await loadLeads(activeTeamId)
      showToast('Build demo brief saved')
    } catch (error) {
      setMessage(error.message || 'Unable to save build demo brief.')
    } finally {
      setBuildSaving(false)
    }
  }


  async function addLead(e) {
    e.preventDefault(); setMessage('')
    if (!form.business_name.trim()) return
    const payload = {
      ...leadService.normalizeLeadPayload(form),
      owner_id: session?.user?.id,
      team_id: activeTeamId || null
    }
    try {
      await createLeadRecord(payload)
      setForm(blankLead)
      setShowAddModal(false)
    } catch (error) {
      setMessage(error.message)
    }
  }

  function setView(nextView) {
    setViewMode(nextView)
    localStorage.setItem('crm_view_mode', nextView)
  }

  function setNav(nextNav) {
    setActiveNav(nextNav)
    localStorage.setItem('crm_active_nav', nextNav)
    if (nextNav === 'Pipeline') setView('kanban')
    if (nextNav === 'Prospects') setView('table')
    if (nextNav === 'Demo Websites') setView('kanban')
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
    const payload = leadService.normalizeLeadPayload(editForm)
    delete payload.id
    delete payload.created_at
    delete payload.owner_id
    delete payload.team_id
    await updateLead(editingLead.id, payload)
    setEditingLead(null); setEditForm(blankLead)
  }

  async function deleteLead(id) {
    if (!confirm('Delete this prospect? This cannot be undone.')) return
    setMessage('')
    try { await removeLeadRecord(id) }
    catch (error) { setMessage(error.message) }
  }

  async function openDemoManager(lead) {
    setDemoLead(lead)
    setDemoRecord(null)
    setDemoForm(blankDemo)
    setDemoInitialForm(blankDemo)
    if (!supabase) {
      const local = JSON.parse(localStorage.getItem('crm_demos') || '[]')
      const existing = local.find(d => d.lead_id === lead.id)
      if (existing) {
        const nextForm = normalizeDemoForm(existing)
        setDemoRecord(existing)
        setDemoForm(nextForm)
        setDemoInitialForm(nextForm)
      }
      return
    }
    try {
      const data = await demoService.fetchDemoByLead({ leadId: lead.id })
      if (data) {
        const nextForm = normalizeDemoForm(data)
        setDemoRecord(data)
        setDemoForm(nextForm)
        setDemoInitialForm(nextForm)
      }
    } catch (error) { setMessage(error.message) }
  }

  async function logDemoActivity(lead, body) {
    if (!lead?.id || !body) return
    const payload = {
      lead_id: lead.id,
      team_id: activeTeamId || null,
      user_id: session?.user?.id || null,
      activity_type: 'Note',
      body
    }
    if (!supabase) {
      const all = JSON.parse(localStorage.getItem('crm_activities') || '[]')
      localStorage.setItem('crm_activities', JSON.stringify([{ ...payload, id: crypto.randomUUID(), created_at: new Date().toISOString() }, ...all]))
      return
    }
    await supabase.from('lead_activities').insert(payload)
  }

  function describeDemoChanges(before, after) {
    const labels = {
      demo_status: 'Demo status', demo_url: 'Preview URL', live_url: 'Live URL', github_repo: 'GitHub repo', hosting_provider: 'Hosting provider', deploy_status: 'Deploy status', preview_note: 'Preview notes', feedback: 'Client feedback'
    }
    const changes = Object.keys(labels).filter(key => String(before?.[key] || '') !== String(after?.[key] || '')).map(key => labels[key])
    return changes.length ? `Demo updated: ${changes.join(', ')}.` : 'Demo details saved.'
  }

  async function saveDemo(e) {
    e?.preventDefault?.()
    if (!demoLead?.id || demoSaving) return
    setMessage('')
    setDemoSaving(true)
    const before = normalizeDemoForm(demoInitialForm)
    const after = normalizeDemoForm(demoForm)
    const payload = {
      lead_id: demoLead.id,
      demo_url: after.demo_url || null,
      live_url: after.live_url || null,
      github_repo: after.github_repo || null,
      hosting_provider: after.hosting_provider || null,
      demo_status: after.demo_status || 'Not Started',
      deploy_status: after.deploy_status || null,
      preview_note: after.preview_note || null,
      feedback: after.feedback || null,
      built: ['Ready','Sent','Revisions','Approved','Live'].includes(after.demo_status)
    }
    try {
      let savedRecord = null
      if (!supabase) {
        const all = JSON.parse(localStorage.getItem('crm_demos') || '[]')
        savedRecord = demoRecord ? { ...demoRecord, ...payload, updated_at: new Date().toISOString() } : { ...payload, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        const nextAll = demoRecord ? all.map(d => d.id === demoRecord.id ? savedRecord : d) : [savedRecord, ...all]
        localStorage.setItem('crm_demos', JSON.stringify(nextAll))
        setDemoRecord(savedRecord)
      } else if (demoRecord?.id) {
        const { data, error } = await supabase.from('demos').update(payload).eq('id', demoRecord.id).select('*').single()
        if (error) throw error
        savedRecord = data
        setDemoRecord(data)
      } else {
        const { data, error } = await supabase.from('demos').insert(payload).select('*').single()
        if (error) throw error
        savedRecord = data
        setDemoRecord(data)
      }
      if (payload.demo_status === 'Ready' && demoLead.status === 'Research') await updateLead(demoLead.id, { status: 'Demo Built' })
      await logDemoActivity(demoLead, describeDemoChanges(before, after))
      setDemoInitialForm(after)
      setDemoForm(after)
      setView('kanban')
      await loadLeads(activeTeamId)
      setDemoLead(null)
      showToast('Demo updated successfully')
    } catch (error) {
      setMessage(error.message || 'Unable to save demo. Please try again.')
    } finally {
      setDemoSaving(false)
    }
  }

  useEffect(() => {
    if (!demoLead) return
    function handleKeydown(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        if (demoDirty && !demoSaving) saveDemo(event)
      }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [demoLead, demoDirty, demoSaving, demoForm, demoInitialForm])

  async function markDemoSent() {
    if (!demoLead?.id) return
    setDemoForm({ ...demoForm, demo_status: 'Sent' })
    if (supabase && demoRecord?.id) {
      const { error } = await supabase.from('demos').update({ demo_status: 'Sent', built: true, sent_at: new Date().toISOString() }).eq('id', demoRecord.id)
      if (error) return setMessage(error.message)
      await updateLead(demoLead.id, { status: 'DM Sent' })
      openDemoManager(demoLead)
    }
  }

  async function markDemoLive() {
    if (!demoLead?.id) return
    setDemoForm({ ...demoForm, demo_status: 'Live' })
    if (supabase && demoRecord?.id) {
      const { error } = await supabase.from('demos').update({ demo_status: 'Live', built: true, launched_at: new Date().toISOString() }).eq('id', demoRecord.id)
      if (error) return setMessage(error.message)
      await updateLead(demoLead.id, { status: 'Won' })
      openDemoManager(demoLead)
    }
  }

  function demoStatusForLead(lead) {
    if (lead.status === 'Won') return 'Live'
    if (lead.status === 'Demo Built') return 'Ready'
    if (lead.status === 'DM Sent') return 'Sent'
    if (lead.status === 'Follow-up') return 'Sent'
    if (lead.status === 'Meeting') return 'Revisions'
    if (lead.status === 'Proposal') return 'Approved'
    return 'Not Started'
  }

  async function signOut() {
    await authSignOut(); setTeams([]); setActiveTeamId(''); setLeads([])
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

  const showLeadBoard = ['Prospects','Pipeline','Demo Websites'].includes(activeNav)
  const userEmail = session?.user?.email

  return <div className="appShell">
    <Sidebar activeNav={activeNav} setNav={setNav} connected={connected} activeTeam={activeTeam} userEmail={userEmail} />

    <div className="workspace">
      <WorkspaceHeader
        activeNav={activeNav}
        connected={connected}
        userEmail={userEmail}
        teams={teams}
        activeTeamId={activeTeamId}
        setActiveTeamId={setActiveTeamId}
        loadLeads={loadLeads}
        signOut={signOut}
      />

      <TeamBar
        connected={connected}
        activeTeam={activeTeam}
        members={members}
        currentRole={currentRole}
        isAdmin={isAdmin}
        copyInvite={copyInvite}
        onManageTeam={()=>setShowTeamModal(true)}
      />

      {toast && <div className="toast">{toast}</div>}
      {message && <div className="notice">{message}</div>}

      {activeNav === 'Dashboard' && <DashboardView
        leads={leads}
        noWebsite={noWebsite}
        demos={demos}
        mrr={mrr}
        pipelineStages={pipelineStages}
        pipelineCounts={pipelineCounts}
        setNav={setNav}
      />}

      {showLeadBoard && <LeadBoard
        leads={leads}
        noWebsite={noWebsite}
        demos={demos}
        mrr={mrr}
        query={query}
        setQuery={setQuery}
        status={status}
        setStatus={setStatus}
        category={category}
        setCategory={setCategory}
        pipelineStages={pipelineStages}
        viewMode={viewMode}
        setView={setView}
        setShowAddModal={setShowAddModal}
        exportCsv={exportCsv}
        draggingLeadId={draggingLeadId}
        setDraggingLeadId={setDraggingLeadId}
        handleDragStart={handleDragStart}
        handleDrop={handleDrop}
        pipelineCounts={pipelineCounts}
        filtered={filtered}
        demoStatusForLead={demoStatusForLead}
        updateLead={updateLead}
        openDemoManager={openDemoManager}
        openBuildDemo={openBuildDemo}
        openActivities={openActivities}
        startEdit={startEdit}
        deleteLead={deleteLead}
        isAdmin={isAdmin}
      />}

      {!showLeadBoard && activeNav !== 'Dashboard' && <PlaceholderModule activeNav={activeNav} onManageTeam={()=>setShowTeamModal(true)} />}
    </div>

    <LeadFormModal open={showAddModal} form={form} setForm={setForm} onClose={()=>setShowAddModal(false)} addLead={addLead} />

    <TeamModal
      open={showTeamModal}
      activeTeam={activeTeam}
      currentRole={currentRole}
      isAdmin={isAdmin}
      isOwner={isOwner}
      members={members}
      session={session}
      copyInvite={copyInvite}
      shortUserId={shortUserId}
      changeMemberRole={changeMemberRole}
      removeMember={removeMember}
      onClose={()=>setShowTeamModal(false)}
    />

    <BuildDemoModal
      buildLead={buildLead}
      buildForm={buildForm}
      setBuildForm={setBuildForm}
      buildBrief={buildBrief}
      setBuildBrief={setBuildBrief}
      generatedSiteCopy={generatedSiteCopy}
      generatedSiteHtml={generatedSiteHtml}
      buildSaving={buildSaving}
      generateDemoBrief={generateDemoBrief}
      generateTemplateSite={generateTemplateSite}
      downloadGeneratedHtml={downloadGeneratedHtml}
      saveBuildDemo={saveBuildDemo}
      slugify={slugify}
      onClose={()=>setBuildLead(null)}
    />

    <DemoManagerModal
      demoLead={demoLead}
      demoForm={demoForm}
      setDemoForm={setDemoForm}
      demoDirty={demoDirty}
      demoSaving={demoSaving}
      saveDemo={saveDemo}
      requestCloseDemoManager={requestCloseDemoManager}
      markDemoSent={markDemoSent}
      markDemoLive={markDemoLive}
    />

    <ActivityModal
      activityLead={activityLead}
      activities={activities}
      activityForm={activityForm}
      setActivityForm={setActivityForm}
      addActivity={addActivity}
      formatActivityDate={formatActivityDate}
      deleteActivity={deleteActivity}
      isAdmin={isAdmin}
      onClose={()=>setActivityLead(null)}
    />

    <EditLeadModal
      editingLead={editingLead}
      editForm={editForm}
      setEditForm={setEditForm}
      onClose={()=>setEditingLead(null)}
      saveEdit={saveEdit}
    />
  </div>
}

export default App
