import { useState } from 'react'
import { ExternalLink, Download, LayoutDashboard, Table2, ChevronRight, ChevronLeft, GripVertical, MessageSquare, Monitor, Rocket, Pencil, Trash2, Plus, Users, Globe2, BadgeDollarSign, Clock3, Camera, Phone, Mail, MapPin, Star, Filter, Sparkles, X, ChevronDown } from 'lucide-react'
import { leadCategories, priorities } from '../../constants'
import Button from '../../components/ui/Button'
import Badge, { statusTone } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import FilterSelect from '../../components/ui/FilterSelect'
import PageHeader from '../../components/ui/PageHeader'
import SearchInput from '../../components/ui/SearchInput'
import StatCard from '../../components/ui/StatCard'
import { Toolbar, ToolbarGroup } from '../../components/ui/Toolbar'
import Modal from '../../components/ui/Modal'
import { PageLayout, PageStats, PageToolbar, PageContent } from '../../layout'

export default function LeadBoard(props) {
  const {
    activeNav = 'Pipeline', leads, noWebsite, demos, mrr, query, setQuery, status, setStatus, category, setCategory,
    pipelineStages, viewMode, setView, setShowAddModal, exportCsv, draggingLeadId, setDraggingLeadId,
    handleDragStart, handleDrop, pipelineCounts, filtered, demoStatusForLead, updateLead,
    openDemoManager, openBuildDemo, openActivities, startEdit, deleteLead, isAdmin
  } = props

  if (activeNav === 'Prospects') {
    return <ProspectsView {...{
      leads, noWebsite, demos, mrr, query, setQuery, status, setStatus, category, setCategory,
      pipelineStages, setShowAddModal, exportCsv, filtered, demoStatusForLead, updateLead,
      openDemoManager, openBuildDemo, openActivities, startEdit, deleteLead, isAdmin
    }} />
  }

  if (activeNav === 'Demo Websites') {
    return <DemoWebsitesView {...{
      leads, query, setQuery, status, setStatus, category, setCategory, pipelineStages, setShowAddModal,
      exportCsv, filtered, demoStatusForLead, updateLead, openDemoManager, openBuildDemo,
      openActivities, startEdit, deleteLead, isAdmin
    }} />
  }

  return <PipelineView {...{
    leads, noWebsite, demos, mrr, query, setQuery, status, setStatus, category, setCategory,
    pipelineStages, viewMode, setView, setShowAddModal, exportCsv, draggingLeadId, setDraggingLeadId,
    handleDragStart, handleDrop, pipelineCounts, filtered, demoStatusForLead, updateLead,
    openDemoManager, openBuildDemo, openActivities, startEdit, deleteLead, isAdmin
  }} />
}


