import { createFileRoute } from '@tanstack/react-router'
import { PublicationsListPage } from '../pages/publications/publications-page'

export const Route = createFileRoute('/publications/list')({
  component: PublicationsListRoute,
})

function PublicationsListRoute() {
  return <PublicationsListPage />
}
