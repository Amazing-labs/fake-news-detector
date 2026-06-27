import { apiRequest } from '@shared/api/http'
import type { NotificationList } from './model'

export const notificationQueryKeys = {
  all: ['notifications'] as const,
  // Normalize from the effective request: `activeOnly` only changes the URL
  // when true, so list() and list({ activeOnly: false }) must share a key.
  list: (params?: { activeOnly?: boolean }) =>
    ['notifications', 'list', params?.activeOnly ? { activeOnly: true } : {}] as const,
}

export function listNotifications(params?: { activeOnly?: boolean }) {
  const search = new URLSearchParams()

  if (params?.activeOnly) {
    search.set('activeOnly', 'true')
  }

  const query = search.toString()

  return apiRequest<NotificationList>(
    `/api/notifications${query ? `?${query}` : ''}`,
  )
}

export function markAllNotificationsRead() {
  return apiRequest<null>('/api/notifications/read-all', { method: 'POST' })
}

export function markNotificationRead(notificationId: string) {
  return apiRequest<null>(`/api/notifications/${notificationId}/read`, {
    method: 'POST',
  })
}