function DemoWebsitesView({ leads, query, setQuery, status, setStatus, category, setCategory, pipelineStages, setShowAddModal, exportCsv, filtered, demoStatusForLead, updateLead, openDemoManager, openBuildDemo, openActivities, startEdit, deleteLead, isAdmin }) {
  const demoLeads = filtered.filter(lead => {
    const demoStatus = demoStatusForLead(lead)
    const stage = lead.status || 'Research'
    return demoStatus !== 'Not Started' || ['Demo Built','DM Sent','Follow-up','Meeting','Proposal','Won'].includes(stage)
  })
  const totalDemos = demoLeads.length
  const buildingCount = demoLeads.filter(l => demoStatusForLead(l) === 'Building').length
  const readyCount = demoLeads.filter(l => ['Ready','Demo Ready'].includes(demoStatusForLead(l))).length
  const liveCount = demoLeads.filter(l => demoStatusForLead(l) === 'Live' || l.status === 'Won').length
  const sentCount = demoLeads.filter(l => ['Sent','Revisions','Approved'].includes(demoStatusForLead(l))).length
  const [demoFilter, setDemoFilter] = useState('All')
  const visibleDemos = demoLeads.filter(lead => demoFilter === 'All' || demoStatusForLead(lead) === demoFilter || (demoFilter === 'Ready' && ['Ready','Demo Ready'].includes(demoStatusForLead(lead))))

  return <PageLayout className="demoWebsitesPage">
    <PageHeader
      eyebrow="Demo operations"
      title="Demo Websites"
      description="Manage every preview site from brief to sent, revisions, approval, and launch. This is your demo-first production dashboard."
      actions={<>
        <Button variant="secondary" icon={Download} onClick={exportCsv}>Export CSV</Button>
        <Button icon={Plus} onClick={()=>setShowAddModal(true)}>Add Prospect</Button>
      </>}
      meta={<>
        <Badge tone="info" dot>{totalDemos} demo projects</Badge>
        <Badge tone="purple" dot>{readyCount} ready</Badge>
        <Badge tone="success" dot>{liveCount} live</Badge>
      </>}
    />

    <PageStats className="demoStatsGrid">
      <StatCard label="Total Demos" value={totalDemos} helper="Active demo projects" icon={Monitor} tone="info" />
      <StatCard label="Building" value={buildingCount} helper="Briefs or templates in progress" icon={Rocket} tone="warning" />
      <StatCard label="Ready / Sent" value={readyCount + sentCount} helper="Ready to pitch or already sent" icon={Sparkles} tone="purple" />
      <StatCard label="Live" value={liveCount} helper="Converted into client sites" icon={Globe2} tone="success" />
    </PageStats>

    <PageToolbar><Card className="demoToolbarCard">
      <Toolbar>
        <ToolbarGroup className="demoToolbarPrimary">
          <SearchInput value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search demos by business, Instagram, category, city..." />
          <FilterSelect label="Pipeline" value={status} onChange={e=>setStatus(e.target.value)} options={['All', ...pipelineStages]} />
          <FilterSelect label="Category" value={category} onChange={e=>setCategory(e.target.value)} options={['All', ...leadCategories]} />
        </ToolbarGroup>
        <ToolbarGroup>
          <div className="demoStatusTabs" aria-label="Demo status filters">
            {['All','Building','Ready','Sent','Revisions','Approved','Live'].map(item => <button key={item} type="button" className={demoFilter === item ? 'active' : ''} onClick={()=>setDemoFilter(item)}>{item}</button>)}
          </div>
        </ToolbarGroup>
      </Toolbar>
    </Card></PageToolbar>

    <PageContent>
    {visibleDemos.length === 0 ? <EmptyState icon={Monitor} title="No demo websites found" description="Build or mark a demo for a prospect to start tracking it here." action={<Button icon={Plus} onClick={()=>setShowAddModal(true)}>Add Prospect</Button>} /> :
      <section className="demoWebsiteGrid">
        {visibleDemos.map(lead => <DemoWebsiteCard
          key={lead.id}
          lead={lead}
          demoStatus={demoStatusForLead(lead)}
          openDemoManager={openDemoManager}
          openBuildDemo={openBuildDemo}
          openActivities={openActivities}
          updateLead={updateLead}
          pipelineStages={pipelineStages}
          startEdit={startEdit}
        />)}
      </section>}
    </PageContent>
  </PageLayout>
}

