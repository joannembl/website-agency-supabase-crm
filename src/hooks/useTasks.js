import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import * as taskService from '../features/tasks/taskService'

export default function useTasks({ session, activeTeamId, setMessage = () => {} }) {
  const [tasks, setTasks] = useState([])

  async function loadTasks(teamId = activeTeamId) {
    setMessage('')
    if (supabase && (!session || !teamId)) return
    try {
      setTasks(await taskService.fetchTasks({ teamId }))
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function addTask(payload) {
    if (supabase && !activeTeamId) throw new Error('Create or join a team first.')
    const result = await taskService.createTask({ payload, currentTasks: tasks })
    if (result.tasks) setTasks(result.tasks)
    else await loadTasks()
    return result.task
  }

  async function updateTask(id, patch) {
    setMessage('')
    try {
      const result = await taskService.updateTask({ id, patch, teamId: activeTeamId, currentTasks: tasks })
      if (result.tasks) setTasks(result.tasks)
      else await loadTasks()
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function deleteTask(id) {
    const result = await taskService.deleteTask({ id, teamId: activeTeamId, currentTasks: tasks })
    if (result.tasks) setTasks(result.tasks)
    else await loadTasks()
  }

  async function completeTask(task) {
    await updateTask(task.id, { status: 'completed', completed_at: new Date().toISOString() })
  }

  async function reopenTask(task) {
    await updateTask(task.id, { status: 'open', completed_at: null })
  }

  useEffect(() => { if (activeTeamId || !supabase) loadTasks(activeTeamId) }, [activeTeamId, session])

  return { tasks, setTasks, loadTasks, addTask, updateTask, deleteTask, completeTask, reopenTask }
}
