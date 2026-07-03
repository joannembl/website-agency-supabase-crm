import { supabase } from '../../supabase'

const LOCAL_KEY = 'crm_notifications'

export function readLocalNotifications() {
  return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]')
}

export function writeLocalNotifications(notifications) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(notifications))
}

export function notificationIcon(type = '') {
  if (type.includes('follow_up')) return '📅'
  if (type.includes('task')) return '✅'
  if (type.includes('demo')) return '🏗️'
  if (type.includes('team')) return '👥'
  if (type.includes('proposal')) return '📄'
  if (type.includes('client')) return '🤝'
  return '🔔'
}

export function notificationTone(type = '') {
  if (type.includes('overdue')) return 'danger'
  if (type.includes('follow_up')) return 'warning'
  if (type.includes('demo')) return 'purple'
  if (type.includes('task')) return 'info'
  if (type.includes('team')) return 'success'
  return 'neutral'
}

export function formatNotificationTime(value) {
  if (!value) return ''
  const date = new Date(value)
  const now = new Date()
  const diffMs = now - date
  const mins = Math.floor(diffMs / 60000)
  const hours = Math.floor(diffMs / 3600000)
  const days = Math.floor(diffMs / 86400000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function buildSystemNotifications({ leads = [], tasks = [], teamId, userId }) {
  if (!teamId) return []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const generated = []

  leads.forEach(lead => {
    if (!lead.next_follow_up_date) return
    const due = new Date(`${lead.next_follow_up_date}T00:00:00`)
    if (Number.isNaN(due.getTime())) return
    const isOverdue = due < today
    const isToday = due.getTime() === today.getTime()
    if (!isOverdue && !isToday) return

    generated.push({
      id: `system-followup-${lead.id}-${lead.next_follow_up_date}`,
      team_id: teamId,
      user_id: userId,
      type: isOverdue ? 'follow_up_overdue' : 'follow_up_due',
      title: isOverdue ? 'Follow-up overdue' : 'Follow-up due today',
      message: `${lead.business_name || 'Prospect'}${lead.follow_up_note ? ` · ${lead.follow_up_note}` : ''}`,
      entity_type: 'lead',
      entity_id: lead.id,
      is_read: false,
      created_at: new Date().toISOString(),
      synthetic: true
    })
  })

  tasks.forEach(task => {
    if (!task.due_date || task.status === 'completed') return
    const due = new Date(`${task.due_date}T00:00:00`)
    if (Number.isNaN(due.getTime())) return
    const isOverdue = due < today
    const isToday = due.getTime() === today.getTime()
    if (!isOverdue && !isToday) return

    generated.push({
      id: `system-task-${task.id}-${task.due_date}`,
      team_id: teamId,
      user_id: userId,
      type: isOverdue ? 'task_overdue' : 'task_due',
      title: isOverdue ? 'Task overdue' : 'Task due today',
      message: task.title || 'Task needs attention',
      entity_type: 'task',
      entity_id: task.id,
      is_read: false,
      created_at: new Date().toISOString(),
      synthetic: true
    })
  })

  leads.forEach(lead => {
    const status = lead.demo_status || lead.status
    if (!['Demo Built', 'Ready'].includes(status)) return
    generated.push({
      id: `system-demo-${lead.id}-${status}`,
      team_id: teamId,
      user_id: userId,
      type: 'demo_ready',
      title: 'Demo ready to send',
      message: lead.business_name || 'Demo website',
      entity_type: 'demo',
      entity_id: lead.id,
      is_read: false,
      created_at: new Date().toISOString(),
      synthetic: true
    })
  })

  return generated
}

export function mergeNotifications(systemNotifications = [], savedNotifications = []) {
  const readKeys = new Set(savedNotifications.filter(n => n.is_read).map(n => `${n.type}-${n.entity_type}-${n.entity_id}`))
  const filteredSystem = systemNotifications.filter(n => !readKeys.has(`${n.type}-${n.entity_type}-${n.entity_id}`))
  return [...savedNotifications, ...filteredSystem]
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 75)
}

export async function fetchNotifications({ teamId, userId, leads = [], tasks = [] }) {
  if (!teamId) return []

  const systemNotifications = buildSystemNotifications({ leads, tasks, teamId, userId })
  if (!supabase) return mergeNotifications(systemNotifications, readLocalNotifications())

  const userFilter = userId
    ? `user_id.is.null,user_id.eq.${userId}`
    : 'user_id.is.null'

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('team_id', teamId)
    .or(userFilter)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return mergeNotifications(systemNotifications, data || [])
}

function cleanNotificationPayload(payload = {}) {
  const normalized = {
    ...payload,
    is_read: payload.is_read ?? false,
    created_at: payload.created_at || new Date().toISOString()
  }

  // UUID columns cannot receive the string/value undefined. Use null for optional UUIDs
  // and omit id so Supabase/Postgres can generate it.
  if (!normalized.id) delete normalized.id
  ;['team_id', 'user_id', 'entity_id'].forEach(key => {
    if (normalized[key] === undefined || normalized[key] === 'undefined' || normalized[key] === '') {
      normalized[key] = null
    }
  })

  return normalized
}

export async function createNotification({ payload, currentNotifications = [] }) {
  const normalized = cleanNotificationPayload(payload)
  if (!supabase) {
    const notification = { ...normalized, id: crypto.randomUUID() }
    const next = [notification, ...currentNotifications]
    writeLocalNotifications(next.filter(n => !n.synthetic))
    return { notification, notifications: next }
  }
  if (!normalized.team_id) {
    throw new Error('Unable to create notification without a team.')
  }

  const { data, error } = await supabase.from('notifications').insert(normalized).select('*').single()
  if (error) throw error
  return { notification: data, notifications: null }
}

export async function markNotificationRead({ id, notification, currentNotifications = [] }) {
  if (!id) return { notifications: currentNotifications }
  const next = currentNotifications.map(n => n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
  if (!supabase || String(id).startsWith('system-')) {
    if (notification?.synthetic && supabase) {
      await createNotification({ payload: { ...notification, id: undefined, is_read: true, read_at: new Date().toISOString() }, currentNotifications })
    } else {
      writeLocalNotifications(next.filter(n => !n.synthetic))
    }
    return { notifications: next }
  }
  const { error } = await supabase.from('notifications').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
  return { notifications: null }
}

export async function markAllNotificationsRead({ teamId, userId, currentNotifications = [] }) {
  const next = currentNotifications.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
  const syntheticToPersist = currentNotifications.filter(n => n.synthetic && !n.is_read)
  if (!supabase) {
    writeLocalNotifications(next.filter(n => !n.synthetic))
    return { notifications: next }
  }
  for (const n of syntheticToPersist) {
    await createNotification({ payload: { ...n, id: undefined, is_read: true, read_at: new Date().toISOString() }, currentNotifications })
  }
  if (!teamId) return { notifications: next }

  const userFilter = userId
    ? `user_id.is.null,user_id.eq.${userId}`
    : 'user_id.is.null'

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('team_id', teamId)
    .or(userFilter)
    .eq('is_read', false)
  if (error) throw error
  return { notifications: next }
}
