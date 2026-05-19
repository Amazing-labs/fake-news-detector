import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/inbox-subjects')({
  component: InboxSubjectsRoute,
})

function InboxSubjectsRoute() {
  return <Outlet />
}