function DemoWebsiteCard({ lead, demoStatus, openDemoManager, openBuildDemo, openActivities, updateLead, pipelineStages, startEdit }) {
  const stage = lead.status || 'Research'
  const businessSlug = slugFromBusinessName(lead.business_name)
  const previewGuess = lead.website_url && lead.website_status === 'Website found' ? lead.website_url : ''
  const progress = [
    { label: 'Brief', done: demoStatus !== 'Not Started' },
    { label: 'Built', done: ['Ready','Demo Ready','Sent','Revisions','Approved','Live'].includes(demoStatus) },
    { label: 'Sent', done: ['Sent','Revisions','Approved','Live'].includes(demoStatus) },
    { label: 'Approved', done: ['Approved','Live'].includes(demoStatus) },
    { label: 'Live', done: demoStatus === 'Live' || stage === 'Won' }
  ]

  return <Card className="demoWebsiteCard">
    <div className="demoCardTop">
      <div className="pipelineAvatar">{initials(lead.business_name)}</div>
      <div className="demoCardTitleBlock">
        <div className="demoCardTitleRow">
          <h2>{lead.business_name || 'Untitled Demo'}</h2>
          <Badge tone={statusTone(demoStatus)} dot>{demoStatus}</Badge>
        </div>
        <p>{lead.city || 'Phoenix'} · {lead.category || 'Automotive'} · {businessSlug}</p>
      </div>
    </div>

    <div className="demoProgressLine">
      {progress.map(step => <div key={step.label} className={step.done ? 'done' : ''}>
        <span></span>
        <small>{step.label}</small>
      </div>)}
    </div>

    <div className="demoCardMetaGrid">
      <div><span>Pipeline</span><strong>{stage}</strong></div>
      <div><span>Priority</span><strong>{lead.priority || 'B'}</strong></div>
      <div><span>Website</span><strong>{lead.website_status || 'Needs verification'}</strong></div>
      <div><span>Instagram</span><strong>{lead.instagram_handle || 'Not added'}</strong></div>
    </div>

    {lead.notes ? <div className="demoNotesPreview">{lead.notes}</div> : <div className="demoNotesPreview muted">No demo notes yet. Open Manage Demo to add preview notes, feedback, URLs, and deployment details.</div>}

    <div className="demoCardActions">
      <Button variant="secondary" icon={Monitor} onClick={()=>openDemoManager(lead)}>Manage</Button>
      <Button variant="secondary" icon={Rocket} onClick={()=>openBuildDemo(lead)}>Build</Button>
      <Button variant="ghost" icon={MessageSquare} onClick={()=>openActivities(lead)}>Activity</Button>
      <Button variant="ghost" icon={Pencil} onClick={()=>startEdit(lead)}>Edit</Button>
    </div>

    <div className="demoCardFooter">
      <select value={stage} onChange={e=>updateLead(lead.id, { status: e.target.value })}>{pipelineStages.map(x=><option key={x}>{x}</option>)}</select>
      {previewGuess ? <a href={previewGuess} target="_blank" rel="noreferrer">Open site <ExternalLink size={12}/></a> : <span>Preview URL not added</span>}
    </div>
  </Card>
}

function slugFromBusinessName(value = '') {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'demo-site'
}

function PipelineView({ leads, noWebsite, demos, mrr, query, setQuery, status, setStatus, category, setCategory, pipelineStages, viewMode, setView, setShowAddModal, exportCsv, draggingLeadId, setDraggingLeadId, handleDragStart, handleDrop, pipelineCounts, filtered, demoStatusForLead, updateLead, openDemoManager, openBuildDemo, openActivities, startEdit, deleteLead, isAdmin }) {
  const activePipelineCount = filtered.filter(l => !['Won','Lost'].includes(l.status || 'Research')).length
  const readyDemoCount = filtered.filter(l => ['Ready','Demo Ready','Sent','Live'].includes(demoStatusForLead(l))).length
  const proposalCount = filtered.filter(l => (l.status || '') === 'Proposal').length
  const wonCount = leads.filter(l => l.status === 'Won').length

  return <PageLayout className="pipelinePage">
    <PageHeader
      eyebrow="Sales pipeline"
      title="Pipeline"
      description="Move prospects from research to demo, proposal, and won. Drag cards between stages or use the quick actions on each card."
      actions={<>
        <Button variant="secondary" icon={Download} onClick={exportCsv}>Export CSV</Button>
        <Button icon={Plus} onClick={()=>setShowAddModal(true)}>Add Prospect</Button>
      </>}
      meta={<>
        <Badge tone="info" dot>{filtered.length} visible</Badge>
        <Badge tone="purple" dot>{readyDemoCount} demos ready/sent</Badge>
        <Badge tone="success" dot>{wonCount} won</Badge>
      </>}
    />

    <PageStats className="pipelineStatsGrid">
      <StatCard label="Active Pipeline" value={activePipelineCount} helper="Open prospects" icon={LayoutDashboard} tone="info" />
      <StatCard label="No/Weak Website" value={noWebsite} helper="Best demo candidates" icon={Globe2} tone="warning" />
      <StatCard label="Proposals" value={proposalCount} helper="Close-ready leads" icon={BadgeDollarSign} tone="purple" />
      <StatCard label="Projected MRR" value={`$${mrr}`} helper="$99/mo won leads" icon={BadgeDollarSign} tone="success" />
    </PageStats>

    <PageToolbar><Card className="pipelineToolbarCard">
      <Toolbar>
        <ToolbarGroup className="pipelineToolbarPrimary">
          <SearchInput value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search business, Instagram, category, city..." />
          <FilterSelect label="Stage" value={status} onChange={e=>setStatus(e.target.value)} options={['All', ...pipelineStages]} />
          <FilterSelect label="Category" value={category} onChange={e=>setCategory(e.target.value)} options={['All', ...leadCategories]} />
        </ToolbarGroup>
        <ToolbarGroup>
          <div className="pipelineViewToggle" aria-label="Pipeline view mode">
            <button type="button" className={viewMode === 'kanban' ? 'active' : ''} onClick={()=>setView('kanban')}><LayoutDashboard size={15}/> Board</button>
            <button type="button" className={viewMode === 'table' ? 'active' : ''} onClick={()=>setView('table')}><Table2 size={15}/> Table</button>
          </div>
          <Badge tone="neutral"><Filter size={12}/> {status === 'All' && category === 'All' ? 'No filters' : 'Filtered'}</Badge>
        </ToolbarGroup>
      </Toolbar>
    </Card></PageToolbar>

    <PageContent><Card className="pipelineBoardShell">
      {viewMode === 'kanban'
        ? <KanbanView {...{ pipelineStages, draggingLeadId, handleDrop, pipelineCounts, filtered, setDraggingLeadId, handleDragStart, demoStatusForLead, updateLead, openDemoManager, openBuildDemo, openActivities, startEdit, deleteLead, isAdmin }} />
        : <TableView {...{ filtered, updateLead, pipelineStages, openActivities, openDemoManager, openBuildDemo, startEdit, deleteLead, isAdmin }} />}
    </Card></PageContent>
  </PageLayout>
}

