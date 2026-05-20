import { Navigate, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/inbox-subjects/global')({
  component: InboxSubjectGlobalRoute,
})

function InboxSubjectGlobalRoute() {
  return <Navigate to="/inbox-subjects" />
}
