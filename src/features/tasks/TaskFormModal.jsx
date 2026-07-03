import { Button, Modal, FormField, FormGrid } from '../../components/ui'

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
  return <Modal
    open={open}
    title="New Task"
    description="Create a task for yourself or link it to a prospect."
    onClose={onClose}
    size="md"
    footer={<>
      <Button variant="secondary" onClick={onClose}>Cancel</Button>
      <Button type="submit" form="task-form" disabled={saving || !taskForm.title.trim()}>{saving ? 'Saving...' : 'Create task'}</Button>
    </>}
  >
    <form id="task-form" onSubmit={onSubmit}>
      <FormGrid>
        <FormField className="fullWidth" label="Task title"><input value={taskForm.title} onChange={e=>setTaskForm({ ...taskForm, title: e.target.value })} placeholder="Follow up with Benitez" autoFocus /></FormField>
        <FormField label="Type"><select value={taskForm.task_type} onChange={e=>setTaskForm({ ...taskForm, task_type: e.target.value })}>{taskTypes.map(type => <option key={type}>{type}</option>)}</select></FormField>
        <FormField label="Priority"><select value={taskForm.priority} onChange={e=>setTaskForm({ ...taskForm, priority: e.target.value })}>{priorities.map(priority => <option key={priority}>{priority}</option>)}</select></FormField>
        <FormField label="Due date"><input type="date" value={taskForm.due_date || ''} onChange={e=>setTaskForm({ ...taskForm, due_date: e.target.value })} /></FormField>
        <FormField label="Linked prospect"><select value={taskForm.lead_id || ''} onChange={e=>setTaskForm({ ...taskForm, lead_id: e.target.value })}><option value="">No linked prospect</option>{leads.map(lead => <option key={lead.id} value={lead.id}>{lead.business_name || lead.instagram_handle || 'Untitled prospect'}</option>)}</select></FormField>
        <FormField className="fullWidth" label="Notes"><textarea value={taskForm.description || ''} onChange={e=>setTaskForm({ ...taskForm, description: e.target.value })} placeholder="What needs to happen?" /></FormField>
      </FormGrid>
    </form>
  </Modal>
}
