import { Save } from 'lucide-react'
import { Button, Modal, FormField, FormGrid } from '../../components/ui'
import { followUpTypes, leadCategories, pipelineStages, priorities, websiteStatuses } from '../../constants'

export default function EditLeadModal({ editingLead, editForm, setEditForm, onClose, saveEdit }) {
  return <Modal
    open={Boolean(editingLead)}
    title="Edit Prospect"
    description={editingLead?.business_name || 'Update lead details, follow-up plan, and pipeline status.'}
    onClose={onClose}
    size="lg"
    footer={<>
      <Button variant="secondary" onClick={onClose}>Cancel</Button>
      <Button type="submit" form="edit-prospect-form" icon={Save} disabled={!editForm.business_name?.trim()}>Save changes</Button>
    </>}
  >
    <form id="edit-prospect-form" onSubmit={saveEdit}>
      <FormGrid>
        <FormField label="Business name"><input required value={editForm.business_name || ''} onChange={e=>setEditForm({...editForm,business_name:e.target.value})}/></FormField>
        <FormField label="Instagram handle"><input value={editForm.instagram_handle || ''} onChange={e=>setEditForm({...editForm,instagram_handle:e.target.value})}/></FormField>
        <FormField label="Category"><select value={editForm.category || 'Other'} onChange={e=>setEditForm({...editForm,category:e.target.value})}>{leadCategories.map(x=><option key={x}>{x}</option>)}</select></FormField>
        <FormField label="City"><input value={editForm.city || ''} onChange={e=>setEditForm({...editForm,city:e.target.value})}/></FormField>
        <FormField label="Followers"><input value={editForm.followers || ''} onChange={e=>setEditForm({...editForm,followers:e.target.value})}/></FormField>
        <FormField label="Website status"><select value={editForm.website_status || 'Needs verification'} onChange={e=>setEditForm({...editForm,website_status:e.target.value})}>{websiteStatuses.map(x=><option key={x}>{x}</option>)}</select></FormField>
        <FormField label="Website URL"><input value={editForm.website_url || ''} onChange={e=>setEditForm({...editForm,website_url:e.target.value})}/></FormField>
        <FormField label="Email"><input value={editForm.email || ''} onChange={e=>setEditForm({...editForm,email:e.target.value})}/></FormField>
        <FormField label="Phone"><input value={editForm.phone || ''} onChange={e=>setEditForm({...editForm,phone:e.target.value})}/></FormField>
        <FormField label="Google rating"><input value={editForm.google_rating || ''} onChange={e=>setEditForm({...editForm,google_rating:e.target.value})}/></FormField>
        <FormField label="Google reviews"><input value={editForm.google_reviews || ''} onChange={e=>setEditForm({...editForm,google_reviews:e.target.value})}/></FormField>
        <FormField label="Priority"><select value={editForm.priority || 'B'} onChange={e=>setEditForm({...editForm,priority:e.target.value})}>{priorities.map(x=><option key={x}>{x}</option>)}</select></FormField>
        <FormField label="Status"><select value={editForm.status || 'Research'} onChange={e=>setEditForm({...editForm,status:e.target.value})}>{pipelineStages.map(x=><option key={x}>{x}</option>)}</select></FormField>
        <FormField label="Next follow-up date"><input type="date" value={editForm.next_follow_up_date || ''} onChange={e=>setEditForm({...editForm,next_follow_up_date:e.target.value})}/></FormField>
        <FormField label="Follow-up type"><select value={editForm.follow_up_type || 'DM'} onChange={e=>setEditForm({...editForm,follow_up_type:e.target.value})}>{followUpTypes.map(x=><option key={x}>{x}</option>)}</select></FormField>
        <FormField className="fullWidth" label="Follow-up note" hint="What should happen next?"><textarea value={editForm.follow_up_note || ''} onChange={e=>setEditForm({...editForm,follow_up_note:e.target.value})}/></FormField>
        <FormField className="fullWidth" label="Notes"><textarea value={editForm.notes || ''} onChange={e=>setEditForm({...editForm,notes:e.target.value})}/></FormField>
      </FormGrid>
    </form>
  </Modal>
}
