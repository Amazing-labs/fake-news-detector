import { createFileRoute } from '@tanstack/react-router'
import { JournalistsListPage } from '../pages/journalists/journalists-page'

export const Route = createFileRoute('/journalists/list')({
  component: JournalistsListRoute,
})

function JournalistsListRoute() {
  return <JournalistsListPage />
}
