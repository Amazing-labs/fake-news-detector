import type { NotificationLevel } from './schemas'

export type { NotificationLevel } from './schemas'

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
