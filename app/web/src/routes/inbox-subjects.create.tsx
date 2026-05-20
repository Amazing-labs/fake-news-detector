import { Navigate, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/inbox-subjects/create')({
  component: InboxSubjectCreateRoute,
})

function InboxSubjectCreateRoute() {
  return <Navigate to="/inbox-subjects" />
}
