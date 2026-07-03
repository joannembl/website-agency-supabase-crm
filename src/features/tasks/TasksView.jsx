import { CheckCircle2, Circle, Clock3, Plus, Search, Trash2, RotateCcw, CalendarDays } from 'lucide-react'
import { Badge, Button, Card, CardHeader, EmptyState, SearchInput, StatCard } from '../../components/ui'
import { PageContent, PageLayout, PageStats, PageToolbar } from '../../layout'
import { getTaskDueStatus, taskDueLabel, taskTone } from './taskService'

function leadLabel(task) {
  const lead = task.leads || task.lead || null
  return lead?.business_name || lead?.instagram_handle || ''
}

function filterTasks(tasks, query, statusFilter, priorityFilter) {
  const q = query.toLowerCase()
  return tasks.filter(task => {
    const hay = `${task.title} ${task.description || ''} ${task.task_type || ''} ${task.priority || ''} ${leadLabel(task)}`.toLowerCase()
    const statusMatch = statusFilter === 'All' || (statusFilter === 'Open' && task.status !== 'completed') || (statusFilter === 'Completed' && task.status === 'completed') || getTaskDueStatus(task) === statusFilter.toLowerCase()
    const priorityMatch = priorityFilter === 'All' || task.priority === priorityFilter
    return hay.includes(q) && statusMatch && priorityMatch
  })
}

function TaskRow({ task, completeTask, reopenTask, deleteTask, openLinkedLead }) {
  const completed = task.status === 'completed'
  return <div className={`taskRow ${completed ? 'taskRow--complete' : ''}`}>
    <button className="taskCompleteBtn" onClick={()=>completed ? reopenTask(task) : completeTask(task)} aria-label={completed ? 'Reopen task' : 'Complete task'}>
      {completed ? <CheckCircle2 size={20}/> : <Circle size={20}/>} 
    </button>
    <div className="taskMain">
      <div className="taskTitleLine">
        <strong>{task.title}</strong>
        <Badge tone={taskTone(task)}>{task.priority || 'Medium'}</Badge>
        <Badge tone={taskTone(task)}>{taskDueLabel(task)}</Badge>
      </div>
      {task.description ? <p>{task.description}</p> : null}
      <div className="taskMetaLine">
        <span>{task.task_type || 'General'}</span>
        {leadLabel(task) ? <button type="button" onClick={()=>openLinkedLead?.(task.lead_id)}>Linked: {leadLabel(task)}</button> : <span>No linked prospect</span>}
      </div>
    </div>
    <button className="iconBtn dangerBtn" onClick={()=>deleteTask(task.id)} title="Delete task"><Trash2 size={16}/></button>
  </div>
}

export default function TasksView({ tasks = [], leads = [], query, setQuery, statusFilter, setStatusFilter, priorityFilter, setPriorityFilter, setShowTaskModal, completeTask, reopenTask, deleteTask, setNav }) {
  const openTasks = tasks.filter(task => task.status !== 'completed')
  const completedTasks = tasks.filter(task => task.status === 'completed')
  const dueToday = openTasks.filter(task => getTaskDueStatus(task) === 'today')
  const overdue = openTasks.filter(task => getTaskDueStatus(task) === 'overdue')
  const upcoming = openTasks.filter(task => getTaskDueStatus(task) === 'upcoming')
  const filtered = filterTasks(tasks, query, statusFilter, priorityFilter)

  function openLinkedLead() {
    setNav('Prospects')
  }

  return <PageLayout className="tasksPage">
    <section className="commandHero compactHero">
      <div>
        <span className="commandEyebrow">Daily operations</span>
        <h1>Tasks</h1>
        <p>Track internal work, follow-ups, demos, proposals, and client tasks in one place.</p>
      </div>
      <div className="commandHeroActions">
        <Button icon={Plus} onClick={()=>setShowTaskModal(true)}>New task</Button>
      </div>
    </section>

    <PageStats className="dashboardStatsGrid commandStatsGrid">
      <StatCard label="Open" value={openTasks.length} icon={Circle} helper="Active tasks" />
      <StatCard label="Due Today" value={dueToday.length} icon={CalendarDays} helper="Needs action" tone="warning" />
      <StatCard label="Overdue" value={overdue.length} icon={Clock3} helper="Past due" tone="danger" />
      <StatCard label="Upcoming" value={upcoming.length} icon={CalendarDays} helper="Scheduled" tone="info" />
      <StatCard label="Completed" value={completedTasks.length} icon={CheckCircle2} helper="Finished" tone="success" />
    </PageStats>

    <PageToolbar className="tasksToolbar">
      <SearchInput value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search tasks, prospects, notes..." icon={Search} />
      <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
        <option>All</option>
        <option>Open</option>
        <option>Today</option>
        <option>Overdue</option>
        <option>Upcoming</option>
        <option>Completed</option>
      </select>
      <select value={priorityFilter} onChange={e=>setPriorityFilter(e.target.value)}>
        <option>All</option>
        <option>High</option>
        <option>Medium</option>
        <option>Low</option>
      </select>
      <Button variant="secondary" icon={RotateCcw} onClick={()=>{setQuery(''); setStatusFilter('All'); setPriorityFilter('All')}}>Reset</Button>
    </PageToolbar>

    <PageContent className="tasksGrid">
      <Card className="dashboardPanel tasksListPanel">
        <CardHeader title="Task List" description={`${filtered.length} task${filtered.length === 1 ? '' : 's'} shown`} />
        {filtered.length ? <div className="taskList">
          {filtered.map(task => <TaskRow key={task.id} task={task} completeTask={completeTask} reopenTask={reopenTask} deleteTask={deleteTask} openLinkedLead={openLinkedLead} />)}
        </div> : <EmptyState icon={CheckCircle2} title="No tasks found" description="Create a task or adjust your filters." />}
      </Card>

      <Card className="dashboardPanel tasksFocusPanel">
        <CardHeader title="Priority Queue" description="Your highest-impact work first." />
        <div className="taskQueue">
          {[...overdue, ...dueToday, ...upcoming].slice(0, 8).map(task => <button type="button" key={task.id}>
            <div>
              <strong>{task.title}</strong>
              <span>{taskDueLabel(task)}</span>
            </div>
            <Badge tone={taskTone(task)}>{task.priority}</Badge>
          </button>)}
          {![...overdue, ...dueToday, ...upcoming].length ? <EmptyState icon={Clock3} title="Queue is clear" description="No dated tasks are currently waiting." /> : null}
        </div>
      </Card>
    </PageContent>
  </PageLayout>
}
