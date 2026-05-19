import { createFileRoute } from '@tanstack/react-router'
import { InboxSubjectReportsPage } from '../pages/inbox-subjects/inbox-subjects-page'

export const Route = createFileRoute('/inbox-subjects/reports')({
  component: InboxSubjectReportsRoute,
})

function InboxSubjectReportsRoute() {
  return <InboxSubjectReportsPage />
}
