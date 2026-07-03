import { Download, Monitor, Rocket, Save, X } from 'lucide-react'
import { leadCategories } from '../../constants'

const styleOptions = ['Modern / clean','Luxury / premium','Bold performance','Minimal black & white','Friendly local business','Instagram portfolio style']

export default function BuildDemoModal(props) {
  const { buildLead, buildForm, setBuildForm, buildBrief, setBuildBrief, generatedSiteCopy, generatedSiteHtml, buildSaving, generateDemoBrief, generateTemplateSite, downloadGeneratedHtml, saveBuildDemo, slugify, onClose } = props
  if (!buildLead) return null

  return <div className="modalBackdrop" onMouseDown={e=>{ if (e.target.className === 'modalBackdrop') onClose() }}>
    <form className="editModal buildDemoModal" onSubmit={saveBuildDemo}>
      <div className="modalHeader">
        <div><span className="eyebrow">V2 template generator</span><h2>Build Demo Website</h2><p>{buildLead.business_name}</p></div>
        <button type="button" className="iconBtn" onClick={onClose}><X size={18}/></button>
      </div>
      <div className="buildDemoGrid">
        <section className="buildDemoForm">
          <h3>Demo inputs</h3>
          <p>Choose a niche template, generate the page copy, and download a starter index.html for the demo site.</p>
          <label>Template<select value={buildForm.template} onChange={e=>setBuildForm({...buildForm, template:e.target.value})}>{leadCategories.map(x=><option key={x}>{x}</option>)}</select></label>
          <label>Style direction<select value={buildForm.style} onChange={e=>setBuildForm({...buildForm, style:e.target.value})}>{styleOptions.map(x=><option key={x}>{x}</option>)}</select></label>
          <label>Services / packages to feature<textarea placeholder="Example: Full detail, ceramic coating, paint correction, maintenance wash..." value={buildForm.services} onChange={e=>setBuildForm({...buildForm, services:e.target.value})}></textarea></label>
          <label>Photo / content notes<textarea placeholder="Example: Use IG photos later, placeholder hero for now, include before/after gallery..." value={buildForm.photos} onChange={e=>setBuildForm({...buildForm, photos:e.target.value})}></textarea></label>
          <label>Extra build notes<textarea placeholder="Anything specific you want included in this demo?" value={buildForm.notes} onChange={e=>setBuildForm({...buildForm, notes:e.target.value})}></textarea></label>
          <div className="modalActions inlineActions">
            <button type="button" className="secondaryBtn" onClick={()=>setBuildBrief(generateDemoBrief())}><Rocket size={16}/> Generate brief</button>
            <button type="button" className="secondaryBtn" onClick={generateTemplateSite}><Monitor size={16}/> Generate site</button>
            <button type="button" className="secondaryBtn" onClick={downloadGeneratedHtml} disabled={!buildLead}><Download size={16}/> Download index.html</button>
            <button type="submit" disabled={buildSaving}><Save size={16}/> {buildSaving ? 'Saving...' : 'Save as Building'}</button>
          </div>
        </section>
        <aside className="buildDemoPreview">
          <h3>Generated output</h3>
          <p>The brief and generated copy save to Demo Manager. Download exports the static starter file.</p>
          <div className="builderTabs"><button type="button" className="active">Brief</button><button type="button" onClick={generateTemplateSite}>Refresh generated site</button></div>
          <textarea value={buildBrief || generateDemoBrief()} onChange={e=>setBuildBrief(e.target.value)}></textarea>
          {generatedSiteCopy && <div className="generatedCopy"><h4>Homepage copy generated</h4><pre>{generatedSiteCopy}</pre></div>}
          {generatedSiteHtml && <div className="generatedHtmlBox"><h4>Starter index.html ready</h4><p>{slugify(buildLead?.business_name)}-index.html</p><button type="button" className="secondaryBtn" onClick={downloadGeneratedHtml}><Download size={16}/> Download HTML</button></div>}
        </aside>
      </div>
    </form>
  </div>
}
