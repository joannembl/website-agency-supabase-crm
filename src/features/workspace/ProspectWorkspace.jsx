import { useEffect, useMemo, useState } from 'react'
import {
  BadgeDollarSign,
  CalendarClock,
  Camera,
  CheckCircle2,
  ExternalLink,
  FileText,
  Globe2,
  LayoutDashboard,
  Mail,
  MapPin,
  MessageSquare,
  Monitor,
  Pencil,
  Phone,
  Rocket,
  Star,
  UserRound,
  Users
} from 'lucide-react'
import Button from '../../components/ui/Button'
import Badge, { statusTone } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import { followUpTone, getFollowUpLabel } from '../leads/leadService'
import { fetchActivities, formatActivityDate } from '../activities/activityService'
import { fetchDemoByLead } from '../demos/demoService'
import { taskDueLabel, taskTone } from '../tasks/taskService'
import { EntityWorkspace, WorkspaceSidebar, WorkspaceTimeline } from './index'

export default function ProspectWorkspace({
  lead,
  activeTeamId,
  tasks = [],
  pipelineStages = [],
  demoStatusForLead,
  updateLead,
  onBack,
  openDemoManager,
  openBuildDemo,
  openActivities,
  startEdit,
  setShowTaskModal,
  setTaskForm,
  blankTask
}) {
  const [activities, setActivities] = useState([])
  const [demo, setDemo] = useState(null)
  const [loading, setLoading] = useState(false)

  const leadTasks = useMemo(() => tasks.filter(task => task.lead_id === lead?.id), [tasks, lead?.id])
  const openTasks = leadTasks.filter(task => task.status !== 'completed')
  const demoStatus = lead ? demoStatusForLead(lead) : 'Not Started'

  useEffect(() => {
    let cancelled = false
    async function loadWorkspaceData() {
      if (!lead?.id || !activeTeamId) return
      setLoading(true)
      try {
        const [activityRows, demoRecord] = await Promise.all([
          fetchActivities({ leadId: lead.id, teamId: activeTeamId }),
          fetchDemoByLead({ leadId: lead.id })
        ])
        if (!cancelled) {
          setActivities(activityRows || [])
          setDemo(demoRecord || null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadWorkspaceData()
    return () => { cancelled = true }
  }, [lead?.id, activeTeamId])

  if (!lead) return null

  const stage = lead.status || 'Research'
  const revenuePotential = stage === 'Won' ? '$99/mo active' : '$99/mo potential'

  function createLinkedTask() {
    if (!setShowTaskModal || !setTaskForm) return
    setTaskForm({
      ...(blankTask || {}),
      title: `Follow up with ${lead.business_name || 'prospect'}`,
      task_type: 'Follow-up',
      priority: lead.priority === 'A' || lead.priority === 'A+' ? 'High' : 'Medium',
      lead_id: lead.id
    })
    setShowTaskModal(true)
  }

  const tabs = [
    { id: 'overview', label: 'Overview', render: () => <OverviewTab lead={lead} demoStatus={demoStatus} stage={stage} updateLead={updateLead} pipelineStages={pipelineStages} openDemoManager={openDemoManager} openBuildDemo={openBuildDemo} createLinkedTask={createLinkedTask} /> },
    { id: 'activity', label: 'Activity', render: () => <ActivityTab activities={activities} loading={loading} openActivities={() => openActivities(lead)} /> },
    { id: 'demo', label: 'Demo', render: () => <DemoTab lead={lead} demo={demo} demoStatus={demoStatus} openDemoManager={openDemoManager} openBuildDemo={openBuildDemo} /> },
    { id: 'follow-ups', label: 'Follow-ups', render: () => <FollowUpsTab lead={lead} updateLead={updateLead} startEdit={startEdit} /> },
    { id: 'tasks', label: 'Tasks', render: () => <TasksTab tasks={leadTasks} openTasks={openTasks} createLinkedTask={createLinkedTask} /> },
    { id: 'proposal', label: 'Proposal', render: () => <ProposalTab lead={lead} /> },
    { id: 'files', label: 'Files', render: () => <FilesTab /> }
  ]

  const sidebar = <WorkspaceSidebar sections={[
    {
      title: 'Quick details',
      items: [
        { icon: LayoutDashboard, label: 'Pipeline', value: stage },
        { icon: Monitor, label: 'Demo', value: demoStatus },
        { icon: CalendarClock, label: 'Follow-up', value: getFollowUpLabel(lead) },
        { icon: BadgeDollarSign, label: 'Revenue', value: revenuePotential },
        { icon: UserRound, label: 'Assigned', value: lead.assigned_to || 'Unassigned' }
      ]
    },
    {
      title: 'Contact',
      items: [
        { icon: Camera, label: 'Instagram', value: lead.instagram_handle || 'Not added', href: instagramUrl(lead.instagram_handle) },
        { icon: Phone, label: 'Phone', value: lead.phone || 'Not added', href: lead.phone ? `tel:${lead.phone}` : '' },
        { icon: Mail, label: 'Email', value: lead.email || 'Not added', href: lead.email ? `mailto:${lead.email}` : '' },
        { icon: Globe2, label: 'Website', value: lead.website_url || lead.website_status || 'Not added', href: lead.website_url }
      ]
    }
  ]} />

  return <EntityWorkspace
    entity={lead}
    entityType="prospect"
    title={lead.business_name || 'Untitled Prospect'}
    subtitle={`${lead.city || 'Phoenix'} · ${lead.category || 'Automotive'}`}
    eyebrow="Prospect workspace"
    avatar={initials(lead.business_name)}
    onBack={onBack}
    backLabel="Back"
    actions={<>
      <Button variant="secondary" icon={MessageSquare} onClick={() => openActivities(lead)}>Log Activity</Button>
      <Button variant="secondary" icon={Rocket} onClick={() => openBuildDemo(lead)}>Build Demo</Button>
      <Button icon={Pencil} onClick={() => startEdit(lead)}>Edit</Button>
    </>}
    statusBadges={[
      { label: stage, tone: statusTone(stage), dot: true },
      { label: `Demo: ${demoStatus}`, tone: statusTone(demoStatus), dot: true },
      { label: getFollowUpLabel(lead), tone: followUpTone(lead), dot: true },
      { label: `Priority ${lead.priority || 'B'}`, tone: lead.priority === 'A' || lead.priority === 'A+' ? 'success' : 'neutral' },
      { label: revenuePotential, tone: 'info' }
    ]}
    tabs={tabs}
    sidebar={sidebar}
  />
}

function OverviewTab({ lead, demoStatus, stage, updateLead, pipelineStages, openDemoManager, openBuildDemo, createLinkedTask }) {
  return <div className="workspaceStack">
    <Card className="workspaceSectionCard">
      <div className="workspaceSectionHeader"><div><h2>Overview</h2><p>Core prospect information and next steps.</p></div></div>
      <div className="workspaceInfoGrid">
        <InfoTile icon={Users} label="Business" value={lead.business_name || 'Untitled Prospect'} />
        <InfoTile icon={MapPin} label="Market" value={`${lead.city || 'Phoenix'} · ${lead.category || 'Automotive'}`} />
        <InfoTile icon={Star} label="Reviews" value={lead.google_reviews ? `${lead.google_rating || '—'} · ${lead.google_reviews}` : 'Not added'} />
        <InfoTile icon={Globe2} label="Website Status" value={lead.website_status || 'Needs verification'} />
      </div>
    </Card>

    <Card className="workspaceSectionCard">
      <div className="workspaceSectionHeader"><div><h2>Pipeline & next action</h2><p>Update where this prospect sits in the sales workflow.</p></div></div>
      <div className="workspaceActionGrid">
        <label className="workspaceField">Stage<select value={stage} onChange={e => updateLead(lead.id, { status: e.target.value })}>{pipelineStages.map(item => <option key={item}>{item}</option>)}</select></label>
        <div className="workspaceNextStep"><span>Next step</span><p>{lead.follow_up_note || lead.notes || 'No next step logged yet.'}</p></div>
      </div>
      <div className="workspaceButtonRow">
        <Button variant="secondary" icon={Monitor} onClick={() => openDemoManager(lead)}>Manage Demo</Button>
        <Button variant="secondary" icon={Rocket} onClick={() => openBuildDemo(lead)}>Build Demo</Button>
        <Button variant="ghost" icon={CalendarClock} onClick={createLinkedTask}>Create Task</Button>
      </div>
    </Card>
  </div>
}

function ActivityTab({ activities, loading, openActivities }) {
  return <Card className="workspaceSectionCard">
    <div className="workspaceSectionHeader"><div><h2>Activity timeline</h2><p>DMs, calls, meetings, follow-ups, and notes.</p></div><Button variant="secondary" icon={MessageSquare} onClick={openActivities}>Log Activity</Button></div>
    <WorkspaceTimeline
      items={activities}
      loading={loading}
      emptyIcon={MessageSquare}
      emptyTitle="No activity yet"
      emptyDescription="Log your first DM, call, meeting, or note for this prospect."
      renderItem={activity => <div className="workspaceTimelineItem" key={activity.id}><div className="timelineDot" /><div><strong>{activity.activity_type || 'Note'}</strong><p>{activity.note}</p><span>{formatActivityDate(activity.created_at)}</span></div></div>}
    />
  </Card>
}

function DemoTab({ lead, demo, demoStatus, openDemoManager, openBuildDemo }) {
  return <Card className="workspaceSectionCard">
    <div className="workspaceSectionHeader"><div><h2>Demo Website</h2><p>Manage the preview site and demo-first sales asset.</p></div><Badge tone={statusTone(demoStatus)} dot>{demoStatus}</Badge></div>
    <div className="workspaceInfoGrid">
      <InfoTile icon={Monitor} label="Status" value={demo?.demo_status || demoStatus} />
      <InfoTile icon={Globe2} label="Preview URL" value={demo?.preview_url || 'Not added'} href={demo?.preview_url} />
      <InfoTile icon={ExternalLink} label="Live URL" value={demo?.live_url || 'Not live'} href={demo?.live_url} />
      <InfoTile icon={Rocket} label="Hosting" value={demo?.hosting_provider || 'Not set'} />
    </div>
    <div className="workspaceNotesBlock"><span>Preview notes</span><p>{demo?.preview_note || lead.notes || 'No demo notes added yet.'}</p></div>
    <div className="workspaceButtonRow"><Button variant="secondary" icon={Monitor} onClick={() => openDemoManager(lead)}>Open Demo Manager</Button><Button icon={Rocket} onClick={() => openBuildDemo(lead)}>Build Demo Website</Button></div>
  </Card>
}

function FollowUpsTab({ lead, updateLead, startEdit }) {
  return <Card className="workspaceSectionCard">
    <div className="workspaceSectionHeader"><div><h2>Follow-ups</h2><p>Track your next touchpoint and mark completed outreach.</p></div><Badge tone={followUpTone(lead)} dot>{getFollowUpLabel(lead)}</Badge></div>
    <div className="workspaceNotesBlock"><span>Follow-up note</span><p>{lead.follow_up_note || 'No follow-up note set.'}</p></div>
    <div className="workspaceButtonRow"><Button variant="secondary" icon={CheckCircle2} onClick={() => updateLead(lead.id, { last_contacted_at: new Date().toISOString(), next_follow_up_date: null, follow_up_note: null })}>Mark complete</Button><Button variant="ghost" icon={Pencil} onClick={() => startEdit(lead)}>Edit Follow-up</Button></div>
  </Card>
}

function TasksTab({ tasks, openTasks, createLinkedTask }) {
  return <Card className="workspaceSectionCard">
    <div className="workspaceSectionHeader"><div><h2>Tasks</h2><p>{openTasks.length} open tasks linked to this prospect.</p></div><Button icon={CalendarClock} onClick={createLinkedTask}>New Task</Button></div>
    {tasks.length === 0 ? <EmptyState icon={CalendarClock} title="No linked tasks" description="Create a task for follow-ups, demo work, proposals, or client handoff." action={<Button icon={CalendarClock} onClick={createLinkedTask}>Create Task</Button>} /> : <div className="workspaceTaskList">
      {tasks.map(task => <div className="workspaceTaskRow" key={task.id}><div><strong>{task.title}</strong><p>{task.description || taskDueLabel(task)}</p></div><Badge tone={taskTone(task)}>{task.status === 'completed' ? 'Completed' : taskDueLabel(task)}</Badge></div>)}
    </div>}
  </Card>
}

function ProposalTab({ lead }) {
  return <Card className="workspaceSectionCard">
    <div className="workspaceSectionHeader"><div><h2>Proposal</h2><p>Proposal Builder will live here in Sprint 3 Phase 2.</p></div><Badge tone="neutral">Coming next</Badge></div>
    <div className="proposalPreviewBox"><FileText size={24} /><div><strong>Generate a proposal for {lead.business_name || 'this prospect'}</strong><p>This tab is ready for package selection, pricing, agreement generation, and Stripe checkout links.</p></div></div>
  </Card>
}

function FilesTab() {
  return <Card className="workspaceSectionCard">
    <div className="workspaceSectionHeader"><div><h2>Files</h2><p>Store logos, photos, contracts, and client assets here later.</p></div><Badge tone="neutral">Planned</Badge></div>
    <EmptyState icon={FileText} title="Files module coming soon" description="This will support logos, brand assets, photos, PDFs, proposals, and contracts." />
  </Card>
}

function InfoTile({ icon: Icon, label, value, href }) {
  const content = <><Icon size={16} /><span>{label}</span><strong>{value || '—'}</strong></>
  if (href) return <a className="workspaceInfoTile" href={href} target="_blank" rel="noreferrer">{content}<ExternalLink size={14} /></a>
  return <div className="workspaceInfoTile">{content}</div>
}

function initials(value = '') {
  return value.split(' ').filter(Boolean).slice(0, 2).map(word => word[0]).join('').toUpperCase() || 'CD'
}

function instagramUrl(handle = '') {
  if (!handle) return ''
  const cleaned = handle.replace('@', '').trim()
  return cleaned ? `https://instagram.com/${cleaned}` : ''
}
