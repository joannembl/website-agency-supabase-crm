import { LayoutDashboard, Users, Monitor, DollarSign, Globe2 } from 'lucide-react'
import { Button, Card, CardHeader, EmptyState, StatCard } from '../../components/ui'

export default function DashboardView({ leads, noWebsite, demos, mrr, pipelineStages, pipelineCounts, setNav }) {
  return <>
    <section className="stats compactStats dsStatsGrid">
      <StatCard label="Total Leads" value={leads.length} icon={Users} helper="Prospects in this team" />
      <StatCard label="No/Weak Website" value={noWebsite} icon={Globe2} helper="Highest-priority leads" tone="warning" />
      <StatCard label="Demos/Pipeline" value={demos} icon={Monitor} helper="Active opportunities" tone="info" />
      <StatCard label="Projected MRR" value={`$${mrr}`} icon={DollarSign} helper="If won at current plan" tone="success" />
    </section>
    <main className="dashboardGrid">
      <Card className="dashboardPanel">
        <CardHeader title="Today’s Command Center" description="Quick snapshot of your agency pipeline." />
        <div className="dashboardMetrics">
          {pipelineStages.map(stage => <div key={stage}><span>{stage}</span><strong>{pipelineCounts[stage] || 0}</strong></div>)}
        </div>
      </Card>
      <Card className="dashboardPanel">
        <CardHeader title="Next best workflow" description="Use the left navigation to move between the CRM modules." />
        <EmptyState
          icon={LayoutDashboard}
          title="Choose where to work next"
          description="Jump into prospects, pipeline, or demo websites depending on today’s priority."
          action={<div className="emptyStateList">
            <Button variant="secondary" icon={LayoutDashboard} onClick={()=>setNav('Pipeline')}>Open Kanban Pipeline</Button>
            <Button variant="secondary" icon={Users} onClick={()=>setNav('Prospects')}>Review Prospect Table</Button>
            <Button variant="secondary" icon={Monitor} onClick={()=>setNav('Demo Websites')}>Manage Demo Websites</Button>
          </div>}
        />
      </Card>
    </main>
  </>
}