function ProspectsView({ leads, noWebsite, demos, mrr, query, setQuery, status, setStatus, category, setCategory, pipelineStages, setShowAddModal, exportCsv, filtered, demoStatusForLead, updateLead, openDemoManager, openBuildDemo, openActivities, startEdit, deleteLead, isAdmin }) {
  const wonCount = leads.filter(l => l.status === 'Won').length
  const socialOnlyCount = leads.filter(l => ['No website','Likely no/weak site','Social-only'].includes(l.website_status)).length
  const highPriorityCount = leads.filter(l => ['A','A+'].includes(l.priority)).length

  return <PageLayout className="prospectsPage">
    <PageHeader
      eyebrow="Lead database"
      title="Prospects"
      description="Research, qualify, and organize local businesses before they move into your demo-first pipeline."
      actions={<>
        <Button variant="secondary" icon={Download} onClick={exportCsv}>Export CSV</Button>
        <Button icon={Plus} onClick={()=>setShowAddModal(true)}>Add Prospect</Button>
      </>}
      meta={<>
        <Badge tone="info" dot>{filtered.length} shown</Badge>
        <Badge tone="warning" dot>{socialOnlyCount} no/weak website</Badge>
        <Badge tone="success" dot>{wonCount} won</Badge>
      </>}
    />

    <PageStats className="prospectStatsGrid">
      <StatCard label="Total Prospects" value={leads.length} helper="All team leads" icon={Users} />
      <StatCard label="No/Weak Website" value={noWebsite} helper="Best demo candidates" icon={Globe2} tone="warning" />
      <StatCard label="Demo Pipeline" value={demos} helper="Built, sent, proposal, or won" icon={Sparkles} tone="info" />
      <StatCard label="Projected MRR" value={`$${mrr}`} helper="Based on $99/mo won leads" icon={BadgeDollarSign} tone="success" />
    </PageStats>

    <PageToolbar><Card className="prospectsToolbarCard">
      <Toolbar>
        <ToolbarGroup className="prospectsToolbarPrimary">
          <SearchInput value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search business, Instagram, category, city, notes..." />
          <FilterSelect label="Stage" value={status} onChange={e=>setStatus(e.target.value)} options={['All', ...pipelineStages]} />
          <FilterSelect label="Category" value={category} onChange={e=>setCategory(e.target.value)} options={['All', ...leadCategories]} />
        </ToolbarGroup>
        <ToolbarGroup>
          <Badge tone="dark">{highPriorityCount} high priority</Badge>
          <Badge tone="neutral"><Filter size={12}/> Filters active</Badge>
        </ToolbarGroup>
      </Toolbar>
    </Card></PageToolbar>

    <PageContent>
    {filtered.length === 0 ? <EmptyState icon={Users} title="No prospects found" description="Try changing your filters or add a new prospect to start building your pipeline." action={<Button icon={Plus} onClick={()=>setShowAddModal(true)}>Add Prospect</Button>} /> :
      <section className="prospectList">
        {filtered.map(lead => <ProspectCard
          key={lead.id}
          lead={lead}
          demoStatus={demoStatusForLead(lead)}
          pipelineStages={pipelineStages}
          updateLead={updateLead}
          openDemoManager={openDemoManager}
          openBuildDemo={openBuildDemo}
          openActivities={openActivities}
          startEdit={startEdit}
          deleteLead={deleteLead}
          isAdmin={isAdmin}
        />)}
      </section>}
    </PageContent>
  </PageLayout>
}

