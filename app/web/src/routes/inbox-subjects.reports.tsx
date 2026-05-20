import { Navigate, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/inbox-subjects/reports')({
  component: InboxSubjectReportsRoute,
})

function InboxSubjectReportsRoute() {
  return <Navigate to="/inbox-subjects" />
}
