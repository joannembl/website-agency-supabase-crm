import { Save, X } from 'lucide-react'
import { leadCategories, pipelineStages, priorities, websiteStatuses } from '../../constants'

export default function EditLeadModal({ editingLead, editForm, setEditForm, onClose, saveEdit }) {
  if (!editingLead) return null
  return <div className="modalBackdrop" onMouseDown={e=>{ if (e.target.className === 'modalBackdrop') onClose() }}>
    <form className="editModal" onSubmit={saveEdit}>
      <div className="modalHeader"><div><h2>Edit Prospect</h2><p>{editingLead.business_name}</p></div><button type="button" className="iconBtn" onClick={onClose}><X size={18}/></button></div>
      <div className="editGrid">
        <label>Business name<input required value={editForm.business_name || ''} onChange={e=>setEditForm({...editForm,business_name:e.target.value})}/></label>
        <label>Instagram handle<input value={editForm.instagram_handle || ''} onChange={e=>setEditForm({...editForm,instagram_handle:e.target.value})}/></label>
        <label>Category<select value={editForm.category || 'Other'} onChange={e=>setEditForm({...editForm,category:e.target.value})}>{leadCategories.map(x=><option key={x}>{x}</option>)}</select></label>
        <label>City<input value={editForm.city || ''} onChange={e=>setEditForm({...editForm,city:e.target.value})}/></label>
        <label>Followers<input value={editForm.followers || ''} onChange={e=>setEditForm({...editForm,followers:e.target.value})}/></label>
        <label>Website status<select value={editForm.website_status || 'Needs verification'} onChange={e=>setEditForm({...editForm,website_status:e.target.value})}>{websiteStatuses.map(x=><option key={x}>{x}</option>)}</select></label>
        <label>Website URL<input value={editForm.website_url || ''} onChange={e=>setEditForm({...editForm,website_url:e.target.value})}/></label>
        <label>Email<input value={editForm.email || ''} onChange={e=>setEditForm({...editForm,email:e.target.value})}/></label>
        <label>Phone<input value={editForm.phone || ''} onChange={e=>setEditForm({...editForm,phone:e.target.value})}/></label>
        <label>Google rating<input value={editForm.google_rating || ''} onChange={e=>setEditForm({...editForm,google_rating:e.target.value})}/></label>
        <label>Google reviews<input value={editForm.google_reviews || ''} onChange={e=>setEditForm({...editForm,google_reviews:e.target.value})}/></label>
        <label>Priority<select value={editForm.priority || 'B'} onChange={e=>setEditForm({...editForm,priority:e.target.value})}>{priorities.map(x=><option key={x}>{x}</option>)}</select></label>
        <label>Status<select value={editForm.status || 'Research'} onChange={e=>setEditForm({...editForm,status:e.target.value})}>{pipelineStages.map(x=><option key={x}>{x}</option>)}</select></label>
        <label className="fullWidth">Notes<textarea value={editForm.notes || ''} onChange={e=>setEditForm({...editForm,notes:e.target.value})}/></label>
      </div>
      <div className="modalActions"><button type="button" className="secondaryBtn" onClick={onClose}>Cancel</button><button type="submit"><Save size={16}/> Save changes</button></div>
    </form>
  </div>
}