function ProspectCard({ lead, demoStatus, pipelineStages, updateLead, openDemoManager, openBuildDemo, openActivities, startEdit, deleteLead, isAdmin }) {
  const priorityTone = lead.priority === 'A' || lead.priority === 'A+' ? 'success' : lead.priority === 'C' ? 'warning' : 'neutral'
  const websiteTone = ['No website','Likely no/weak site','Social-only'].includes(lead.website_status) ? 'warning' : lead.website_status === 'Website found' ? 'success' : 'neutral'
  const stage = lead.status || 'Research'

  return <Card className="prospectListCard" interactive>
    <div className="prospectMain">
      <div className="prospectAvatar">{initials(lead.business_name)}</div>
      <div className="prospectSummary">
        <div className="prospectTitleRow">
          <h2>{lead.business_name || 'Untitled Prospect'}</h2>
          <Badge tone={priorityTone}>Priority {lead.priority || 'B'}</Badge>
        </div>
        <p className="prospectSubline"><MapPin size={13}/>{lead.city || 'Phoenix'} <span>·</span> {lead.category || 'Automotive'}</p>
        <div className="prospectBadges cleanBadges">
          <Badge tone={statusTone(stage)} dot>{stage}</Badge>
          <Badge tone={statusTone(demoStatus)} dot>Demo: {demoStatus}</Badge>
          <Badge tone={websiteTone} dot>{lead.website_status || 'Needs verification'}</Badge>
        </div>
      </div>
    </div>

    <div className="prospectContactGrid">
      <InfoLine icon={Camera} label="IG" value={lead.instagram_handle || 'Not added'} href={instagramUrl(lead.instagram_handle)} />
      <InfoLine icon={Phone} label="Phone" value={lead.phone || 'Not added'} href={lead.phone ? `tel:${lead.phone}` : ''} />
      <InfoLine icon={Mail} label="Email" value={lead.email || 'Not added'} href={lead.email ? `mailto:${lead.email}` : ''} />
      <InfoLine icon={Star} label="Reviews" value={lead.google_reviews ? `${lead.google_rating || '—'} · ${lead.google_reviews}` : 'Not added'} />
    </div>

    <div className="prospectNextStep">
      <span>Notes / next step</span>
      <p>{lead.notes || 'No next step yet. Log a DM, call, or follow-up.'}</p>
    </div>

    <div className="prospectControls">
      <label>
        Stage
        <select value={stage} onChange={e=>updateLead(lead.id, { status: e.target.value })}>{pipelineStages.map(x=><option key={x}>{x}</option>)}</select>
      </label>
      <div className="prospectActionRow">
        <Button size="sm" variant="secondary" icon={Monitor} onClick={()=>openDemoManager(lead)}>Demo</Button>
        <Button size="sm" variant="secondary" icon={Rocket} onClick={()=>openBuildDemo(lead)}>Build</Button>
        <Button size="sm" variant="ghost" icon={MessageSquare} onClick={()=>openActivities(lead)}>Activity</Button>
        <Button size="sm" variant="ghost" icon={Pencil} onClick={()=>startEdit(lead)}>Edit</Button>
        {isAdmin ? <Button size="sm" variant="danger" icon={Trash2} onClick={()=>deleteLead(lead.id)}>Delete</Button> : null}
      </div>
    </div>
  </Card>
}

function InfoLine({ icon: Icon, label, value, href }) {
  const content = <><Icon size={14}/><span>{label}</span><strong>{value}</strong>{href ? <ExternalLink size={12}/> : null}</>
  if (href) return <a className="prospectInfoLine" href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">{content}</a>
  return <div className="prospectInfoLine">{content}</div>
}

