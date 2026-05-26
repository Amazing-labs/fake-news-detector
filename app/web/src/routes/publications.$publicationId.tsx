import { createFileRoute } from '@tanstack/react-router'
import { PublicationDetailPage } from '../pages/publications/publications-page'

export const Route = createFileRoute('/publications/$publicationId')({
  component: PublicationDetailRoute,
})

function PublicationDetailRoute() {
  const { publicationId } = Route.useParams()

  return <PublicationDetailPage publicationId={publicationId} />
}
