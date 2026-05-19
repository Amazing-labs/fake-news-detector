import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/investigations')({
  component: InvestigationsRoute,
})

function InvestigationsRoute() {
  return <Outlet />
}