function initials(value = '') {
  return value.split(' ').filter(Boolean).slice(0,2).map(word => word[0]).join('').toUpperCase() || 'CD'
}

function instagramUrl(handle = '') {
  if (!handle) return ''
  const cleaned = handle.replace('@', '').trim()
  if (!cleaned) return ''
  return `https://instagram.com/${cleaned}`
}

function KanbanView({ pipelineStages, draggingLeadId, handleDrop, pipelineCounts, filtered, setDraggingLeadId, handleDragStart, demoStatusForLead, updateLead, openDemoManager, openBuildDemo, openActivities, startEdit, deleteLead, isAdmin }) {
  const [selectedLead, setSelectedLead] = useState(null)
  const selectedDemoStatus = selectedLead ? demoStatusForLead(selectedLead) : 'Not Started'

  return <>
    <div className="pipelineKanbanBoard">
      {pipelineStages.map((stage, stageIndex)=>{
        const stageLeads = filtered.filter(l => (l.status || 'Research') === stage)
        return <section className={`pipelineColumn ${draggingLeadId ? 'dropReady' : ''}`} key={stage} onDragOver={e=>e.preventDefault()} onDrop={e=>handleDrop(e, stage)}>
          <div className="pipelineColumnHeader">
            <div>
              <strong>{stage}</strong>
              <small>{stageLeadDescription(stage)}</small>
            </div>
            <span>{pipelineCounts[stage] || 0}</span>
          </div>
          <div className="pipelineColumnBody">
            {stageLeads.length === 0 ? <div className="pipelineEmptyDrop">Drop leads here</div> : stageLeads.map(l=><PipelineCard
              key={l.id}
              lead={l}
              stageIndex={stageIndex}
              pipelineStages={pipelineStages}
              draggingLeadId={draggingLeadId}
              setDraggingLeadId={setDraggingLeadId}
              handleDragStart={handleDragStart}
              demoStatus={demoStatusForLead(l)}
              updateLead={updateLead}
              onOpenDetails={()=>setSelectedLead(l)}
            />)}
          </div>
        </section>
      })}
    </div>

    <LeadDetailModal
      lead={selectedLead}
      demoStatus={selectedDemoStatus}
      pipelineStages={pipelineStages}
      updateLead={updateLead}
      onClose={()=>setSelectedLead(null)}
      openDemoManager={openDemoManager}
      openBuildDemo={openBuildDemo}
      openActivities={openActivities}
      startEdit={startEdit}
      deleteLead={deleteLead}
      isAdmin={isAdmin}
    />
  </>
}

function PipelineCard({ lead, stageIndex, pipelineStages, draggingLeadId, setDraggingLeadId, handleDragStart, demoStatus, updateLead, onOpenDetails }) {
  const stage = lead.status || 'Research'
  const websiteTone = ['No website','Likely no/weak site','Social-only'].includes(lead.website_status) ? 'warning' : lead.website_status === 'Website found' ? 'success' : 'neutral'
  const priorityTone = lead.priority === 'A' || lead.priority === 'A+' ? 'success' : lead.priority === 'C' ? 'warning' : 'neutral'

  const moveStage = (e, nextStage) => {
    e.stopPropagation()
    updateLead(lead.id,{status: nextStage})
  }

  return <article
    className={`pipelineLeadCard jiraStyleCard ${draggingLeadId === lead.id ? 'dragging' : ''}`}
    draggable
    role="button"
    tabIndex={0}
    onClick={onOpenDetails}
    onKeyDown={e=>{ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenDetails() } }}
    onDragStart={e=>handleDragStart(e, lead.id)}
    onDragEnd={()=>setDraggingLeadId(null)}
  >
    <div className="pipelineCardTop">
      <div className="dragHandle" title="Drag to another stage" onClick={e=>e.stopPropagation()}><GripVertical size={16}/></div>
      <div className="pipelineCardIdentity">
        <div className="pipelineAvatar">{initials(lead.business_name)}</div>
        <div>
          <strong title={lead.business_name}>{lead.business_name || 'Untitled Prospect'}</strong>
          <small><MapPin size={12}/>{lead.city || 'Phoenix'} · {lead.category || 'Automotive'}</small>
        </div>
      </div>
      <Badge tone={priorityTone}>P{lead.priority || 'B'}</Badge>
    </div>

    <div className="pipelineCardBadges">
      <Badge tone={statusTone(stage)} dot>{stage}</Badge>
      <Badge tone={statusTone(demoStatus)} dot>{demoStatus}</Badge>
      <Badge tone={websiteTone} dot>{lead.website_status || 'Needs verification'}</Badge>
    </div>

    <div className="pipelineCardDetails compact">
      <span><Camera size={13}/>{lead.instagram_handle || 'No Instagram'}</span>
      {lead.phone ? <span><Phone size={13}/>{lead.phone}</span> : null}
    </div>

    {lead.notes ? <p className="pipelineCardNote">{lead.notes}</p> : <p className="pipelineCardNote muted">Click to view details and next actions.</p>}

    <div className="jiraCardFooter" onClick={e=>e.stopPropagation()}>
      <button type="button" disabled={stageIndex === 0} onClick={e=>moveStage(e, pipelineStages[stageIndex-1])}><ChevronLeft size={14}/> Back</button>
      <span>Click card for actions</span>
      <button type="button" disabled={stageIndex === pipelineStages.length - 1} onClick={e=>moveStage(e, pipelineStages[stageIndex+1])}>Next <ChevronRight size={14}/></button>
    </div>
  </article>
}


