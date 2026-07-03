import { ExternalLink, Link2, MessageSquare, Monitor, Rocket, Save, X } from 'lucide-react'
import { demoStatuses } from '../../constants'

export default function DemoManagerModal(props) {
  const { demoLead, demoForm, setDemoForm, demoDirty, demoSaving, saveDemo, requestCloseDemoManager, markDemoSent, markDemoLive } = props
  if (!demoLead) return null

  return <div className="modalBackdrop" onMouseDown={e=>{ if (e.target.className === 'modalBackdrop') requestCloseDemoManager() }}>
    <form className="editModal demoManagerModal" onSubmit={saveDemo}>
      <div className="modalHeader demoHeader">
        <div><span className="eyebrow">Demo Website Manager</span><h2>{demoLead.business_name}</h2><p>Track the demo site from build to launch.</p></div>
        <button type="button" className="iconBtn" onClick={requestCloseDemoManager}><X size={18}/></button>
      </div>
      <div className="demoManagerGrid">
        <div className="demoMainPanel">
          <section className="demoStatusPanel">
            <h3>Demo workflow</h3>
            <div className="demoStatusSteps">{demoStatuses.map(status=><button type="button" key={status} className={demoForm.demo_status === status ? 'active' : ''} onClick={()=>setDemoForm({...demoForm, demo_status: status})}>{status}</button>)}</div>
          </section>

          <section className="demoFieldsPanel">
            <h3>Links and notes</h3>
            <div className="editGrid">
              <label>Preview/demo URL<input placeholder="https://demo-site.netlify.app" value={demoForm.demo_url || ''} onChange={e=>setDemoForm({...demoForm,demo_url:e.target.value})}/></label>
              <label>Live URL<input placeholder="https://clientdomain.com" value={demoForm.live_url || ''} onChange={e=>setDemoForm({...demoForm,live_url:e.target.value})}/></label>
              <label>GitHub repo<input placeholder="https://github.com/..." value={demoForm.github_repo || ''} onChange={e=>setDemoForm({...demoForm,github_repo:e.target.value})}/></label>
              <label>Hosting provider<select value={demoForm.hosting_provider || 'Netlify'} onChange={e=>setDemoForm({...demoForm,hosting_provider:e.target.value})}>{['Netlify','Cloudflare Pages','GitHub Pages','Vercel','Other'].map(x=><option key={x}>{x}</option>)}</select></label>
              <label>Deploy status<input placeholder="Building, Ready, Live..." value={demoForm.deploy_status || ''} onChange={e=>setDemoForm({...demoForm,deploy_status:e.target.value})}/></label>
              <label>Demo status<select value={demoForm.demo_status || 'Not Started'} onChange={e=>setDemoForm({...demoForm,demo_status:e.target.value})}>{demoStatuses.map(x=><option key={x}>{x}</option>)}</select></label>
              <label className="fullWidth">Preview notes<textarea placeholder="What still needs to be changed before sending?" value={demoForm.preview_note || ''} onChange={e=>setDemoForm({...demoForm,preview_note:e.target.value})}/></label>
              <label className="fullWidth">Client feedback / revision notes<textarea placeholder="Owner feedback, requested changes, launch notes..." value={demoForm.feedback || ''} onChange={e=>setDemoForm({...demoForm,feedback:e.target.value})}/></label>
              <div className="fullWidth inlineSaveRow"><button type="button" className="secondaryBtn" disabled={!demoDirty || demoSaving} onClick={saveDemo}><Save size={16}/> {demoSaving ? 'Saving...' : 'Save notes'}</button><span>{demoDirty ? 'Unsaved changes' : 'All demo changes saved'} · Cmd/Ctrl + S</span></div>
            </div>
          </section>
        </div>

        <aside className="demoSidePanel">
          <h3>Quick actions</h3>
          <p>Use these as the demo moves through your sales workflow.</p>
          <div className="demoQuickActions">
            {demoForm.demo_url && <a className="secondaryBtn" href={demoForm.demo_url} target="_blank" rel="noreferrer"><ExternalLink size={16}/> Open demo</a>}
            {demoForm.github_repo && <a className="secondaryBtn" href={demoForm.github_repo} target="_blank" rel="noreferrer"><Link2 size={16}/> Open repo</a>}
            <button type="button" className="secondaryBtn" onClick={()=>setDemoForm({...demoForm, demo_status:'Ready', deploy_status: demoForm.deploy_status || 'Ready to send'})}><Rocket size={16}/> Mark ready</button>
            <button type="button" className="secondaryBtn" onClick={markDemoSent}><MessageSquare size={16}/> Mark sent</button>
            <button type="button" className="secondaryBtn" onClick={markDemoLive}><Monitor size={16}/> Mark live</button>
          </div>
          <div className="demoChecklist"><strong>Launch checklist</strong><span>□ Demo link saved</span><span>□ Real photos/content added</span><span>□ Sent to prospect</span><span>□ Revisions completed</span><span>□ Domain/live URL saved</span></div>
        </aside>
      </div>
      <div className="modalActions"><button type="button" className="secondaryBtn" onClick={requestCloseDemoManager}>Close</button><button type="submit" disabled={!demoDirty || demoSaving}><Save size={16}/> {demoSaving ? 'Saving...' : 'Save demo details'}</button></div>
    </form>
  </div>
}
