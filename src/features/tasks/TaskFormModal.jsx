import { X } from 'lucide-react'
import { Button } from '../../components/ui'

const taskTypes = ['General', 'Follow-up', 'Demo', 'Proposal', 'Client', 'Admin']
const priorities = ['High', 'Medium', 'Low']

export const blankTask = {
  title: '',
  description: '',
  due_date: '',
  priority: 'Medium',
  task_type: 'General',
  lead_id: '',
  status: 'open'
}

export default function TaskFormModal({ open, taskForm, setTaskForm, leads = [], onSubmit, onClose, saving = false }) {
  if (!open) return null

  return <div className="modalBackdrop">
    <section className="editModal taskModal">
      <div className="modalHeader">
        <div>
          <h2>New task</h2>
          <p>Create a task for yourself or link it to a prospect.</p>
        </div>
        <button className="iconBtn" onClick={onClose}><X size={18}/></button>
      </div>

      <form onSubmit={onSubmit} className="editGrid">
        <label className="fullWidth">Task title
          <input value={taskForm.title} onChange={e=>setTaskForm({ ...taskForm, title: e.target.value })} placeholder="Follow up with Benitez" autoFocus />
        </label>
        <label>Type
          <select value={taskForm.task_type} onChange={e=>setTaskForm({ ...taskForm, task_type: e.target.value })}>
            {taskTypes.map(type => <option key={type}>{type}</option>)}
          </select>
        </label>
        <label>Priority
          <select value={taskForm.priority} onChange={e=>setTaskForm({ ...taskForm, priority: e.target.value })}>
            {priorities.map(priority => <option key={priority}>{priority}</option>)}
          </select>
        </label>
        <label>Due date
          <input type="date" value={taskForm.due_date || ''} onChange={e=>setTaskForm({ ...taskForm, due_date: e.target.value })} />
        </label>
        <label>Linked prospect
          <select value={taskForm.lead_id || ''} onChange={e=>setTaskForm({ ...taskForm, lead_id: e.target.value })}>
            <option value="">No linked prospect</option>
            {leads.map(lead => <option key={lead.id} value={lead.id}>{lead.business_name || lead.instagram_handle || 'Untitled prospect'}</option>)}
          </select>
        </label>
        <label className="fullWidth">Notes
          <textarea value={taskForm.description || ''} onChange={e=>setTaskForm({ ...taskForm, description: e.target.value })} placeholder="What needs to happen?" />
        </label>
        <div className="modalActions fullWidth">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving || !taskForm.title.trim()}>{saving ? 'Saving...' : 'Create task'}</Button>
        </div>
      </form>
    </section>
  </div>
}
