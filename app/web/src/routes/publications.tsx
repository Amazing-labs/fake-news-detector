import { Outlet, createFileRoute, useRouterState } from '@tanstack/react-router'
import { PublicationsPage } from '../pages/publications/publications-page'

export const Route = createFileRoute('/publications')({
  component: PublicationsRoute,
})

function PublicationsRoute() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  if (pathname === '/publications') {
    return <PublicationsPage />
  }

  return <Outlet />
}
