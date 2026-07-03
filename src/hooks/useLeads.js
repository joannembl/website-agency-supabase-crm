import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import * as leadService from '../features/leads/leadService'

export default function useLeads({ session, activeTeamId, setMessage = () => {} }) {
  const [leads, setLeads] = useState([])

  async function loadLeads(teamId = activeTeamId) {
    setMessage('')
    if (supabase && (!session || !teamId)) return
    try {
      setLeads(await leadService.fetchLeads({ teamId }))
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function addLead(payload) {
    if (supabase && !activeTeamId) throw new Error('Create or join a team first.')
    const result = await leadService.createLead({ payload, currentLeads: leads })
    if (result.leads) setLeads(result.leads)
    else await loadLeads()
    return result.lead
  }

  async function updateLead(id, patch) {
    setMessage('')
    try {
      const result = await leadService.updateLead({ id, patch, teamId: activeTeamId, currentLeads: leads })
      if (result.leads) setLeads(result.leads)
      else await loadLeads()
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function deleteLead(id) {
    const result = await leadService.deleteLead({ id, teamId: activeTeamId, currentLeads: leads })
    if (result.leads) setLeads(result.leads)
    else await loadLeads()
  }

  useEffect(() => { if (activeTeamId || !supabase) loadLeads(activeTeamId) }, [activeTeamId, session])

  return { leads, setLeads, loadLeads, addLead, updateLead, deleteLead }
}
