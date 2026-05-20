import { Outlet, createFileRoute, useRouterState } from '@tanstack/react-router'
import { InboxSubjectsPage } from '../pages/inbox-subjects/inbox-subjects-page'

export const Route = createFileRoute('/inbox-subjects')({
  component: InboxSubjectsRoute,
})

function InboxSubjectsRoute() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  if (pathname === '/inbox-subjects') {
    return <InboxSubjectsPage />
  }

  return <Outlet />
}
