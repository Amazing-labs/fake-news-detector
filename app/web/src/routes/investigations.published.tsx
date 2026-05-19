import { createFileRoute } from '@tanstack/react-router'
import { InvestigationScopePage } from '../pages/investigations/investigations-page'

export const Route = createFileRoute('/investigations/published')({
  component: PublishedInvestigationsRoute,
})

function PublishedInvestigationsRoute() {
  return (
    <InvestigationScopePage
      scope="published"
      emptyTitle="Aucune enquete publiee"
    />
  )
}
