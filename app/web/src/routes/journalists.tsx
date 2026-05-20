import {
  Navigate,
  Outlet,
  createFileRoute,
  useRouterState,
} from '@tanstack/react-router'

export const Route = createFileRoute('/journalists')({
  component: JournalistsRoute,
})

function JournalistsRoute() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  if (pathname === '/journalists') {
    return <Navigate to="/journalists/list" />
  }

  return <Outlet />
}
