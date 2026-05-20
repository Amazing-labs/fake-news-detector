import { Outlet, createFileRoute, useRouterState } from '@tanstack/react-router'
import { JournalistsPage } from '../pages/journalists/journalists-page'

export const Route = createFileRoute('/journalists')({
  component: JournalistsRoute,
})

function JournalistsRoute() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  if (pathname === '/journalists') {
    return <JournalistsPage />
  }

  return <Outlet />
}
