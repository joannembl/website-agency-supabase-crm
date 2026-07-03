import { UserCog } from 'lucide-react'

export default function PlaceholderModule({ activeNav, onManageTeam }) {
  return <main className="modulePlaceholder">
    <section className="card placeholderCard">
      <div className="placeholderIcon">{activeNav.slice(0,1)}</div>
      <h2>{activeNav}</h2>
      <p>This section is now reserved in the app navigation. We can build this module next without crowding the pipeline view.</p>
      {activeNav === 'Proposals' && <p>Next: generate proposals using your pricing one-pager and service agreement.</p>}
      {activeNav === 'Tasks' && <p>Next: daily follow-up dashboard with due dates and assigned users.</p>}
      {activeNav === 'Revenue' && <p>Next: MRR, setup fees, close rate, and monthly goal tracking.</p>}
      {activeNav === 'Settings' && <button className="secondaryBtn" onClick={onManageTeam}><UserCog size={16}/> Manage Team</button>}
    </section>
  </main>
}
