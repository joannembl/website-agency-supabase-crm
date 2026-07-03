import { supabase } from '../../supabase'

export function normalizeLeadPayload(source) {
  return {
    ...source,
    followers: source.followers ? Number(source.followers) : null,
    google_rating: source.google_rating ? Number(source.google_rating) : null,
    google_reviews: source.google_reviews ? Number(source.google_reviews) : null,
    next_follow_up_date: source.next_follow_up_date || null,
    follow_up_type: source.follow_up_type || null,
    follow_up_note: source.follow_up_note || null,
    last_contacted_at: source.last_contacted_at || null
  }
}

export function readLocalLeads() {
  return JSON.parse(localStorage.getItem('crm_leads') || '[]')
}

export function writeLocalLeads(leads) {
  localStorage.setItem('crm_leads', JSON.stringify(leads))
}

export async function fetchLeads({ teamId }) {
  if (!supabase) return readLocalLeads()
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function createLead({ payload, currentLeads = [] }) {
  if (!supabase) {
    const newLead = { ...payload, id: crypto.randomUUID(), created_at: new Date().toISOString() }
    const next = [newLead, ...currentLeads]
    writeLocalLeads(next)
    return { lead: newLead, leads: next }
  }
  const { data, error } = await supabase.from('leads').insert(payload).select('*').single()
  if (error) throw error
  return { lead: data, leads: null }
}

export async function updateLead({ id, patch, teamId, currentLeads = [] }) {
  if (!supabase) {
    const next = currentLeads.map(lead => lead.id === id ? { ...lead, ...patch } : lead)
    writeLocalLeads(next)
    return { leads: next }
  }
  const { error } = await supabase.from('leads').update(patch).eq('id', id).eq('team_id', teamId)
  if (error) throw error
  return { leads: null }
}

export async function deleteLead({ id, teamId, currentLeads = [] }) {
  if (!supabase) {
    const next = currentLeads.filter(lead => lead.id !== id)
    writeLocalLeads(next)
    return { leads: next }
  }
  const { error } = await supabase.from('leads').delete().eq('id', id).eq('team_id', teamId)
  if (error) throw error
  return { leads: null }
}

export function leadDemoStatus(lead) {
  if (lead.status === 'Won') return 'Live'
  if (lead.status === 'Demo Built') return 'Ready'
  if (lead.status === 'DM Sent') return 'Sent'
  if (lead.status === 'Follow-up') return 'Sent'
  if (lead.status === 'Meeting') return 'Revisions'
  if (lead.status === 'Proposal') return 'Approved'
  return 'Not Started'
}


export function getFollowUpStatus(lead) {
  if (!lead?.next_follow_up_date) return 'none'
  const today = new Date()
  today.setHours(0,0,0,0)
  const due = new Date(`${lead.next_follow_up_date}T00:00:00`)
  if (Number.isNaN(due.getTime())) return 'none'
  if (due < today) return 'overdue'
  if (due.getTime() === today.getTime()) return 'today'
  return 'upcoming'
}

export function getFollowUpLabel(lead) {
  const status = getFollowUpStatus(lead)
  if (status === 'none') return 'No follow-up set'
  const date = new Date(`${lead.next_follow_up_date}T00:00:00`)
  const formatted = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  if (status === 'today') return `Due today · ${lead.follow_up_type || 'Follow-up'}`
  if (status === 'overdue') return `Overdue · ${formatted}`
  return `${formatted} · ${lead.follow_up_type || 'Follow-up'}`
}

export function followUpTone(lead) {
  const status = getFollowUpStatus(lead)
  if (status === 'today') return 'warning'
  if (status === 'overdue') return 'danger'
  if (status === 'upcoming') return 'info'
  return 'neutral'
}
