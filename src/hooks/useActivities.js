import { useState } from 'react'
import * as activityService from '../features/activities/activityService'

export default function useActivities({ session, activeTeamId, setMessage = () => {} }) {
  const [activityLead, setActivityLead] = useState(null)
  const [activities, setActivities] = useState([])
  const [activityForm, setActivityForm] = useState({ activity_type: 'DM', body: '' })

  async function openActivities(lead) {
    setActivityLead(lead)
    setActivityForm({ activity_type: 'DM', body: '' })
    try {
      setActivities(await activityService.fetchActivities({ leadId: lead.id, teamId: activeTeamId }))
    } catch (error) {
      setMessage(error.message)
      setActivities([])
    }
  }

  async function addActivity(e) {
    e.preventDefault()
    if (!activityLead?.id || !activityForm.body.trim()) return
    const payload = {
      lead_id: activityLead.id,
      team_id: activeTeamId || null,
      user_id: session?.user?.id || null,
      activity_type: activityForm.activity_type,
      body: activityForm.body.trim()
    }
    try {
      const next = await activityService.createActivity({ payload, currentActivities: activities })
      if (next) setActivities(next)
      else await openActivities(activityLead)
      setActivityForm({ activity_type: 'DM', body: '' })
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function deleteActivity(id) {
    if (!confirm('Delete this activity note?')) return
    try {
      setActivities(await activityService.deleteActivity({ id, teamId: activeTeamId, currentActivities: activities }))
    } catch (error) {
      setMessage(error.message)
    }
  }

  return { activityLead, setActivityLead, activities, setActivities, activityForm, setActivityForm, openActivities, addActivity, deleteActivity, formatActivityDate: activityService.formatActivityDate }
}
