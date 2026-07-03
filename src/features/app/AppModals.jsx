import React from 'react'
import LeadFormModal from '../leads/LeadFormModal'
import EditLeadModal from '../leads/EditLeadModal'
import TeamModal from '../team/TeamModal'
import ActivityModal from '../activities/ActivityModal'
import BuildDemoModal from '../demos/BuildDemoModal'
import DemoManagerModal from '../demos/DemoManagerModal'
import TaskFormModal from '../tasks/TaskFormModal'
import NotificationDrawer from '../notifications/NotificationDrawer'
import CommandPalette from '../command/CommandPalette'

export default function AppModals({
  commandPalette,
  notifications,
  leadForm,
  taskForm,
  team,
  buildDemo,
  demoManager,
  activity,
  editLead
}) {
  return <>
    <CommandPalette {...commandPalette} />
    <NotificationDrawer {...notifications} />
    <LeadFormModal {...leadForm} />
    <TaskFormModal {...taskForm} />
    <TeamModal {...team} />
    <BuildDemoModal {...buildDemo} />
    <DemoManagerModal {...demoManager} />
    <ActivityModal {...activity} />
    <EditLeadModal {...editLead} />
  </>
}
