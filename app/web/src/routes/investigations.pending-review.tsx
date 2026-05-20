import { Navigate, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/investigations/pending-review')({
  component: PendingReviewInvestigationsRoute,
})

function PendingReviewInvestigationsRoute() {
  return <Navigate to="/investigations" />
}
