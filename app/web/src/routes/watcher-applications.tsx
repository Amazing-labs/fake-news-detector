import { createFileRoute } from '@tanstack/react-router'
import { WatcherApplicationsPage } from '../pages/watcher-applications/watcher-applications-page'

export const Route = createFileRoute('/watcher-applications')({
  component: WatcherApplicationsRoute,
})

function WatcherApplicationsRoute() {
  return <WatcherApplicationsPage />
}
