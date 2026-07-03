import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock3,
  CalendarDays,
  AlertTriangle,
  DollarSign,
  Globe2,
  LayoutDashboard,
  Monitor,
  Plus,
  Rocket,
  Target,
  Users
} from 'lucide-react'
import { Button, Card, CardHeader, EmptyState, StatCard, Badge } from '../../components/ui'
import { PageLayout, PageStats, PageContent } from '../../layout'
import { followUpTone, getFollowUpLabel, getFollowUpStatus } from '../leads/leadService'
import { getTaskDueStatus, taskDueLabel, taskTone } from '../tasks/taskService'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function leadLabel(lead) {
  return lead?.business_name || lead?.instagram_handle || 'Untitled prospect'
}

export default function DashboardView({ leads, tasks = [], noWebsite, demos, mrr, pipelineStages, pipelineCounts, setNav }) {
  const won = leads.filter(l => l.status === 'Won').length
  const proposalCount = leads.filter(l => ['Proposal', 'Meeting'].includes(l.status)).length
  const demoLeads = leads.filter(l => ['Demo Built','DM Sent','Follow-up','Meeting','Proposal'].includes(l.status))
  const noWebsiteLeads = leads.filter(l => ['No website','Likely no/weak site','Social-only candidate'].includes(l.website_status))
  const activePipeline = pipelineStages.filter(stage => !['Won','Lost'].includes(stage))
  const totalActive = activePipeline.reduce((sum, stage) => sum + (pipelineCounts[stage] || 0), 0)
  const followUpLeads = leads.filter(l => getFollowUpStatus(l) !== 'none')
  const dueToday = followUpLeads.filter(l => getFollowUpStatus(l) === 'today')
  const overdue = followUpLeads.filter(l => getFollowUpStatus(l) === 'overdue')
  const upcoming = followUpLeads.filter(l => getFollowUpStatus(l) === 'upcoming')
  const sortedFollowUps = [...followUpLeads].sort((a,b)=>String(a.next_follow_up_date || '').localeCompare(String(b.next_follow_up_date || '')))
  const openTasks = tasks.filter(task => task.status !== 'completed')
  const taskDueToday = openTasks.filter(task => getTaskDueStatus(task) === 'today')
  const taskOverdue = openTasks.filter(task => getTaskDueStatus(task) === 'overdue')
  const taskUpcoming = openTasks.filter(task => getTaskDueStatus(task) === 'upcoming')
  const sortedTasks = [...openTasks].sort((a,b)=>String(a.due_date || '9999-12-31').localeCompare(String(b.due_date || '9999-12-31')))

  const focusItems = [
    ...overdue.slice(0, 2).map(lead => ({
      icon: AlertTriangle,
      title: `Follow up ${leadLabel(lead)}`,
      detail: getFollowUpLabel(lead),
      action: 'Open pipeline',
      nav: 'Pipeline',
      tone: 'danger'
    })),
    ...dueToday.slice(0, 2).map(lead => ({
      icon: CalendarDays,
      title: `${lead.follow_up_type || 'Follow up'} ${leadLabel(lead)}`,
      detail: lead.follow_up_note || 'Follow-up due today',
      action: 'Open pipeline',
      nav: 'Pipeline',
      tone: 'warning'
    })),
    ...taskOverdue.slice(0, 2).map(task => ({
      icon: Circle,
      title: task.title,
      detail: taskDueLabel(task),
      action: 'Open tasks',
      nav: 'Tasks',
      tone: 'danger'
    })),
    ...taskDueToday.slice(0, 2).map(task => ({
      icon: Circle,
      title: task.title,
      detail: task.description || taskDueLabel(task),
      action: 'Open tasks',
      nav: 'Tasks',
      tone: 'warning'
    })),
    ...noWebsiteLeads.slice(0, 2).map(lead => ({
      icon: Target,
      title: `Qualify ${leadLabel(lead)}`,
      detail: 'High-value no/weak website prospect',
      action: 'Review prospect',
      nav: 'Prospects',
      tone: 'warning'
    })),
    ...demoLeads.slice(0, 2).map(lead => ({
      icon: Monitor,
      title: `Move ${leadLabel(lead)} forward`,
      detail: `${lead.status || 'Pipeline'} stage needs next action`,
      action: 'Open pipeline',
      nav: 'Pipeline',
      tone: 'info'
    }))
  ].slice(0, 4)

  const demoProgress = leads
    .filter(l => ['Demo Built','DM Sent','Follow-up','Meeting','Proposal'].includes(l.status) || l.demo_status)
    .slice(0, 4)

  const recentActivity = leads.slice(0, 5).map((lead, index) => ({
    label: index === 0 ? 'Prospect updated' : index === 1 ? 'Pipeline checked' : 'Prospect in CRM',
    detail: leadLabel(lead),
    time: index === 0 ? 'Just now' : `${index + 1}h ago`
  }))

  return <PageLayout className="dashboardPage commandDashboardPage">
    <section className="commandHero">
      <div>
        <span className="commandEyebrow">Command center</span>
        <h1>{getGreeting()}, Jo-anne 👋</h1>
        <p>Start with the work that creates the most sales momentum today.</p>
        <div className="commandHeroMeta">
          <Badge tone="info" dot>{leads.length} prospects</Badge>
          <Badge tone="purple" dot>{demos} demo opportunities</Badge>
          <Badge tone="success" dot>{won} won</Badge>
        </div>
      </div>
      <div className="commandHeroActions">
        <Button variant="secondary" icon={Users} onClick={()=>setNav('Prospects')}>Review prospects</Button>
        <Button icon={Plus} onClick={()=>setNav('Prospects')}>Add prospect</Button>
      </div>
    </section>

    <PageStats className="dashboardStatsGrid commandStatsGrid">
      <StatCard label="Prospects" value={leads.length} icon={Users} helper="Total leads" />
      <StatCard label="Demo Sites" value={demos} icon={Monitor} helper="Built, sent, or active" tone="info" />
      <StatCard label="No / Weak Site" value={noWebsite} icon={Globe2} helper="Best targets" tone="warning" />
      <StatCard label="Follow-ups" value={dueToday.length + overdue.length} icon={CalendarDays} helper="Due or overdue" tone="warning" />
      <StatCard label="Open Tasks" value={openTasks.length} icon={Circle} helper="Team workload" tone="info" />
      <StatCard label="Pipeline Value" value={`$${mrr}`} icon={DollarSign} helper="Projected MRR" tone="success" />
    </PageStats>

    <PageContent className="commandDashboardGrid">
      <Card className="dashboardPanel todaysFocusPanel">
        <CardHeader
          title="Today's Focus"
          description="Prioritized actions based on prospects and demo momentum."
          action={<Button variant="ghost" size="sm" onClick={()=>setNav('Pipeline')}>View pipeline <ArrowRight size={15}/></Button>}
        />
        {focusItems.length ? <div className="focusList">
          {focusItems.map((item, index) => {
            const Icon = item.icon
            return <button type="button" className={`focusItem focusItem--${item.tone}`} key={`${item.title}-${index}`} onClick={()=>setNav(item.nav)}>
              <div className="focusIndex">{index + 1}</div>
              <div className="focusIcon"><Icon size={18}/></div>
              <div className="focusText">
                <strong>{item.title}</strong>
                <span>{item.detail}</span>
              </div>
              <span className="focusAction">{item.action} <ArrowRight size={15}/></span>
            </button>
          })}
        </div> : <EmptyState icon={CheckCircle2} title="Nothing urgent right now" description="Add prospects or build demos to start filling your daily focus list." />}
      </Card>

      <Card className="dashboardPanel followUpsPanel">
        <CardHeader
          title="Follow-ups"
          description={`${overdue.length} overdue · ${dueToday.length} due today · ${upcoming.length} upcoming`}
          action={<Button variant="ghost" size="sm" onClick={()=>setNav('Pipeline')}>Open board <ArrowRight size={15}/></Button>}
        />
        {sortedFollowUps.length ? <div className="followUpList">
          {sortedFollowUps.slice(0, 6).map(lead => <button type="button" key={lead.id} className={`followUpItem followUpItem--${getFollowUpStatus(lead)}`} onClick={()=>setNav('Pipeline')}>
            <div className="followUpIcon">{getFollowUpStatus(lead) === 'overdue' ? <AlertTriangle size={16}/> : <CalendarDays size={16}/>}</div>
            <div>
              <strong>{leadLabel(lead)}</strong>
              <span>{lead.follow_up_note || getFollowUpLabel(lead)}</span>
            </div>
            <Badge tone={followUpTone(lead)}>{getFollowUpLabel(lead)}</Badge>
          </button>)}
        </div> : <EmptyState icon={CalendarDays} title="No follow-ups scheduled" description="Add a follow-up date to a prospect to see it here." />}
      </Card>

      <Card className="dashboardPanel tasksSummaryPanel">
        <CardHeader
          title="Tasks"
          description={`${taskOverdue.length} overdue · ${taskDueToday.length} due today · ${taskUpcoming.length} upcoming`}
          action={<Button variant="ghost" size="sm" onClick={()=>setNav('Tasks')}>Open tasks <ArrowRight size={15}/></Button>}
        />
        {sortedTasks.length ? <div className="taskDashboardList">
          {sortedTasks.slice(0, 5).map(task => <button type="button" key={task.id} className={`taskDashboardItem taskDashboardItem--${getTaskDueStatus(task)}`} onClick={()=>setNav('Tasks')}>
            <div className="taskDashboardIcon"><Circle size={16}/></div>
            <div>
              <strong>{task.title}</strong>
              <span>{task.description || taskDueLabel(task)}</span>
            </div>
            <Badge tone={taskTone(task)}>{taskDueLabel(task)}</Badge>
          </button>)}
        </div> : <EmptyState icon={Circle} title="No open tasks" description="Create tasks for follow-ups, demos, proposals, and client work." />}
      </Card>

      <Card className="dashboardPanel quickActionsPanel">
        <CardHeader title="Quick Actions" description="Jump into the work fast." />
        <div className="quickActionGrid">
          <button type="button" onClick={()=>setNav('Prospects')}><Plus size={17}/><span>Add prospect</span></button>
          <button type="button" onClick={()=>setNav('Demo Websites')}><Monitor size={17}/><span>Build demo</span></button>
          <button type="button" onClick={()=>setNav('Pipeline')}><LayoutDashboard size={17}/><span>Open pipeline</span></button>
          <button type="button" onClick={()=>setNav('Tasks')}><Circle size={17}/><span>Tasks</span></button>
        </div>
      </Card>

      <Card className="dashboardPanel pipelineSnapshotPanel commandPipelinePanel">
        <CardHeader title="Sales Pipeline" description="Where prospects are sitting right now." action={<Button variant="ghost" size="sm" onClick={()=>setNav('Pipeline')}>Board <ArrowRight size={15}/></Button>} />
        <div className="dashboardPipelineBars commandPipelineBars">
          {activePipeline.map(stage => {
            const count = pipelineCounts[stage] || 0
            const width = totalActive ? Math.max(5, Math.round((count / totalActive) * 100)) : 0
            return <button type="button" className="pipelineBarRow commandPipelineRow" key={stage} onClick={()=>setNav('Pipeline')}>
              <div className="pipelineBarMeta"><span>{stage}</span><strong>{count}</strong></div>
              <div className="pipelineBarTrack"><span style={{ width: `${width}%` }} /></div>
            </button>
          })}
        </div>
      </Card>

      <Card className="dashboardPanel demoProgressPanel">
        <CardHeader title="Demo Progress" description="Demo-first opportunities to keep moving." action={<Button variant="ghost" size="sm" onClick={()=>setNav('Demo Websites')}>Demos <ArrowRight size={15}/></Button>} />
        {demoProgress.length ? <div className="demoProgressList">
          {demoProgress.map(lead => <button type="button" key={lead.id} onClick={()=>setNav('Demo Websites')}>
            <div>
              <strong>{leadLabel(lead)}</strong>
              <span>{lead.category || 'Website demo'}</span>
            </div>
            <Badge tone={lead.status === 'Won' ? 'success' : 'purple'}>{lead.demo_status || lead.status || 'Demo'}</Badge>
          </button>)}
        </div> : <EmptyState icon={Monitor} title="No demos in motion" description="Build a demo website for a strong no-website prospect." />}
      </Card>

      <Card className="dashboardPanel recentActivityPanel">
        <CardHeader title="Recent Activity" description="A lightweight pulse of recent CRM movement." />
        {recentActivity.length ? <div className="activityPreviewList">
          {recentActivity.map((item, index) => <div className="activityPreviewItem" key={`${item.detail}-${index}`}>
            <div className="activityPreviewIcon"><Activity size={15}/></div>
            <div>
              <strong>{item.label}</strong>
              <span>{item.detail}</span>
            </div>
            <small>{item.time}</small>
          </div>)}
        </div> : <EmptyState icon={Clock3} title="No activity yet" description="Activity will appear as you add prospects, build demos, and move the pipeline." />}
      </Card>

      <Card className="dashboardPanel revenuePanel">
        <CardHeader title="Revenue Snapshot" description="Track recurring revenue as leads become clients." />
        <div className="revenueBigNumber">${mrr}</div>
        <div className="revenueGoalRow"><span>Goal progress</span><strong>{Math.min(100, Math.round((Number(mrr || 0) / 10000) * 100))}%</strong></div>
        <div className="revenueGoalTrack"><span style={{ width: `${Math.min(100, Math.round((Number(mrr || 0) / 10000) * 100))}%` }} /></div>
        <p className="revenueHelper">Target: $10,000 MRR</p>
      </Card>
    </PageContent>
  </PageLayout>
}
