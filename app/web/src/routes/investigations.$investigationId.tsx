import { createFileRoute } from '@tanstack/react-router'
import { InvestigationDetailPage } from '../pages/investigations/investigations-page'

export const Route = createFileRoute('/investigations/$investigationId')({
  component: InvestigationDetailRoute,
})

function InvestigationDetailRoute() {
  const { investigationId } = Route.useParams()

  return <InvestigationDetailPage investigationId={investigationId} />
}
