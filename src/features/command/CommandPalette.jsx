import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, Plus, Users, LayoutDashboard, Monitor, CheckSquare, Bell, Settings, FileText, Briefcase, DollarSign, BarChart3, Rocket, MessageSquare, Pencil, ArrowRight, X } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'

function normalize(value = '') {
  return String(value || '').toLowerCase().trim()
}

function resultMatches(result, query) {
  const q = normalize(query)
  if (!q) return true
  return normalize([result.title, result.subtitle, result.group, result.keywords].filter(Boolean).join(' ')).includes(q)
}

function highlightedLabel(text, query) {
  const value = String(text || '')
  const q = String(query || '').trim()
  if (!q) return value
  const index = value.toLowerCase().indexOf(q.toLowerCase())
  if (index === -1) return value
  return <>{value.slice(0, index)}<mark>{value.slice(index, index + q.length)}</mark>{value.slice(index + q.length)}</>
}

const navIconMap = {
  Dashboard: LayoutDashboard,
  Prospects: Users,
  Pipeline: LayoutDashboard,
  'Demo Websites': Monitor,
  Clients: Briefcase,
  Proposals: FileText,
  Tasks: CheckSquare,
  Revenue: DollarSign,
  Analytics: BarChart3,
  Settings
}

export default function CommandPalette({
  open,
  onClose,
  leads = [],
  tasks = [],
  notifications = [],
  setNav,
  setQuery,
  setStatus,
  setCategory,
  setShowAddModal,
  setShowTaskModal,
  openDemoManager,
  openBuildDemo,
  openActivities,
  startEdit,
}) {
  const [query, setLocalQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!open) return
    setLocalQuery('')
    setActiveIndex(0)
    window.setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  const results = useMemo(() => {
    const navigation = ['Dashboard','Prospects','Pipeline','Demo Websites','Clients','Proposals','Tasks','Revenue','Analytics','Settings'].map(name => ({
      id: `nav-${name}`,
      group: 'Navigate',
      title: name,
      subtitle: `Open ${name}`,
      icon: navIconMap[name] || ArrowRight,
      keywords: `go to ${name} open ${name}`,
      action: () => setNav(name)
    }))

    const quickActions = [
      { id: 'action-add-prospect', group: 'Actions', title: 'Add Prospect', subtitle: 'Create a new lead in the CRM', icon: Plus, keywords: 'new lead add business prospect', action: () => setShowAddModal(true) },
      { id: 'action-add-task', group: 'Actions', title: 'Add Task', subtitle: 'Create a new task or follow-up item', icon: CheckSquare, keywords: 'new task todo reminder', action: () => setShowTaskModal?.(true) },
      { id: 'action-open-pipeline', group: 'Actions', title: 'Open Pipeline Board', subtitle: 'View the Kanban sales pipeline', icon: LayoutDashboard, keywords: 'kanban board pipeline', action: () => setNav('Pipeline') },
      { id: 'action-open-demos', group: 'Actions', title: 'Open Demo Websites', subtitle: 'Manage demo site projects', icon: Monitor, keywords: 'demo websites previews build', action: () => setNav('Demo Websites') },
    ]

    const leadResults = leads.flatMap(lead => {
      const title = lead.business_name || 'Untitled Prospect'
      const subtitle = [lead.category || 'Automotive', lead.city || 'Phoenix', lead.instagram_handle].filter(Boolean).join(' · ')
      const keywords = [lead.notes, lead.phone, lead.email, lead.website_status, lead.status, lead.priority, lead.follow_up_note].filter(Boolean).join(' ')
      return [
        {
          id: `lead-open-${lead.id}`,
          group: 'Prospects',
          title,
          subtitle,
          icon: Users,
          badge: lead.status || 'Research',
          keywords,
          action: () => {
            setNav('Pipeline')
            setQuery?.(title)
            setStatus?.('All')
            setCategory?.('All')
          }
        },
        {
          id: `lead-demo-${lead.id}`,
          group: 'Prospect Actions',
          title: `Manage demo — ${title}`,
          subtitle: 'Open Demo Manager for this prospect',
          icon: Monitor,
          keywords: `${title} demo website preview netlify github`,
          action: () => openDemoManager?.(lead)
        },
        {
          id: `lead-build-${lead.id}`,
          group: 'Prospect Actions',
          title: `Build demo — ${title}`,
          subtitle: 'Open the Build Demo Website flow',
          icon: Rocket,
          keywords: `${title} build demo generate website`,
          action: () => openBuildDemo?.(lead)
        },
        {
          id: `lead-activity-${lead.id}`,
          group: 'Prospect Actions',
          title: `Activity — ${title}`,
          subtitle: 'Log DMs, calls, meetings, and notes',
          icon: MessageSquare,
          keywords: `${title} activity notes dm call meeting`,
          action: () => openActivities?.(lead)
        },
        {
          id: `lead-edit-${lead.id}`,
          group: 'Prospect Actions',
          title: `Edit prospect — ${title}`,
          subtitle: 'Update contact info, stage, priority, or follow-up',
          icon: Pencil,
          keywords: `${title} edit prospect follow-up priority status`,
          action: () => startEdit?.(lead)
        }
      ]
    })

    const taskResults = tasks.map(task => ({
      id: `task-${task.id}`,
      group: 'Tasks',
      title: task.title || 'Untitled Task',
      subtitle: [task.status || 'Open', task.due_date ? `Due ${task.due_date}` : null, task.priority ? `Priority ${task.priority}` : null].filter(Boolean).join(' · '),
      icon: CheckSquare,
      badge: task.status || 'Open',
      keywords: [task.description, task.priority, task.status].filter(Boolean).join(' '),
      action: () => setNav('Tasks')
    }))

    const notificationResults = notifications.slice(0, 10).map(item => ({
      id: `notification-${item.id}`,
      group: 'Notifications',
      title: item.title || 'Notification',
      subtitle: item.message || 'Open notifications',
      icon: Bell,
      badge: item.is_read ? 'Read' : 'Unread',
      keywords: [item.type, item.entity_type].filter(Boolean).join(' '),
      action: () => setNav(item.entity_type === 'task' ? 'Tasks' : item.entity_type === 'demo' ? 'Demo Websites' : item.entity_type === 'lead' ? 'Pipeline' : 'Dashboard')
    }))

    return [...quickActions, ...navigation, ...leadResults, ...taskResults, ...notificationResults]
      .filter(result => resultMatches(result, query))
      .slice(0, 80)
  }, [query, leads, tasks, notifications, setNav, setQuery, setStatus, setCategory, setShowAddModal, setShowTaskModal, openDemoManager, openBuildDemo, openActivities, startEdit])

  const groupedResults = useMemo(() => {
    return results.reduce((acc, item) => {
      if (!acc[item.group]) acc[item.group] = []
      acc[item.group].push(item)
      return acc
    }, {})
  }, [results])

  function runResult(result) {
    if (!result) return
    result.action?.()
    onClose?.()
  }

  useEffect(() => {
    if (!open) return
    function handleKeyDown(event) {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setActiveIndex(index => Math.min(index + 1, Math.max(results.length - 1, 0)))
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActiveIndex(index => Math.max(index - 1, 0))
      }
      if (event.key === 'Enter') {
        event.preventDefault()
        runResult(results[activeIndex])
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, results, activeIndex])

  useEffect(() => setActiveIndex(0), [query])

  if (!open) return null

  let visibleIndex = -1

  return <Modal open={open} onClose={onClose} className="commandPaletteModal" title="Search Agency OS" description="Jump to prospects, tasks, demos, pages, and actions.">
    <div className="commandSearchBox">
      <Search size={18} />
      <input ref={inputRef} value={query} onChange={event => setLocalQuery(event.target.value)} placeholder="Search prospects, tasks, demos, or type an action..." />
      <kbd>⌘K</kbd>
    </div>

    <div className="commandResults" role="listbox" aria-label="Global search results">
      {results.length === 0 ? <div className="commandEmpty">
        <Search size={26}/>
        <strong>No results found</strong>
        <p>Try searching for a business name, Instagram handle, task, or command like “Add Prospect”.</p>
      </div> : Object.entries(groupedResults).map(([group, items]) => <section className="commandGroup" key={group}>
        <div className="commandGroupHeader">{group}</div>
        {items.map(result => {
          visibleIndex += 1
          const Icon = result.icon || ArrowRight
          const isActive = activeIndex === visibleIndex
          return <button
            type="button"
            key={result.id}
            className={`commandResult ${isActive ? 'active' : ''}`}
            onMouseEnter={() => setActiveIndex(visibleIndex)}
            onClick={() => runResult(result)}
          >
            <span className="commandResultIcon"><Icon size={17}/></span>
            <span className="commandResultText">
              <strong>{highlightedLabel(result.title, query)}</strong>
              <small>{highlightedLabel(result.subtitle, query)}</small>
            </span>
            {result.badge ? <Badge tone="neutral">{result.badge}</Badge> : null}
            <ArrowRight size={15} className="commandResultArrow" />
          </button>
        })}
      </section>)}
    </div>

    <div className="commandFooter">
      <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
      <span><kbd>Enter</kbd> Open</span>
      <span><kbd>Esc</kbd> Close</span>
    </div>
  </Modal>
}
