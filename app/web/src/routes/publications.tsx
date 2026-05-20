import {
  Navigate,
  Outlet,
  createFileRoute,
  useRouterState,
} from '@tanstack/react-router'

export const Route = createFileRoute('/publications')({
  component: PublicationsRoute,
})

function PublicationsRoute() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  if (pathname === '/publications') {
    return <Navigate to="/publications/list" />
  }

  return <Outlet />
}
