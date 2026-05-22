import { createFileRoute } from '@tanstack/react-router'
import { InvestigationsPage } from '../pages/investigations/investigations-page'

export const Route = createFileRoute('/investigations/pending-review')({
  component: PendingReviewInvestigationsRoute,
})

function PendingReviewInvestigationsRoute() {
  return <InvestigationsPage />
}
