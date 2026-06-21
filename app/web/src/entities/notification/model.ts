import { create } from 'zustand'
import { notificationItems } from './fixtures'

export type NotificationItem = {
  id: string
  type: string
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

type NotificationReadStore = {
  readIds: Set<string>
  markAllRead: () => void
}

export const useNotificationReadStore = create<NotificationReadStore>()(
  (set) => ({
    readIds: new Set(
      notificationItems.filter((n) => n.isRead).map((n) => n.id),
    ),
    markAllRead: () =>
      set({ readIds: new Set(notificationItems.map((n) => n.id)) }),
  }),
)
