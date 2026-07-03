import { LayoutDashboard, Users, Monitor, DollarSign, Globe2, ArrowRight, ClipboardList } from 'lucide-react'
import { Button, Card, CardHeader, EmptyState, PageHeader, StatCard, Badge } from '../../components/ui'
import { PageLayout, PageStats, PageContent } from '../../layout'

export default function DashboardView({ leads, noWebsite, demos, mrr, pipelineStages, pipelineCounts, setNav }) {
  const won = leads.filter(l => l.status === 'Won').length
  const ready = leads.filter(l => ['Demo Built','DM Sent','Follow-up','Meeting','Proposal'].includes(l.status)).length
  const activePipeline = pipelineStages.filter(stage => !['Won','Lost'].includes(stage))

  return <PageLayout className="dashboardPage saasDashboardPage">
    <PageHeader
      eyebrow="Command center"
      title="Dashboard"
      description="A clean snapshot of your prospects, demo websites, pipeline movement, and projected recurring revenue."
      actions={<>
        <Button variant="secondary" icon={Users} onClick={()=>setNav('Prospects')}>Review prospects</Button>
        <Button icon={LayoutDashboard} onClick={()=>setNav('Pipeline')}>Open pipeline</Button>
      </>}
      meta={<>
        <Badge tone="info" dot>{leads.length} prospects</Badge>
        <Badge tone="purple" dot>{demos} demo opportunities</Badge>
        <Badge tone="success" dot>{won} won</Badge>
      </>}
    />

    <PageStats className="dashboardStatsGrid dsStatsGrid">
      <StatCard label="Total Prospects" value={leads.length} icon={Users} helper="Businesses in your CRM" />
      <StatCard label="No / Weak Website" value={noWebsite} icon={Globe2} helper="Best demo-first targets" tone="warning" />
      <StatCard label="Demo Opportunities" value={demos} icon={Monitor} helper="Built, sent, or in progress" tone="info" />
      <StatCard label="Projected MRR" value={`$${mrr}`} icon={DollarSign} helper="Won clients at current plan" tone="success" />
    </PageStats>

    <PageContent className="dashboardGrid saasDashboardGrid">
      <Card className="dashboardPanel pipelineSnapshotPanel">
        <CardHeader title="Pipeline snapshot" description="Where prospects are sitting right now." action={<Button variant="ghost" size="sm" onClick={()=>setNav('Pipeline')}>View board <ArrowRight size={15}/></Button>} />
        <div className="dashboardPipelineBars">
          {activePipeline.map(stage => {
            const count = pipelineCounts[stage] || 0
            const width = leads.length ? Math.max(6, Math.round((count / leads.length) * 100)) : 0
            return <div className="pipelineBarRow" key={stage}>
              <div className="pipelineBarMeta"><span>{stage}</span><strong>{count}</strong></div>
              <div className="pipelineBarTrack"><span style={{ width: `${width}%` }} /></div>
            </div>
          })}
        </div>
      </Card>

      <Card className="dashboardPanel nextActionsPanel">
        <CardHeader title="Next best workflow" description="Start with the action that creates the most sales momentum." />
        <div className="nextActionList">
          <button type="button" onClick={()=>setNav('Prospects')}>
            <Users size={18}/>
            <span><strong>Qualify prospects</strong><small>Find no-website businesses and add priority notes.</small></span>
            <ArrowRight size={16}/>
          </button>
          <button type="button" onClick={()=>setNav('Demo Websites')}>
            <Monitor size={18}/>
            <span><strong>Build or update demos</strong><small>Prepare demo previews before outreach.</small></span>
            <ArrowRight size={16}/>
          </button>
          <button type="button" onClick={()=>setNav('Pipeline')}>
            <ClipboardList size={18}/>
            <span><strong>Move the pipeline</strong><small>Drag cards and follow up with warm leads.</small></span>
            <ArrowRight size={16}/>
          </button>
        </div>
      </Card>

      <Card className="dashboardPanel dashboardWidePanel">
        <CardHeader title="Sprint 2 placeholder" description="This space is ready for follow-ups, tasks, and today's priorities next." />
        <EmptyState
          icon={LayoutDashboard}
          title="Daily workflow coming next"
          description="The shell is now standardized so follow-ups, tasks, and the daily dashboard can plug into a consistent layout."
        />
      </Card>
    </PageContent>
  </PageLayout>
}
