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
