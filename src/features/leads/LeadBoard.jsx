import { ExternalLink, Download, LayoutDashboard, Table2, ChevronRight, ChevronLeft, GripVertical, MessageSquare, Monitor, Rocket, Pencil, Trash2, Plus, Users, Globe2, BadgeDollarSign, Clock3, Camera, Phone, Mail, MapPin, Star, Filter, Sparkles } from 'lucide-react'
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

  return <PipelineView {...{
    leads, noWebsite, demos, mrr, query, setQuery, status, setStatus, category, setCategory,
    pipelineStages, viewMode, setView, setShowAddModal, exportCsv, draggingLeadId, setDraggingLeadId,
    handleDragStart, handleDrop, pipelineCounts, filtered, demoStatusForLead, updateLead,
    openDemoManager, openBuildDemo, openActivities, startEdit, deleteLead, isAdmin
  }} />
}


function PipelineView({ leads, noWebsite, demos, mrr, query, setQuery, status, setStatus, category, setCategory, pipelineStages, viewMode, setView, setShowAddModal, exportCsv, draggingLeadId, setDraggingLeadId, handleDragStart, handleDrop, pipelineCounts, filtered, demoStatusForLead, updateLead, openDemoManager, openBuildDemo, openActivities, startEdit, deleteLead, isAdmin }) {
  const activePipelineCount = filtered.filter(l => !['Won','Lost'].includes(l.status || 'Research')).length
  const readyDemoCount = filtered.filter(l => ['Ready','Demo Ready','Sent','Live'].includes(demoStatusForLead(l))).length
  const proposalCount = filtered.filter(l => (l.status || '') === 'Proposal').length
  const wonCount = leads.filter(l => l.status === 'Won').length

  return <main className="pipelinePage">
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

    <section className="pipelineStatsGrid">
      <StatCard label="Active Pipeline" value={activePipelineCount} helper="Open prospects" icon={LayoutDashboard} tone="info" />
      <StatCard label="No/Weak Website" value={noWebsite} helper="Best demo candidates" icon={Globe2} tone="warning" />
      <StatCard label="Proposals" value={proposalCount} helper="Close-ready leads" icon={BadgeDollarSign} tone="purple" />
      <StatCard label="Projected MRR" value={`$${mrr}`} helper="$99/mo won leads" icon={BadgeDollarSign} tone="success" />
    </section>

    <Card className="pipelineToolbarCard">
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
    </Card>

    <Card className="pipelineBoardShell">
      {viewMode === 'kanban'
        ? <KanbanView {...{ pipelineStages, draggingLeadId, handleDrop, pipelineCounts, filtered, setDraggingLeadId, handleDragStart, demoStatusForLead, updateLead, openDemoManager, openBuildDemo, openActivities, startEdit, deleteLead, isAdmin }} />
        : <TableView {...{ filtered, updateLead, pipelineStages, openActivities, openDemoManager, openBuildDemo, startEdit, deleteLead, isAdmin }} />}
    </Card>
  </main>
}

function ProspectsView({ leads, noWebsite, demos, mrr, query, setQuery, status, setStatus, category, setCategory, pipelineStages, setShowAddModal, exportCsv, filtered, demoStatusForLead, updateLead, openDemoManager, openBuildDemo, openActivities, startEdit, deleteLead, isAdmin }) {
  const wonCount = leads.filter(l => l.status === 'Won').length
  const socialOnlyCount = leads.filter(l => ['No website','Likely no/weak site','Social-only'].includes(l.website_status)).length
  const highPriorityCount = leads.filter(l => ['A','A+'].includes(l.priority)).length

  return <main className="prospectsPage">
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

    <section className="prospectStatsGrid">
      <StatCard label="Total Prospects" value={leads.length} helper="All team leads" icon={Users} />
      <StatCard label="No/Weak Website" value={noWebsite} helper="Best demo candidates" icon={Globe2} tone="warning" />
      <StatCard label="Demo Pipeline" value={demos} helper="Built, sent, proposal, or won" icon={Sparkles} tone="info" />
      <StatCard label="Projected MRR" value={`$${mrr}`} helper="Based on $99/mo won leads" icon={BadgeDollarSign} tone="success" />
    </section>

    <Card className="prospectsToolbarCard">
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
    </Card>

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
  </main>
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
  return <div className="pipelineKanbanBoard">
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
            openDemoManager={openDemoManager}
            openBuildDemo={openBuildDemo}
            openActivities={openActivities}
            startEdit={startEdit}
            deleteLead={deleteLead}
            isAdmin={isAdmin}
          />)}
        </div>
      </section>
    })}
  </div>
}

function PipelineCard({ lead, stageIndex, pipelineStages, draggingLeadId, setDraggingLeadId, handleDragStart, demoStatus, updateLead, openDemoManager, openBuildDemo, openActivities, startEdit, deleteLead, isAdmin }) {
  const stage = lead.status || 'Research'
  const websiteTone = ['No website','Likely no/weak site','Social-only'].includes(lead.website_status) ? 'warning' : lead.website_status === 'Website found' ? 'success' : 'neutral'
  const priorityTone = lead.priority === 'A' || lead.priority === 'A+' ? 'success' : lead.priority === 'C' ? 'warning' : 'neutral'

  return <article className={`pipelineLeadCard ${draggingLeadId === lead.id ? 'dragging' : ''}`} draggable onDragStart={e=>handleDragStart(e, lead.id)} onDragEnd={()=>setDraggingLeadId(null)}>
    <div className="pipelineCardTop">
      <div className="dragHandle" title="Drag to another stage"><GripVertical size={16}/></div>
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

    <div className="pipelineCardDetails">
      <span><Camera size={13}/>{lead.instagram_handle || 'No Instagram'}</span>
      {lead.phone ? <span><Phone size={13}/>{lead.phone}</span> : null}
      {lead.google_reviews ? <span><Star size={13}/>{lead.google_rating || '—'} · {lead.google_reviews} reviews</span> : null}
    </div>

    {lead.notes ? <p className="pipelineCardNote">{lead.notes}</p> : <p className="pipelineCardNote muted">No next step logged yet.</p>}

    <div className="pipelineCardActions">
      <Button size="sm" variant="ghost" disabled={stageIndex === 0} onClick={()=>updateLead(lead.id,{status:pipelineStages[stageIndex-1]})} title="Move back" icon={ChevronLeft}>Back</Button>
      <div className="pipelineQuickActions">
        <button type="button" onClick={()=>openDemoManager(lead)} title="Demo website"><Monitor size={15}/></button>
        <button type="button" onClick={()=>openBuildDemo(lead)} title="Build demo"><Rocket size={15}/></button>
        <button type="button" onClick={()=>openActivities(lead)} title="Activity"><MessageSquare size={15}/></button>
        <button type="button" onClick={()=>startEdit(lead)} title="Edit"><Pencil size={15}/></button>
        {isAdmin ? <button type="button" className="danger" onClick={()=>deleteLead(lead.id)} title="Delete"><Trash2 size={15}/></button> : null}
      </div>
      <Button size="sm" variant="ghost" disabled={stageIndex === pipelineStages.length - 1} onClick={()=>updateLead(lead.id,{status:pipelineStages[stageIndex+1]})} title="Move forward">Next <ChevronRight size={15}/></Button>
    </div>
  </article>
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
