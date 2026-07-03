import { useEffect, useMemo, useState } from 'react'
import * as notificationService from '../features/notifications/notificationService'

export default function useNotifications({ session, activeTeamId, leads, tasks, setMessage }) {
  const [notifications, setNotifications] = useState([])
  const [loadingNotifications, setLoadingNotifications] = useState(false)

  async function loadNotifications() {
    if (!activeTeamId) {
      setNotifications([])
      return
    }
    setLoadingNotifications(true)
    try {
      const data = await notificationService.fetchNotifications({
        teamId: activeTeamId,
        userId: session?.user?.id,
        leads,
        tasks
      })
      setNotifications(data)
    } catch (error) {
      setMessage?.(error.message || 'Unable to load notifications.')
    } finally {
      setLoadingNotifications(false)
    }
  }

  async function createNotification(payload) {
    try {
      const { notification, notifications: next } = await notificationService.createNotification({
        payload: {
          ...payload,
          team_id: payload.team_id || activeTeamId,
          user_id: payload.user_id === undefined ? session?.user?.id : payload.user_id
        },
        currentNotifications: notifications
      })
      if (next) setNotifications(next)
      else setNotifications(current => [notification, ...current])
      return notification
    } catch (error) {
      setMessage?.(error.message || 'Unable to create notification.')
    }
  }

  async function markRead(notification) {
    try {
      const { notifications: next } = await notificationService.markNotificationRead({
        id: notification?.id,
        notification,
        currentNotifications: notifications
      })
      if (next) setNotifications(next)
      else setNotifications(current => current.map(item => item.id === notification.id ? { ...item, is_read: true, read_at: new Date().toISOString() } : item))
    } catch (error) {
      setMessage?.(error.message || 'Unable to update notification.')
    }
  }

  async function markAllRead() {
    try {
      const { notifications: next } = await notificationService.markAllNotificationsRead({
        teamId: activeTeamId,
        userId: session?.user?.id,
        currentNotifications: notifications
      })
      if (next) setNotifications(next)
    } catch (error) {
      setMessage?.(error.message || 'Unable to update notifications.')
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [activeTeamId, session?.user?.id, leads, tasks])

  const unreadCount = useMemo(() => notifications.filter(item => !item.is_read).length, [notifications])

  return { notifications, setNotifications, unreadCount, loadingNotifications, loadNotifications, createNotification, markRead, markAllRead }
}
