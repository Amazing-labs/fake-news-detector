import { createFileRoute } from '@tanstack/react-router'
import { JournalistPage } from '../pages/journalist-workspace/journalist-page'

export const Route = createFileRoute('/journalist')({
  component: JournalistRoute,
})

function JournalistRoute() {
  return <JournalistPage />
}
