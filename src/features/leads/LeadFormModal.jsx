import { Plus, X } from 'lucide-react'
import { followUpTypes, leadCategories, pipelineStages, priorities, websiteStatuses } from '../../constants'

export default function LeadFormModal({ open, form, setForm, onClose, addLead }) {
  if (!open) return null
  return <div className="modalBackdrop" onMouseDown={e=>{ if (e.target.className === 'modalBackdrop') onClose() }}>
    <form className="editModal" onSubmit={addLead}>
      <div className="modalHeader"><div><h2>Add Prospect</h2><p>Create a new lead in the Research stage.</p></div><button type="button" className="iconBtn" onClick={onClose}><X size={18}/></button></div>
      <div className="editGrid">
        <label>Business name<input required placeholder="Business name" value={form.business_name} onChange={e=>setForm({...form,business_name:e.target.value})}/></label>
        <label>Instagram handle<input placeholder="@handle" value={form.instagram_handle} onChange={e=>setForm({...form,instagram_handle:e.target.value})}/></label>
        <label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{leadCategories.map(x=><option key={x}>{x}</option>)}</select></label>
        <label>City<input placeholder="Phoenix" value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/></label>
        <label>Followers<input placeholder="Followers" value={form.followers} onChange={e=>setForm({...form,followers:e.target.value})}/></label>
        <label>Website status<select value={form.website_status} onChange={e=>setForm({...form,website_status:e.target.value})}>{websiteStatuses.map(x=><option key={x}>{x}</option>)}</select></label>
        <label>Website URL<input placeholder="https://..." value={form.website_url} onChange={e=>setForm({...form,website_url:e.target.value})}/></label>
        <label>Email<input placeholder="email@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
        <label>Phone<input placeholder="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label>
        <label>Google rating<input placeholder="4.9" value={form.google_rating} onChange={e=>setForm({...form,google_rating:e.target.value})}/></label>
        <label>Google reviews<input placeholder="125" value={form.google_reviews} onChange={e=>setForm({...form,google_reviews:e.target.value})}/></label>
        <label>Priority<select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>{priorities.map(x=><option key={x}>{x}</option>)}</select></label>
        <label>Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>{pipelineStages.map(x=><option key={x}>{x}</option>)}</select></label>
        <label>Next follow-up date<input type="date" value={form.next_follow_up_date || ''} onChange={e=>setForm({...form,next_follow_up_date:e.target.value})}/></label>
        <label>Follow-up type<select value={form.follow_up_type || 'DM'} onChange={e=>setForm({...form,follow_up_type:e.target.value})}>{followUpTypes.map(x=><option key={x}>{x}</option>)}</select></label>
        <label className="fullWidth">Follow-up note<textarea placeholder="What should happen next?" value={form.follow_up_note || ''} onChange={e=>setForm({...form,follow_up_note:e.target.value})}/></label>
        <label className="fullWidth">Notes<textarea placeholder="Notes" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></label>
      </div>
      <div className="modalActions"><button type="button" className="secondaryBtn" onClick={onClose}>Cancel</button><button type="submit"><Plus size={16}/> Add prospect</button></div>
    </form>
  </div>
}
