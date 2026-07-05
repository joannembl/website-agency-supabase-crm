import { useMemo, useState } from 'react'
import { ArrowLeft, CheckCircle2, Code2, Download, Eye, FileText, Globe2, LayoutTemplate, Save, Sparkles, Wand2 } from 'lucide-react'
import { Button, FormField, FormGrid, HelpCallout, EmptyState } from '../../components/ui'
import { generateDemoSiteWithAI, aiDemoProviderNote } from './aiDemoService'

function fieldValue(buildForm = {}, key, fallback = '') {
  return buildForm?.[key] ?? fallback
}

function asPrettyJson(value) {
  if (!value) return ''
  if (typeof value === 'string') return value
  return JSON.stringify(value, null, 2)
}

function normalizePreviewHtml(html = '') {
  if (!html) return ''
  return html
}

export default function BuildDemoPage({
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
  onBack
}) {
  const [activePreview, setActivePreview] = useState('preview')
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiError, setAiError] = useState('')

  const pageTitle = buildLead?.business_name || fieldValue(buildForm, 'business_name', 'New Demo Website')
  const previewHtml = useMemo(() => normalizePreviewHtml(generatedSiteHtml), [generatedSiteHtml])

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
      setActivePreview('preview')
    } catch (error) {
      setAiError(error.message || 'Unable to generate demo with AI.')
    } finally {
      setAiGenerating(false)
    }
  }

  return <div className="demoBuilderPage">
    <div className="demoBuilderHero">
      <div>
        <Button variant="ghost" icon={ArrowLeft} onClick={onBack}>Back to demos</Button>
        <p className="demoBuilderEyebrow">Build Demo Website V3</p>
        <h1>{pageTitle}</h1>
        <p>Turn business details into an AI-generated demo website with editable copy, HTML, and a live preview.</p>
      </div>
      <div className="demoBuilderHeroActions">
        <Button variant="secondary" icon={Wand2} onClick={generateDemoBrief}>Brief</Button>
        <Button icon={Sparkles} onClick={generateWithAI} disabled={aiGenerating}>{aiGenerating ? 'Generating...' : 'Generate with AI'}</Button>
        <Button variant="secondary" icon={Download} onClick={downloadGeneratedHtml} disabled={!generatedSiteHtml}>Download</Button>
        <Button icon={Save} onClick={saveBuildDemo} disabled={buildSaving}>{buildSaving ? 'Saving...' : 'Save Demo'}</Button>
      </div>
    </div>

    <div className="demoBuilderProgress">
      <span className="active"><CheckCircle2 size={14}/> Business</span>
      <span className={generatedSiteCopy ? 'active' : ''}><FileText size={14}/> Copy</span>
      <span className={generatedSiteHtml ? 'active' : ''}><Code2 size={14}/> Website</span>
      <span className={generatedSiteHtml ? 'active' : ''}><Eye size={14}/> Preview</span>
    </div>

    <div className="demoBuilderPageGrid">
      <section className="demoBuilderPanel demoBuilderFormPanel">
        <div className="demoBuilderPanelHeader">
          <div>
            <h2>Business details</h2>
            <p>Give AI the information it needs to create a strong local-business demo.</p>
          </div>
        </div>

        <HelpCallout
          title="What to enter"
          description="Add the business basics, services, style direction, and any notes a teammate should know. The more specific the input, the better the generated demo."
        />
        <p className="demoBuilderProviderNote">{aiDemoProviderNote()}</p>
        {aiError ? <div className="notice errorNotice">{aiError}</div> : null}

        <FormGrid>
          <FormField label="Business name"><input value={fieldValue(buildForm, 'business_name', buildLead?.business_name || '')} onChange={e => updateField('business_name', e.target.value)} /></FormField>
          <FormField label="Category"><input value={fieldValue(buildForm, 'category', buildLead?.category || '')} onChange={e => updateField('category', e.target.value)} placeholder="Repair shop, detailer, tint shop..." /></FormField>
          <FormField label="City / service area"><input value={fieldValue(buildForm, 'city', buildLead?.city || '')} onChange={e => updateField('city', e.target.value)} /></FormField>
          <FormField label="Primary CTA"><input value={fieldValue(buildForm, 'cta', fieldValue(buildForm, 'primary_cta', 'Request a Quote'))} onChange={e => updateField('cta', e.target.value)} /></FormField>
          <FormField label="Phone"><input value={fieldValue(buildForm, 'phone', buildLead?.phone || '')} onChange={e => updateField('phone', e.target.value)} /></FormField>
          <FormField label="Email"><input value={fieldValue(buildForm, 'email', buildLead?.email || '')} onChange={e => updateField('email', e.target.value)} /></FormField>
          <FormField label="Instagram"><input value={fieldValue(buildForm, 'instagram_handle', buildLead?.instagram_handle || '')} onChange={e => updateField('instagram_handle', e.target.value)} /></FormField>
          <FormField label="Business hours"><input value={fieldValue(buildForm, 'business_hours', '')} onChange={e => updateField('business_hours', e.target.value)} placeholder="Mon–Fri 9–5" /></FormField>
          <FormField label="Primary color"><input value={fieldValue(buildForm, 'primary_color', '#111827')} onChange={e => updateField('primary_color', e.target.value)} /></FormField>
          <FormField label="Accent color"><input value={fieldValue(buildForm, 'accent_color', '#2563eb')} onChange={e => updateField('accent_color', e.target.value)} /></FormField>
          <FormField className="fullWidth" label="Services" hint="One per line or comma-separated"><textarea value={fieldValue(buildForm, 'services', '')} onChange={e => updateField('services', e.target.value)} placeholder="Diagnostics, brake repair, oil changes, AC service" /></FormField>
          <FormField className="fullWidth" label="Style / notes"><textarea value={fieldValue(buildForm, 'notes', buildLead?.notes || '')} onChange={e => updateField('notes', e.target.value)} placeholder="Modern, trustworthy, family-owned, premium, fast turnaround..." /></FormField>
        </FormGrid>
      </section>

      <section className="demoBuilderPanel demoBuilderPreviewPanel">
        <div className="demoBuilderPanelHeader">
          <div>
            <h2>Generated demo</h2>
            <p>Review the strategy, copy, code, and live preview before saving.</p>
          </div>
          <div className="demoBuilderTabs">
            <button className={activePreview === 'preview' ? 'active' : ''} onClick={() => setActivePreview('preview')}><Eye size={14}/> Preview</button>
            <button className={activePreview === 'copy' ? 'active' : ''} onClick={() => setActivePreview('copy')}><FileText size={14}/> Copy</button>
            <button className={activePreview === 'brief' ? 'active' : ''} onClick={() => setActivePreview('brief')}><LayoutTemplate size={14}/> Brief</button>
            <button className={activePreview === 'code' ? 'active' : ''} onClick={() => setActivePreview('code')}><Code2 size={14}/> Code</button>
          </div>
        </div>

        {activePreview === 'preview' && <div className="demoBuilderBrowser">
          <div className="demoBuilderBrowserTop"><span/><span/><span/><strong><Globe2 size={14}/> Preview</strong></div>
          {previewHtml ? <iframe title="Generated demo preview" srcDoc={previewHtml} /> : <EmptyState icon={Sparkles} title="No generated site yet" description="Click Generate with AI to create a polished demo website preview." action={<Button icon={Sparkles} onClick={generateWithAI} disabled={aiGenerating}>{aiGenerating ? 'Generating...' : 'Generate with AI'}</Button>} />}
        </div>}

        {activePreview === 'copy' && <pre className="demoBuilderCodeBlock">{asPrettyJson(generatedSiteCopy) || 'Generated site copy will appear here.'}</pre>}
        {activePreview === 'brief' && <pre className="demoBuilderCodeBlock">{buildBrief || 'Generate a brief or AI demo to preview the strategy here.'}</pre>}
        {activePreview === 'code' && <pre className="demoBuilderCodeBlock">{generatedSiteHtml || 'Generated HTML will appear here.'}</pre>}
      </section>
    </div>
  </div>
}
