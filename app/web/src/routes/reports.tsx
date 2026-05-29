import { Outlet, createFileRoute, useRouterState } from '@tanstack/react-router'
import { ReportsPage } from '../pages/reports/reports-page'

export const Route = createFileRoute('/reports')({
  component: ReportsRoute,
})

function ReportsRoute() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  if (pathname !== '/reports') {
    return <Outlet />
  }

  return <ReportsPage />
}