function LeadDetailModal({ lead, demoStatus, pipelineStages, updateLead, onClose, openDemoManager, openBuildDemo, openActivities, startEdit, deleteLead, isAdmin }) {
  if (!lead) return null
  const stage = lead.status || 'Research'
  const websiteTone = ['No website','Likely no/weak site','Social-only'].includes(lead.website_status) ? 'warning' : lead.website_status === 'Website found' ? 'success' : 'neutral'
  const priorityTone = lead.priority === 'A' || lead.priority === 'A+' ? 'success' : lead.priority === 'C' ? 'warning' : 'neutral'

  const runAndClose = (callback) => {
    callback(lead)
    onClose()
  }

  return <Modal
    open={Boolean(lead)}
    onClose={onClose}
    className="jiraLeadModal"
    title={lead.business_name || 'Prospect details'}
    description={`${lead.city || 'Phoenix'} · ${lead.category || 'Automotive'}`}
    footer={<>
      <Button variant="secondary" icon={X} onClick={onClose}>Close</Button>
      <Button icon={Pencil} onClick={()=>runAndClose(startEdit)}>Edit Prospect</Button>
    </>}
  >
    <div className="jiraLeadModalSummary">
      <div className="pipelineAvatar large">{initials(lead.business_name)}</div>
      <div>
        <div className="jiraLeadModalBadges">
          <Badge tone={statusTone(stage)} dot>{stage}</Badge>
          <Badge tone={statusTone(demoStatus)} dot>Demo: {demoStatus}</Badge>
          <Badge tone={websiteTone} dot>{lead.website_status || 'Needs verification'}</Badge>
          <Badge tone={priorityTone}>Priority {lead.priority || 'B'}</Badge>
        </div>
        <p>{lead.notes || 'No next step logged yet. Use the sections below to manage this prospect.'}</p>
      </div>
    </div>

    <div className="jiraModalSections">
      <CollapsibleSection title="Prospect details" icon={Users} defaultOpen>
        <div className="jiraDetailGrid">
          <InfoLine icon={Camera} label="Instagram" value={lead.instagram_handle || 'Not added'} href={instagramUrl(lead.instagram_handle)} />
          <InfoLine icon={Phone} label="Phone" value={lead.phone || 'Not added'} href={lead.phone ? `tel:${lead.phone}` : ''} />
          <InfoLine icon={Mail} label="Email" value={lead.email || 'Not added'} href={lead.email ? `mailto:${lead.email}` : ''} />
          <InfoLine icon={Star} label="Reviews" value={lead.google_reviews ? `${lead.google_rating || '—'} · ${lead.google_reviews}` : 'Not added'} />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Pipeline" icon={LayoutDashboard} defaultOpen>
        <label className="jiraFieldLabel">
          Stage
          <select value={stage} onChange={e=>updateLead(lead.id, { status: e.target.value })}>{pipelineStages.map(x=><option key={x}>{x}</option>)}</select>
        </label>
      </CollapsibleSection>

      <CollapsibleSection title="Demo website" icon={Monitor}>
        <p>Open the Demo Manager to update preview URL, live URL, GitHub repo, hosting provider, status, and revision notes.</p>
        <Button variant="secondary" icon={Monitor} onClick={()=>runAndClose(openDemoManager)}>Open Demo Manager</Button>
      </CollapsibleSection>

      <CollapsibleSection title="Build demo website" icon={Rocket}>
        <p>Use the guided demo builder to generate the website brief and starter template for this prospect.</p>
        <Button variant="secondary" icon={Rocket} onClick={()=>runAndClose(openBuildDemo)}>Build Demo Website</Button>
      </CollapsibleSection>

      <CollapsibleSection title="Activity notes" icon={MessageSquare}>
        <p>Log DMs, calls, meetings, follow-ups, and internal notes for this prospect.</p>
        <Button variant="secondary" icon={MessageSquare} onClick={()=>runAndClose(openActivities)}>Open Activity Notes</Button>
      </CollapsibleSection>

      <CollapsibleSection title="Edit / admin" icon={Pencil}>
        <div className="jiraModalActionRow">
          <Button variant="secondary" icon={Pencil} onClick={()=>runAndClose(startEdit)}>Edit Prospect</Button>
          {isAdmin ? <Button variant="danger" icon={Trash2} onClick={()=>{ deleteLead(lead.id); onClose() }}>Delete Prospect</Button> : null}
        </div>
      </CollapsibleSection>
    </div>
  </Modal>
}

