import { supabase } from '../../supabase'

export function readLocalDemos() {
  return JSON.parse(localStorage.getItem('crm_demos') || '[]')
}

export function writeLocalDemos(demos) {
  localStorage.setItem('crm_demos', JSON.stringify(demos))
}

export async function fetchDemoByLead({ leadId }) {
  if (!supabase) return readLocalDemos().find(demo => demo.lead_id === leadId) || null
  const { data, error } = await supabase.from('demos').select('*').eq('lead_id', leadId).maybeSingle()
  if (error) throw error
  return data || null
}

export async function upsertDemoByLead({ leadId, payload, existingRecord = null }) {
  if (!supabase) {
    const all = readLocalDemos()
    const existing = existingRecord || all.find(demo => demo.lead_id === leadId)
    const saved = existing
      ? { ...existing, ...payload, updated_at: new Date().toISOString() }
      : { ...payload, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    writeLocalDemos(existing ? all.map(demo => demo.id === existing.id ? saved : demo) : [saved, ...all])
    return saved
  }
  if (existingRecord?.id) {
    const { data, error } = await supabase.from('demos').update(payload).eq('id', existingRecord.id).select('*').single()
    if (error) throw error
    return data
  }
  const { data, error } = await supabase.from('demos').insert(payload).select('*').single()
  if (error) throw error
  return data
}

export async function saveBuildDemoRecord({ leadId, payload }) {
  if (!supabase) return upsertDemoByLead({ leadId, payload })
  const { data: existing, error: fetchError } = await supabase.from('demos').select('id').eq('lead_id', leadId).maybeSingle()
  if (fetchError) throw fetchError
  if (existing?.id) {
    const { error } = await supabase.from('demos').update(payload).eq('id', existing.id)
    if (error) throw error
    return existing
  }
  const { error } = await supabase.from('demos').insert(payload)
  if (error) throw error
  return null
}

export async function updateDemoStatus({ demoId, patch }) {
  if (!supabase) return null
  const { error } = await supabase.from('demos').update(patch).eq('id', demoId)
  if (error) throw error
  return null
}
