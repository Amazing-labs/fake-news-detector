import { createFileRoute } from '@tanstack/react-router'
import { JournalistCreatePage } from '../pages/journalists/journalists-page'

export const Route = createFileRoute('/journalists/create')({
  component: JournalistCreateRoute,
})

function JournalistCreateRoute() {
  return <JournalistCreatePage />
}
