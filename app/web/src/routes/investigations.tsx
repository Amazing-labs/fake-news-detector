import { Outlet, createFileRoute, useRouterState } from '@tanstack/react-router'
import { InvestigationsPage } from '../pages/investigations/investigations-page'

export const Route = createFileRoute('/investigations')({
  component: InvestigationsRoute,
})

function InvestigationsRoute() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  if (pathname === '/investigations') {
    return <InvestigationsPage />
  }

  return <Outlet />
}
