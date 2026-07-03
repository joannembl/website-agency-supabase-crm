import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from './supabase'
import AuthScreen from './components/AuthScreen'
import TeamSetup from './components/TeamSetup'
import { blankDemo, blankLead, pipelineStages } from './constants'

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
  const [session, setSession] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [teams, setTeams] = useState([])
  const [activeTeamId, setActiveTeamId] = useState(localStorage.getItem('active_team_id') || '')
  const [members, setMembers] = useState([])
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [leads, setLeads] = useState([])
  const [form, setForm] = useState(blankLead)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [category, setCategory] = useState('All')
  const [message, setMessage] = useState('')
  const [editingLead, setEditingLead] = useState(null)
  const [editForm, setEditForm] = useState(blankLead)
  const [viewMode, setViewMode] = useState(localStorage.getItem('crm_view_mode') || 'kanban')
  const [activeNav, setActiveNav] = useState(localStorage.getItem('crm_active_nav') || 'Dashboard')
  const [showAddModal, setShowAddModal] = useState(false)
  const [draggingLeadId, setDraggingLeadId] = useState(null)
  const [activityLead, setActivityLead] = useState(null)
  const [activities, setActivities] = useState([])
  const [activityForm, setActivityForm] = useState({ activity_type: 'DM', body: '' })
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
  const activeTeam = teams.find(t => t.id === activeTeamId)
  const currentMember = members.find(m => m.user_id === session?.user?.id)
  const currentRole = currentMember?.role || 'member'
  const isOwner = currentRole === 'owner'
  const isAdmin = currentRole === 'owner' || currentRole === 'admin'

  function normalizeDemoForm(source = {}) {
    return {
      demo_url: source.demo_url || '',
      live_url: source.live_url || '',
      github_repo: source.github_repo || '',
      hosting_provider: source.hosting_provider || 'Netlify',
      demo_status: source.demo_status || 'Not Started',
      deploy_status: source.deploy_status || '',
      preview_note: source.preview_note || '',
      feedback: source.feedback || ''
    }
  }

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

  function generateDemoBrief(lead = buildLead, source = buildForm) {
    if (!lead) return ''
    const services = source.services?.trim() || 'Add the main services/packages for this business.'
    const photos = source.photos?.trim() || 'Use placeholder automotive/detailing imagery until client photos are provided.'
    const notes = source.notes?.trim() || 'Create a simple demo-first landing page that makes the business look established and easy to contact.'
    return [
      `Demo website brief for ${lead.business_name}`,
      ``,
      `Business type: ${lead.category || source.template}`,
      `City/market: ${lead.city || 'Phoenix'}`,
      `Instagram: ${lead.instagram_handle || 'Not added'}`,
      `Website status: ${lead.website_status || 'Needs verification'}`,
      `Google rating/reviews: ${lead.google_rating || 'N/A'} (${lead.google_reviews || 0} reviews)`,
      ``,
      `Template: ${source.template}`,
      `Visual style: ${source.style}`,
      ``,
      `Recommended sections:`,
      `1. Hero section with clear headline, service area, and call-to-action`,
      `2. Services/packages section`,
      `3. Before/after or portfolio gallery`,
      `4. Why choose us / trust section`,
      `5. Google reviews/testimonials`,
      `6. Contact form and call/text buttons`,
      `7. Footer with Instagram, phone, service area, and preview disclaimer`,
      ``,
      `Services to feature:`,
      services,
      ``,
      `Photo/content notes:`,
      photos,
      ``,
      `Build notes:`,
      notes,
      ``,
      `Next step: Build the demo, save the preview URL in Demo Manager, then move this prospect to Demo Built.`
    ].join('\n')
  }

  function escapeHtml(value = '') {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;')
  }

  function slugify(value = '') {
    return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'demo-site'
  }

  function servicesList(source = buildForm) {
    const raw = source.services || ''
    const parts = raw.split(/\n|,/).map(x => x.trim()).filter(Boolean)
    if (parts.length) return parts.slice(0, 6)
    const byTemplate = {
      'Mobile Detailing': ['Maintenance Wash', 'Interior Detail', 'Full Detail', 'Paint Correction', 'Ceramic Coating'],
      'Detail Shop': ['Interior Detail', 'Exterior Detail', 'Paint Correction', 'Ceramic Coating', 'Maintenance Plans'],
      'Tint / PPF': ['Window Tint', 'Paint Protection Film', 'Ceramic Coating', 'Windshield Protection', 'Quote Requests'],
      'Wrap Shop': ['Color Change Wraps', 'Commercial Graphics', 'Chrome Delete', 'Paint Protection Film', 'Wrap Care'],
      'Repair Shop': ['Diagnostics', 'Brake Service', 'Oil Change', 'Suspension Repair', 'Preventive Maintenance'],
      'Mobile Mechanic': ['Mobile Diagnostics', 'Brake Service', 'Battery Service', 'Oil Change', 'Emergency Help'],
      'Performance Shop': ['Performance Installs', 'Dyno Tuning', 'Maintenance', 'Fabrication', 'Build Consults'],
      'Automotive Photographer': ['Automotive Shoots', 'Rolling Shots', 'Event Coverage', 'Commercial Content', 'Social Media Packages'],
      'Wheel Repair': ['Curb Rash Repair', 'Wheel Refinishing', 'Powder Coat', 'Crack Repair', 'Mount & Balance']
    }
    return byTemplate[source.template] || ['Services', 'Gallery', 'Reviews', 'Contact']
  }

  function generateSiteCopy(lead = buildLead, source = buildForm) {
    if (!lead) return ''
    const services = servicesList(source)
    const city = lead.city || 'Phoenix'
    const name = lead.business_name || 'Your Business'
    const category = lead.category || source.template
    const serviceLine = services.slice(0, 3).join(', ')
    return [
      `Website copy for ${name}`,
      ``,
      `Hero headline: ${category} in ${city}, built around quality work and easy booking.`,
      `Hero subheadline: Make ${name} look established with a clean, mobile-ready demo site that turns visitors into calls, DMs, and quote requests.`,
      `Primary CTA: Request a Quote`,
      `Secondary CTA: View Services`,
      ``,
      `Services section intro: Whether customers need ${serviceLine}, this page makes the offer clear without forcing them to DM for every detail.`,
      ...services.map((item, index) => `${index + 1}. ${item} — Clear service card with short benefit-driven copy.`),
      ``,
      `Trust section: Feature Google rating, review count, service area, fast response time, and real customer photos once available.`,
      `Gallery section: Use placeholder automotive visuals now, then replace with the owner’s best Instagram photos.`,
      `Contact section: Encourage visitors to call, text, DM, or submit a simple quote form.`,
      `Footer disclaimer: Preview website created for ${name}. Images/content may be placeholders. Not yet live.`
    ].join('\n')
  }

  function generateSiteHtml(lead = buildLead, source = buildForm) {
    if (!lead) return ''
    const name = escapeHtml(lead.business_name || 'Demo Business')
    const city = escapeHtml(lead.city || 'Phoenix')
    const category = escapeHtml(lead.category || source.template || 'Automotive Business')
    const style = source.style || 'Modern / clean'
    const services = servicesList(source)
    const rating = lead.google_rating ? `${lead.google_rating}★` : '5-star quality'
    const reviews = lead.google_reviews ? `${lead.google_reviews} Google reviews` : 'trusted local service'
    const instagram = lead.instagram_handle ? `https://instagram.com/${lead.instagram_handle.replace('@','')}` : '#'
    const serviceCards = services.map(service => `<article class="card"><h3>${escapeHtml(service)}</h3><p>Clear package details, benefits, and a simple call-to-action so customers know exactly what to do next.</p></article>`).join('\n        ')
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${name} | ${category} in ${city}</title>
  <style>
    :root { color-scheme: dark; --bg:#0b0f14; --panel:#111827; --text:#f8fafc; --muted:#94a3b8; --line:#243244; --accent:#38bdf8; --accent2:#f97316; }
    * { box-sizing: border-box; }
    body { margin:0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background:linear-gradient(135deg,#05070a,#101827 52%,#111827); color:var(--text); }
    a { color:inherit; text-decoration:none; }
    .wrap { width:min(1120px,92vw); margin:auto; }
    header { padding:22px 0; border-bottom:1px solid rgba(255,255,255,.08); position:sticky; top:0; backdrop-filter: blur(16px); background:rgba(11,15,20,.78); }
    nav { display:flex; align-items:center; justify-content:space-between; gap:16px; }
    .brand { font-weight:900; letter-spacing:-.03em; font-size:1.1rem; }
    .navlinks { display:flex; gap:18px; color:var(--muted); font-size:.92rem; }
    .btn { display:inline-flex; align-items:center; justify-content:center; padding:13px 18px; border-radius:999px; background:var(--accent); color:#041016; font-weight:800; }
    .btn.secondary { background:transparent; color:var(--text); border:1px solid rgba(255,255,255,.18); }
    .hero { padding:90px 0 70px; display:grid; grid-template-columns:1.12fr .88fr; gap:36px; align-items:center; }
    .eyebrow { color:var(--accent); text-transform:uppercase; letter-spacing:.16em; font-size:.78rem; font-weight:800; }
    h1 { font-size:clamp(2.4rem,6vw,5.4rem); line-height:.9; letter-spacing:-.07em; margin:14px 0 18px; }
    .lead { color:var(--muted); font-size:1.15rem; line-height:1.7; max-width:62ch; }
    .actions { display:flex; gap:12px; flex-wrap:wrap; margin-top:28px; }
    .heroCard { background:rgba(17,24,39,.84); border:1px solid rgba(255,255,255,.1); border-radius:28px; padding:24px; box-shadow:0 24px 80px rgba(0,0,0,.36); }
    .photo { height:330px; border-radius:22px; background:linear-gradient(135deg,rgba(56,189,248,.35),rgba(249,115,22,.22)), url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80') center/cover; }
    .stats { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-top:14px; }
    .stat { background:rgba(255,255,255,.06); padding:14px; border-radius:18px; border:1px solid rgba(255,255,255,.08); }
    .stat strong { display:block; font-size:1.25rem; }
    section { padding:58px 0; }
    .sectionHead { display:flex; justify-content:space-between; gap:24px; align-items:end; margin-bottom:24px; }
    h2 { font-size:clamp(1.8rem,3vw,3rem); margin:0; letter-spacing:-.05em; }
    .grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
    .card { background:rgba(255,255,255,.055); border:1px solid rgba(255,255,255,.1); border-radius:22px; padding:22px; }
    .card h3 { margin:0 0 10px; }
    .card p, .muted { color:var(--muted); line-height:1.65; }
    .gallery { display:grid; grid-template-columns:1.2fr .8fr .8fr; gap:14px; }
    .tile { min-height:220px; border-radius:22px; background:linear-gradient(135deg,rgba(56,189,248,.25),rgba(15,23,42,.5)), url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80') center/cover; border:1px solid rgba(255,255,255,.1); }
    .tile:nth-child(2){ background-image:linear-gradient(135deg,rgba(249,115,22,.24),rgba(15,23,42,.55)), url('https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1000&q=80'); }
    .tile:nth-child(3){ background-image:linear-gradient(135deg,rgba(56,189,248,.18),rgba(15,23,42,.62)), url('https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1000&q=80'); }
    .contact { background:linear-gradient(135deg,rgba(56,189,248,.18),rgba(249,115,22,.1)); border:1px solid rgba(255,255,255,.1); border-radius:30px; padding:34px; display:grid; grid-template-columns:1fr auto; gap:20px; align-items:center; }
    footer { color:var(--muted); border-top:1px solid rgba(255,255,255,.08); padding:24px 0; font-size:.9rem; }
    @media (max-width: 820px){ .hero,.contact{grid-template-columns:1fr}.grid,.gallery{grid-template-columns:1fr}.navlinks{display:none}.stats{grid-template-columns:1fr} }
  </style>
</head>
<body>
  <header><div class="wrap"><nav><div class="brand">${name}</div><div class="navlinks"><a href="#services">Services</a><a href="#gallery">Gallery</a><a href="#contact">Contact</a></div><a class="btn" href="#contact">Request Quote</a></nav></div></header>
  <main>
    <div class="wrap hero">
      <div>
        <div class="eyebrow">${category} · ${city}</div>
        <h1>${name} makes it easy to book quality automotive work.</h1>
        <p class="lead">A clean demo website built to help customers understand the services, trust the business, and reach out without hunting through social media DMs.</p>
        <div class="actions"><a class="btn" href="#contact">Request a Quote</a><a class="btn secondary" href="#services">View Services</a></div>
      </div>
      <aside class="heroCard"><div class="photo"></div><div class="stats"><div class="stat"><strong>${escapeHtml(rating)}</strong><span>${escapeHtml(reviews)}</span></div><div class="stat"><strong>${city}</strong><span>Service Area</span></div><div class="stat"><strong>${escapeHtml(style)}</strong><span>Demo Style</span></div></div></aside>
    </div>
    <section id="services"><div class="wrap"><div class="sectionHead"><div><div class="eyebrow">Services</div><h2>Clear offers, fewer missed leads.</h2></div><p class="muted">Service cards can be customized with pricing, package details, and booking buttons.</p></div><div class="grid">
        ${serviceCards}
      </div></div></section>
    <section id="gallery"><div class="wrap"><div class="sectionHead"><div><div class="eyebrow">Gallery</div><h2>Built for before-and-after proof.</h2></div><p class="muted">Replace these placeholders with Instagram photos or client-provided images.</p></div><div class="gallery"><div class="tile"></div><div class="tile"></div><div class="tile"></div></div></div></section>
    <section><div class="wrap"><div class="grid"><div class="card"><h3>Fast response</h3><p>Make phone, text, and quote requests obvious from every page.</p></div><div class="card"><h3>Mobile-ready</h3><p>Most local automotive leads browse from their phone. This layout is built for that.</p></div><div class="card"><h3>Trust-focused</h3><p>Show reviews, photos, location, and service details in one polished place.</p></div></div></div></section>
    <section id="contact"><div class="wrap"><div class="contact"><div><div class="eyebrow">Ready to book?</div><h2>Request a quote from ${name}.</h2><p class="muted">Call, text, DM, or use this form area to capture leads from the website.</p></div><div class="actions"><a class="btn" href="tel:${escapeHtml(lead.phone || '')}">Call Now</a><a class="btn secondary" href="${escapeHtml(instagram)}">Instagram</a></div></div></div></section>
  </main>
  <footer><div class="wrap">Preview website created for ${name}. Images and copy are placeholders. Not yet live.</div></footer>
</body>
</html>`
  }

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
    const { data, error } = await supabase
      .from('demos')
      .select('*')
      .eq('lead_id', lead.id)
      .maybeSingle()
    if (error) { setMessage(error.message); return }
    if (data) {
      const nextForm = normalizeDemoForm(data)
      setDemoRecord(data)
      setDemoForm(nextForm)
      setDemoInitialForm(nextForm)
    }
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
