import { createFileRoute } from '@tanstack/react-router'
import { JournalistStatusPage } from '../pages/journalists/journalists-page'

export const Route = createFileRoute('/journalists/status')({
  validateSearch: (search: Record<string, unknown>) => ({
    journalistId:
      typeof search.journalistId === 'string' ? search.journalistId : undefined,
  }),
  component: JournalistStatusRoute,
})

function JournalistStatusRoute() {
  const { journalistId } = Route.useSearch()

  return <JournalistStatusPage journalistId={journalistId} />
}
