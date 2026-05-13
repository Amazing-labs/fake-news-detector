import type { Notification } from '../../domain/entities/Notification'

export function presentNotification(notification: Notification) {
  return {
    id: notification.id,
    type: notification.type,
    theme: notification.theme,
    message: notification.message,
    actorId: notification.actorId,
    isRead: notification.isRead,
    publicationId: notification.publicationId ?? null,
    investigationId: notification.investigationId ?? null,
    createdAt: notification.createdAt.toISOString(),
    updatedAt: notification.updatedAt.toISOString(),
  }
}

export function presentNotificationList(items: Notification[]) {
  return {
    items: items.map(presentNotification),
    total: items.length,
  }
}
