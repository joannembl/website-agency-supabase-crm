import { supabase } from '../../supabase'

export function readLocalActivities() {
  return JSON.parse(localStorage.getItem('crm_activities') || '[]')
}

export function writeLocalActivities(activities) {
  localStorage.setItem('crm_activities', JSON.stringify(activities))
}

export async function fetchActivities({ leadId, teamId }) {
  if (!supabase) {
    return readLocalActivities()
      .filter(activity => activity.lead_id === leadId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }
  const { data, error } = await supabase
    .from('lead_activities')
    .select('*')
    .eq('lead_id', leadId)
    .eq('team_id', teamId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function createActivity({ payload, currentActivities = [] }) {
  if (!supabase) {
    const newActivity = { ...payload, id: crypto.randomUUID(), created_at: new Date().toISOString() }
    const all = readLocalActivities()
    writeLocalActivities([newActivity, ...all])
    return [newActivity, ...currentActivities]
  }
  const { error } = await supabase.from('lead_activities').insert(payload)
  if (error) throw error
  return null
}

export async function deleteActivity({ id, teamId, currentActivities = [] }) {
  if (!supabase) {
    const all = readLocalActivities().filter(activity => activity.id !== id)
    writeLocalActivities(all)
    return currentActivities.filter(activity => activity.id !== id)
  }
  const { error } = await supabase.from('lead_activities').delete().eq('id', id).eq('team_id', teamId)
  if (error) throw error
  return currentActivities.filter(activity => activity.id !== id)
}

export function formatActivityDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}
