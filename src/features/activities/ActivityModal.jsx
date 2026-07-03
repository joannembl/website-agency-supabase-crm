import { Plus, MessageSquare, X } from 'lucide-react'

export default function ActivityModal({ activityLead, activities, activityForm, setActivityForm, addActivity, formatActivityDate, deleteActivity, isAdmin, onClose }) {
  if (!activityLead) return null
  return <div className="modalBackdrop" onMouseDown={e=>{ if (e.target.className === 'modalBackdrop') onClose() }}>
    <div className="editModal activityModalV2">
      <div className="activityModalHeader">
        <div>
          <span className="eyebrow">Prospect activity</span>
          <h2>{activityLead.business_name}</h2>
          <div className="activityLeadMeta"><span>{activityLead.category || 'No category'}</span><span>{activityLead.city || 'Phoenix'}</span><span>{activityLead.status || 'Research'}</span></div>
        </div>
        <button type="button" className="iconBtn" onClick={onClose}><X size={18}/></button>
      </div>

      <div className="activityModalGrid">
        <section className="activityComposer">
          <h3>Log a new activity</h3>
          <p>Track every DM, call, meeting, email, and follow-up so you always know the next step.</p>
          <div className="quickActivityRow">
            <button type="button" className="quickChip" onClick={()=>setActivityForm({activity_type:'DM', body:'Sent first DM with demo site link.'})}>First DM</button>
            <button type="button" className="quickChip" onClick={()=>setActivityForm({activity_type:'Follow-up', body:'Followed up after sending the demo link.'})}>Follow-up</button>
            <button type="button" className="quickChip" onClick={()=>setActivityForm({activity_type:'Call', body:'Called business. No answer / left voicemail.'})}>Call attempt</button>
            <button type="button" className="quickChip" onClick={()=>setActivityForm({activity_type:'Meeting', body:'Meeting booked to review the demo site.'})}>Meeting booked</button>
          </div>
          <form className="activityFormV2" onSubmit={addActivity}>
            <label>Activity type<select value={activityForm.activity_type} onChange={e=>setActivityForm({...activityForm, activity_type:e.target.value})}>{['DM','Call','Meeting','Follow-up','Email','Note'].map(x=><option key={x}>{x}</option>)}</select></label>
            <label>What happened?<textarea placeholder="Example: Sent first DM with demo link. They replied asking for pricing." value={activityForm.body} onChange={e=>setActivityForm({...activityForm, body:e.target.value})}></textarea></label>
            <button type="submit" disabled={!activityForm.body.trim()}><Plus size={16}/> Add activity</button>
          </form>
        </section>

        <section className="activityHistoryPanel">
          <div className="historyHeader"><h3>Timeline</h3><span>{activities.length} {activities.length === 1 ? 'entry' : 'entries'}</span></div>
          <div className="activityTimelineV2">
            {activities.length === 0 ? <div className="emptyActivityState"><MessageSquare size={28}/><strong>No activity yet</strong><p>Start by logging the first DM, call, meeting, or follow-up.</p></div> : activities.map(a=><article className="activityItemV2" key={a.id}>
              <div className={`activityTypeBadge type${String(a.activity_type || 'Note').replace(/[^a-zA-Z]/g,'')}`}>{a.activity_type}</div>
              <div className="activityContentV2"><div className="activityHeaderV2"><span>{formatActivityDate(a.created_at)}</span>{isAdmin && <button type="button" className="textDanger" onClick={()=>deleteActivity(a.id)} title="Delete activity">Delete</button>}</div><p>{a.body}</p></div>
            </article>)}
          </div>
        </section>
      </div>
    </div>
  </div>
}
