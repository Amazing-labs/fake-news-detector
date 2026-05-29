import { createFileRoute } from '@tanstack/react-router'
import { InboxSubjectDetailPage } from '../pages/inbox-subjects/inbox-subjects-page'

export const Route = createFileRoute('/inbox-subjects/$subjectId')({
  component: InboxSubjectDetailRoute,
})

function InboxSubjectDetailRoute() {
  const { subjectId } = Route.useParams()

  return <InboxSubjectDetailPage subjectId={subjectId} />
}
