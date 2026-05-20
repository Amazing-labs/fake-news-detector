import { Navigate, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/investigations/published')({
  component: PublishedInvestigationsRoute,
})

function PublishedInvestigationsRoute() {
  return <Navigate to="/investigations" />
}
