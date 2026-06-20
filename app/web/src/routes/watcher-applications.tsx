import { createFileRoute } from '@tanstack/react-router'
import { InvestigationsPage } from '../pages/investigations/investigations-page'
import { WatcherApplicationsPage } from '../pages/watcher-applications/watcher-applications-page'
import { useResolvedActor } from '../pages/verifact-design/session-routing'

export const Route = createFileRoute('/watcher-applications')({
  component: WatcherApplicationsRoute,
})

function WatcherApplicationsRoute() {
  const { actor } = useResolvedActor('guest')

  if (actor === 'watcher') return <InvestigationsPage />

  return <WatcherApplicationsPage />
}
