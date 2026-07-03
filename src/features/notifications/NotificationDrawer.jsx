import { CheckCheck, Bell, ArrowRight } from 'lucide-react'
import { Button, Badge, EmptyState, Drawer } from '../../components/ui'
import { formatNotificationTime, notificationIcon, notificationTone } from './notificationService'

function groupLabel(value) {
  const date = new Date(value)
  const today = new Date()
  today.setHours(0,0,0,0)
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const current = new Date(date)
  current.setHours(0,0,0,0)
  if (current.getTime() === today.getTime()) return 'Today'
  if (current.getTime() === yesterday.getTime()) return 'Yesterday'
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function NotificationDrawer({ open, notifications, unreadCount, onClose, onMarkRead, onMarkAllRead, onNavigate }) {
  const groups = notifications.reduce((acc, item) => {
    const label = groupLabel(item.created_at || new Date())
    if (!acc[label]) acc[label] = []
    acc[label].push(item)
    return acc
  }, {})

  function handleOpen(notification) {
    onMarkRead?.(notification)
    if (notification.entity_type === 'task') onNavigate?.('Tasks')
    else if (notification.entity_type === 'demo') onNavigate?.('Demo Websites')
    else if (notification.entity_type === 'lead') onNavigate?.('Pipeline')
    else onNavigate?.('Dashboard')
    onClose?.()
  }

  return <Drawer
    open={open}
    title="Notifications"
    description={unreadCount ? `${unreadCount} unread item${unreadCount === 1 ? '' : 's'}` : 'You are all caught up'}
    onClose={onClose}
    className="notificationDrawer"
    footer={<Button variant="secondary" size="sm" icon={CheckCheck} onClick={onMarkAllRead} disabled={!unreadCount}>Mark all read</Button>}
  >
    <div className="notificationList">
      {!notifications.length && <EmptyState icon={Bell} title="No notifications yet" description="Follow-ups, tasks, demo updates, and team activity will appear here." />}
      {Object.entries(groups).map(([label, items]) => <section className="notificationGroup" key={label}>
        <h3>{label}</h3>
        {items.map(item => <button type="button" className={`notificationItem ${item.is_read ? 'isRead' : 'isUnread'}`} key={item.id} onClick={() => handleOpen(item)}>
          <div className="notificationIcon" aria-hidden="true">{notificationIcon(item.type)}</div>
          <div className="notificationContent">
            <div className="notificationTitleRow">
              <strong>{item.title}</strong>
              <Badge tone={notificationTone(item.type)}>{item.type?.replaceAll('_', ' ') || 'update'}</Badge>
            </div>
            <p>{item.message}</p>
            <span>{formatNotificationTime(item.created_at)}</span>
          </div>
          <ArrowRight size={15} className="notificationArrow"/>
        </button>)}
      </section>)}
    </div>
  </Drawer>
}
