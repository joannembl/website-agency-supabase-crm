import { useState } from 'react'
import { Sparkles, Wand2, Download, Save, X } from 'lucide-react'
import { Button, Modal, FormField, FormGrid, HelpCallout } from '../../components/ui'
import { generateDemoSiteWithAI, aiDemoProviderNote } from './aiDemoService'

function fieldValue(buildForm = {}, key, fallback = '') {
  return buildForm?.[key] ?? fallback
}

export default function BuildDemoModal({
  buildLead,
  buildForm = {},
  setBuildForm,
  buildBrief,
  setBuildBrief,
  generatedSiteCopy,
  generatedSiteHtml,
  setGeneratedSiteCopy,
  setGeneratedSiteHtml,
  buildSaving,
  generateDemoBrief,
  generateTemplateSite,
  downloadGeneratedHtml,
  saveBuildDemo,
  onClose
}) {
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiError, setAiError] = useState('')

  if (!buildLead) return null

  function updateField(key, value) {
    setBuildForm?.({ ...buildForm, [key]: value })
  }

  async function generateWithAI() {
    setAiGenerating(true)
    setAiError('')
    try {
      const result = await generateDemoSiteWithAI({ lead: buildLead, buildForm, buildBrief })
      setBuildBrief?.(result.briefMarkdown || '')
      setGeneratedSiteCopy?.(result.siteCopy || null)
      setGeneratedSiteHtml?.(result.html || '')
    } catch (error) {
      setAiError(error.message || 'Unable to generate demo with AI.')
    } finally {
      setAiGenerating(false)
    }
  }

  return <Modal
    open={Boolean(buildLead)}
    title="Build Demo Website"
    description={`Generate demo content and a static website for ${buildLead.business_name || 'this prospect'}.`}
    onClose={onClose}
    size="xl"
    footer={<>
      <Button variant="secondary" icon={X} onClick={onClose}>Close</Button>
      <Button variant="secondary" icon={Wand2} onClick={generateDemoBrief}>Generate Brief</Button>
      <Button variant="secondary" icon={Sparkles} onClick={generateWithAI} disabled={aiGenerating}>{aiGenerating ? 'Generating...' : 'Generate Demo with AI'}</Button>
      <Button variant="secondary" icon={Download} onClick={downloadGeneratedHtml} disabled={!generatedSiteHtml}>Download HTML</Button>
      <Button icon={Save} onClick={saveBuildDemo} disabled={buildSaving}>{buildSaving ? 'Saving...' : 'Save Demo'}</Button>
    </>}
  >
    <div className="demoBuilderAiShell">
      <HelpCallout
        title="AI demo generator"
        description="Fill in the business details below, then generate a full demo website with editable copy and HTML."
      />
      <p className="demoBuilderProviderNote">{aiDemoProviderNote()}</p>
      {aiError ? <div className="notice errorNotice">{aiError}</div> : null}

      <FormGrid>
        <FormField label="Business name"><input value={fieldValue(buildForm, 'business_name', buildLead.business_name || '')} onChange={e => updateField('business_name', e.target.value)} /></FormField>
        <FormField label="Category"><input value={fieldValue(buildForm, 'category', buildLead.category || '')} onChange={e => updateField('category', e.target.value)} placeholder="Mobile detailing, tint shop, repair shop..." /></FormField>
        <FormField label="City / service area"><input value={fieldValue(buildForm, 'city', buildLead.city || '')} onChange={e => updateField('city', e.target.value)} /></FormField>
        <FormField label="Primary CTA"><input value={fieldValue(buildForm, 'cta', fieldValue(buildForm, 'primary_cta', 'Request a Quote'))} onChange={e => updateField('cta', e.target.value)} /></FormField>
        <FormField label="Phone"><input value={fieldValue(buildForm, 'phone', buildLead.phone || '')} onChange={e => updateField('phone', e.target.value)} /></FormField>
        <FormField label="Email"><input value={fieldValue(buildForm, 'email', buildLead.email || '')} onChange={e => updateField('email', e.target.value)} /></FormField>
        <FormField label="Instagram"><input value={fieldValue(buildForm, 'instagram_handle', buildLead.instagram_handle || '')} onChange={e => updateField('instagram_handle', e.target.value)} /></FormField>
        <FormField label="Business hours"><input value={fieldValue(buildForm, 'business_hours', '')} onChange={e => updateField('business_hours', e.target.value)} placeholder="Mon–Fri 9–5" /></FormField>
        <FormField label="Primary color"><input value={fieldValue(buildForm, 'primary_color', '#111827')} onChange={e => updateField('primary_color', e.target.value)} /></FormField>
        <FormField label="Accent color"><input value={fieldValue(buildForm, 'accent_color', '#2563eb')} onChange={e => updateField('accent_color', e.target.value)} /></FormField>
        <FormField className="fullWidth" label="Services" hint="One per line or comma-separated"><textarea value={fieldValue(buildForm, 'services', '')} onChange={e => updateField('services', e.target.value)} placeholder="Exterior detail, ceramic coating, paint correction" /></FormField>
        <FormField className="fullWidth" label="Style / notes"><textarea value={fieldValue(buildForm, 'notes', buildLead.notes || '')} onChange={e => updateField('notes', e.target.value)} placeholder="Modern, premium, family-owned, fast turnaround, use dark colors..." /></FormField>
      </FormGrid>

      <div className="demoBuilderPreviewGrid">
        <section className="demoBuilderPreviewCard">
          <h3>Generated Brief</h3>
          <pre>{buildBrief || 'Generate a brief or AI demo to preview the strategy here.'}</pre>
        </section>
        <section className="demoBuilderPreviewCard">
          <h3>Generated Site Copy</h3>
          <pre>{generatedSiteCopy ? JSON.stringify(generatedSiteCopy, null, 2) : 'Generated copy will appear here.'}</pre>
        </section>
      </div>

      <section className="demoBuilderPreviewCard fullWidth">
        <h3>Generated HTML</h3>
        <pre>{generatedSiteHtml || 'Generated HTML will appear here after using the AI generator or template generator.'}</pre>
      </section>
    </div>
  </Modal>
}