function CollapsibleSection({ title, icon: Icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return <section className={`jiraAccordion ${open ? 'open' : ''}`}>
    <button type="button" className="jiraAccordionHeader" onClick={()=>setOpen(value=>!value)}>
      <span>{Icon ? <Icon size={16}/> : null}{title}</span>
      <ChevronDown size={16}/>
    </button>
    {open ? <div className="jiraAccordionBody">{children}</div> : null}
  </section>
}

function stageLeadDescription(stage) {
  const descriptions = {
    Research: 'Need qualifying',
    'Demo Built': 'Ready to review',
    'DM Sent': 'Waiting for reply',
    'Follow-up': 'Needs touchpoint',
    Meeting: 'Conversation booked',
    Proposal: 'Quote sent',
    Won: 'Closed client',
    Lost: 'Archived'
  }
  return descriptions[stage] || 'Pipeline stage'
}


function TableView({ filtered, updateLead, pipelineStages, openActivities, openDemoManager, openBuildDemo, startEdit, deleteLead, isAdmin }) {
  return <table>
    <thead><tr><th>Business</th><th>IG</th><th>Category</th><th>Website</th><th>Priority</th><th>Status</th><th>Notes</th><th>Activity</th><th>Actions</th></tr></thead>
    <tbody>{filtered.map(l=><tr key={l.id}>
      <td><strong>{l.business_name}</strong><small>{l.city}</small></td>
      <td>{l.instagram_handle}</td><td>{l.category}</td>
      <td>{l.website_url ? <a href={l.website_url} target="_blank" rel="noreferrer">{l.website_status} <ExternalLink size={12}/></a> : l.website_status}</td>
      <td><select value={l.priority || 'B'} onChange={e=>updateLead(l.id,{priority:e.target.value})}>{priorities.map(x=><option key={x}>{x}</option>)}</select></td>
      <td><select value={l.status || 'Research'} onChange={e=>updateLead(l.id,{status:e.target.value})}>{pipelineStages.map(x=><option key={x}>{x}</option>)}</select></td>
      <td>{l.notes}</td>
      <td><button className="secondaryBtn compactBtn" onClick={()=>openActivities(l)}><MessageSquare size={14}/> Log</button></td>
      <td><div className="rowActions"><button className="iconBtn" onClick={()=>openDemoManager(l)} title="Demo website"><Monitor size={15}/></button><button className="iconBtn" onClick={()=>openBuildDemo(l)} title="Build demo website"><Rocket size={15}/></button><button className="iconBtn" onClick={()=>openActivities(l)} title="Activity notes"><MessageSquare size={15}/></button><button className="iconBtn" onClick={()=>startEdit(l)} title="Edit prospect"><Pencil size={15}/></button>{isAdmin && <button className="iconBtn dangerBtn" onClick={()=>deleteLead(l.id)} title="Delete prospect"><Trash2 size={15}/></button>}</div></td>
    </tr>)}</tbody>
  </table>
}
