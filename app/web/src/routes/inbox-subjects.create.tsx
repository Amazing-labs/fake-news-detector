import { createFileRoute } from '@tanstack/react-router'
import { InboxSubjectCreatePage } from '../pages/inbox-subjects/inbox-subjects-page'

export const Route = createFileRoute('/inbox-subjects/create')({
  component: InboxSubjectCreateRoute,
})

function InboxSubjectCreateRoute() {
  return <InboxSubjectCreatePage />
}
