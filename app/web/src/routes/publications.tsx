import { createFileRoute } from '@tanstack/react-router'
import { PublicationsPage } from '../pages/publications/publications-page'

export const Route = createFileRoute('/publications')({
  component: PublicationsRoute,
})

function PublicationsRoute() {
  return <PublicationsPage />
}
