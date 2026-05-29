import {
  NotificationDetailWorkspacePage,
  VeriFactNotificationsPage,
} from '../verifact-design/verifact-design-page'

export function NotificationsPage() {
  return <VeriFactNotificationsPage />
}

export function NotificationDetailPage({
  notificationId,
}: {
  notificationId: string
}) {
  return <NotificationDetailWorkspacePage notificationId={notificationId} />
}
