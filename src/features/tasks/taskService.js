import { supabase } from '../../supabase'

const LOCAL_KEY = 'crm_tasks'

export function readLocalTasks() {
  return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]')
}

export function writeLocalTasks(tasks) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(tasks))
}

export function normalizeTaskPayload(source) {
  return {
    title: source.title?.trim() || '',
    description: source.description?.trim() || null,
    status: source.status || 'open',
    priority: source.priority || 'Medium',
    due_date: source.due_date || null,
    task_type: source.task_type || 'General',
    lead_id: source.lead_id || null,
    assigned_to: source.assigned_to || null,
    completed_at: source.status === 'completed' ? (source.completed_at || new Date().toISOString()) : null
  }
}

export function getTaskDueStatus(task) {
  if (!task?.due_date || task.status === 'completed') return 'none'
  const today = new Date()
  today.setHours(0,0,0,0)
  const due = new Date(`${task.due_date}T00:00:00`)
  if (Number.isNaN(due.getTime())) return 'none'
  if (due < today) return 'overdue'
  if (due.getTime() === today.getTime()) return 'today'
  return 'upcoming'
}

export function taskDueLabel(task) {
  const status = getTaskDueStatus(task)
  if (status === 'none') return task.status === 'completed' ? 'Completed' : 'No due date'
  const formatted = new Date(`${task.due_date}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  if (status === 'today') return `Due today · ${task.task_type || 'Task'}`
  if (status === 'overdue') return `Overdue · ${formatted}`
  return `${formatted} · ${task.task_type || 'Task'}`
}

export function taskTone(task) {
  if (task.status === 'completed') return 'success'
  const dueStatus = getTaskDueStatus(task)
  if (dueStatus === 'overdue') return 'danger'
  if (dueStatus === 'today') return 'warning'
  if (task.priority === 'High') return 'danger'
  if (task.priority === 'Medium') return 'warning'
  return 'neutral'
}

export async function fetchTasks({ teamId }) {
  if (!supabase) return readLocalTasks()
  const { data, error } = await supabase
    .from('tasks')
    .select('*, leads(business_name, instagram_handle, category)')
    .eq('team_id', teamId)
    .order('status', { ascending: false })
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function createTask({ payload, currentTasks = [] }) {
  if (!supabase) {
    const task = { ...payload, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    const next = [task, ...currentTasks]
    writeLocalTasks(next)
    return { task, tasks: next }
  }
  const { data, error } = await supabase.from('tasks').insert(payload).select('*, leads(business_name, instagram_handle, category)').single()
  if (error) throw error
  return { task: data, tasks: null }
}

export async function updateTask({ id, patch, teamId, currentTasks = [] }) {
  const normalizedPatch = { ...patch, updated_at: new Date().toISOString() }
  if (!supabase) {
    const next = currentTasks.map(task => task.id === id ? { ...task, ...normalizedPatch } : task)
    writeLocalTasks(next)
    return { tasks: next }
  }
  const { error } = await supabase.from('tasks').update(normalizedPatch).eq('id', id).eq('team_id', teamId)
  if (error) throw error
  return { tasks: null }
}

export async function deleteTask({ id, teamId, currentTasks = [] }) {
  if (!supabase) {
    const next = currentTasks.filter(task => task.id !== id)
    writeLocalTasks(next)
    return { tasks: next }
  }
  const { error } = await supabase.from('tasks').delete().eq('id', id).eq('team_id', teamId)
  if (error) throw error
  return { tasks: null }
}
