import { LayoutDashboard, Users, Monitor } from 'lucide-react'

export default function DashboardView({ leads, noWebsite, demos, mrr, pipelineStages, pipelineCounts, setNav }) {
  return <>
    <section className="stats">
      <div><span>Total Leads</span><strong>{leads.length}</strong></div>
      <div><span>No/Weak Website</span><strong>{noWebsite}</strong></div>
      <div><span>Demos/Pipeline</span><strong>{demos}</strong></div>
      <div><span>Projected MRR</span><strong>${mrr}</strong></div>
    </section>
    <main className="dashboardGrid">
      <section className="card dashboardPanel">
        <div className="sectionTitle"><h2>Today’s Command Center</h2><p>Quick snapshot of your agency pipeline.</p></div>
        <div className="dashboardMetrics">
          {pipelineStages.map(stage => <div key={stage}><span>{stage}</span><strong>{pipelineCounts[stage] || 0}</strong></div>)}
        </div>
      </section>
      <section className="card dashboardPanel">
        <div className="sectionTitle"><h2>Next best workflow</h2><p>Use the left navigation to move between the CRM modules.</p></div>
        <div className="emptyStateList">
          <button onClick={()=>setNav('Pipeline')}><LayoutDashboard size={16}/> Open Kanban Pipeline</button>
          <button onClick={()=>setNav('Prospects')}><Users size={16}/> Review Prospect Table</button>
          <button onClick={()=>setNav('Demo Websites')}><Monitor size={16}/> Manage Demo Websites</button>
        </div>
      </section>
    </main>
  </>
}
