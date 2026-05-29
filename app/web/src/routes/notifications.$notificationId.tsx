import { createFileRoute } from '@tanstack/react-router'
import { NotificationDetailPage } from '../pages/notifications/notifications-page'

export const Route = createFileRoute('/notifications/$notificationId')({
  component: NotificationDetailRoute,
})

function NotificationDetailRoute() {
  const { notificationId } = Route.useParams()

  return <NotificationDetailPage notificationId={notificationId} />
}
