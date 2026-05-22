import { createFileRoute } from '@tanstack/react-router'
import { InboxSubjectsCreatePage } from '../pages/inbox-subjects/inbox-subjects-page'

export const Route = createFileRoute('/inbox-subjects/create')({
  component: InboxSubjectCreateRoute,
})

function InboxSubjectCreateRoute() {
  return <InboxSubjectsCreatePage />
}
