import { createFileRoute } from '@tanstack/react-router'
import { PublishedInvestigationsPage } from '../pages/investigations/investigations-page'

export const Route = createFileRoute('/investigations/published')({
  component: PublishedInvestigationsRoute,
})

function PublishedInvestigationsRoute() {
  return <PublishedInvestigationsPage />
}
