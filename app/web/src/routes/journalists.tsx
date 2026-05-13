import { createFileRoute } from '@tanstack/react-router'
import { JournalistsPage } from '../pages/journalists/journalists-page'

export const Route = createFileRoute('/journalists')({
  component: JournalistsRoute,
})

function JournalistsRoute() {
  return <JournalistsPage />
}
