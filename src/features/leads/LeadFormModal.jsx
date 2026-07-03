import { Plus } from 'lucide-react'
import { Button, Modal, FormField, FormGrid } from '../../components/ui'
import { followUpTypes, leadCategories, pipelineStages, priorities, websiteStatuses } from '../../constants'

export default function LeadFormModal({ open, form, setForm, onClose, addLead }) {
  return <Modal
    open={open}
    title="Add Prospect"
    description="Create a new lead and place it into your sales pipeline."
    onClose={onClose}
    size="lg"
    footer={<>
      <Button variant="secondary" onClick={onClose}>Cancel</Button>
      <Button type="submit" form="add-prospect-form" icon={Plus} disabled={!form.business_name?.trim()}>Add prospect</Button>
    </>}
  >
    <form id="add-prospect-form" onSubmit={addLead}>
      <FormGrid>
        <FormField label="Business name"><input required placeholder="Business name" value={form.business_name} onChange={e=>setForm({...form,business_name:e.target.value})}/></FormField>
        <FormField label="Instagram handle"><input placeholder="@handle" value={form.instagram_handle} onChange={e=>setForm({...form,instagram_handle:e.target.value})}/></FormField>
        <FormField label="Category"><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{leadCategories.map(x=><option key={x}>{x}</option>)}</select></FormField>
        <FormField label="City"><input placeholder="Phoenix" value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/></FormField>
        <FormField label="Followers"><input placeholder="Followers" value={form.followers} onChange={e=>setForm({...form,followers:e.target.value})}/></FormField>
        <FormField label="Website status"><select value={form.website_status} onChange={e=>setForm({...form,website_status:e.target.value})}>{websiteStatuses.map(x=><option key={x}>{x}</option>)}</select></FormField>
        <FormField label="Website URL"><input placeholder="https://..." value={form.website_url} onChange={e=>setForm({...form,website_url:e.target.value})}/></FormField>
        <FormField label="Email"><input placeholder="email@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></FormField>
        <FormField label="Phone"><input placeholder="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></FormField>
        <FormField label="Google rating"><input placeholder="4.9" value={form.google_rating} onChange={e=>setForm({...form,google_rating:e.target.value})}/></FormField>
        <FormField label="Google reviews"><input placeholder="125" value={form.google_reviews} onChange={e=>setForm({...form,google_reviews:e.target.value})}/></FormField>
        <FormField label="Priority"><select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>{priorities.map(x=><option key={x}>{x}</option>)}</select></FormField>
        <FormField label="Status"><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>{pipelineStages.map(x=><option key={x}>{x}</option>)}</select></FormField>
        <FormField label="Next follow-up date"><input type="date" value={form.next_follow_up_date || ''} onChange={e=>setForm({...form,next_follow_up_date:e.target.value})}/></FormField>
        <FormField label="Follow-up type"><select value={form.follow_up_type || 'DM'} onChange={e=>setForm({...form,follow_up_type:e.target.value})}>{followUpTypes.map(x=><option key={x}>{x}</option>)}</select></FormField>
        <FormField className="fullWidth" label="Follow-up note" hint="What should happen next?"><textarea value={form.follow_up_note || ''} onChange={e=>setForm({...form,follow_up_note:e.target.value})}/></FormField>
        <FormField className="fullWidth" label="Notes"><textarea placeholder="Prospect notes, context, pricing hints, or outreach ideas" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></FormField>
      </FormGrid>
    </form>
  </Modal>
}
