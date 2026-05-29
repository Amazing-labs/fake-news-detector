import { Outlet, createFileRoute, useRouterState } from '@tanstack/react-router'
import { NotificationsPage } from '../pages/notifications/notifications-page'

export const Route = createFileRoute('/notifications')({
  component: NotificationsRoute,
})

function NotificationsRoute() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  if (pathname !== '/notifications') {
    return <Outlet />
  }

  return <NotificationsPage />
}
