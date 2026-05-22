import { createFileRoute } from '@tanstack/react-router'
import { InboxSubjectsPage } from '../pages/inbox-subjects/inbox-subjects-page'

export const Route = createFileRoute('/inbox-subjects/global')({
  component: InboxSubjectGlobalRoute,
})

function InboxSubjectGlobalRoute() {
  return <InboxSubjectsPage />
}
