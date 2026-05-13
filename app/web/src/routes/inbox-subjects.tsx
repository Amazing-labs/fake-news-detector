import { createFileRoute } from '@tanstack/react-router'
import { InboxSubjectsPage } from '../pages/inbox-subjects/inbox-subjects-page'

export const Route = createFileRoute('/inbox-subjects')({
  component: InboxSubjectsRoute,
})

function InboxSubjectsRoute() {
  return <InboxSubjectsPage />
}
