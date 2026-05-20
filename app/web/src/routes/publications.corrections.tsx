import { createFileRoute } from '@tanstack/react-router'
import { PublicationCorrectionsPage } from '../pages/publications/publications-page'

export const Route = createFileRoute('/publications/corrections')({
  validateSearch: (search: Record<string, unknown>) => ({
    publicationId:
      typeof search.publicationId === 'string'
        ? search.publicationId
        : undefined,
  }),
  component: PublicationCorrectionsRoute,
})

function PublicationCorrectionsRoute() {
  const { publicationId } = Route.useSearch()

  return <PublicationCorrectionsPage publicationId={publicationId} />
}
