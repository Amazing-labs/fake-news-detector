import { createFileRoute } from '@tanstack/react-router'
import { NotificationsPage } from '../pages/notifications/notifications-page'

export const Route = createFileRoute('/notifications')({
  component: NotificationsRoute,
})

function NotificationsRoute() {
  return <NotificationsPage />
}
