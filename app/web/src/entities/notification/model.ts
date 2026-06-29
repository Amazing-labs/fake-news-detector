// Visual tone, orthogonal to `type`: success is pleasant, warning puts
// pressure (action required), info simply informs. Mirrors the server enum.
export type NotificationLevel = 'SUCCESS' | 'WARNING' | 'INFO'

export type NotificationItem = {
  id: string
  type: string
  level: NotificationLevel
  theme: string
  message: string
  actorId: string
  isRead: boolean
  publicationId: string | null
  investigationId: string | null
  createdAt: string
  updatedAt: string
}

export type NotificationList = {
  items: NotificationItem[]
  total: number
}
