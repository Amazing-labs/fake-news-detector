import { createFileRoute } from '@tanstack/react-router'
import { InvestigationsPage } from '../pages/investigations/investigations-page'

export const Route = createFileRoute('/investigations')({
  component: InvestigationsRoute,
})

function InvestigationsRoute() {
  return <InvestigationsPage />
}
