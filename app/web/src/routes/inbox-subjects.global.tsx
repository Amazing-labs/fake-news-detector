import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { InboxSubjectsPage } from '../pages/inbox-subjects/inbox-subjects-page'
import { useResolvedActor } from '../pages/verifact-design/session-routing'

export const Route = createFileRoute('/inbox-subjects/global')({
  component: InboxSubjectGlobalRoute,
})

function InboxSubjectGlobalRoute() {
  const { actor, isActorPending } = useResolvedActor('guest')
  const navigate = useNavigate()

  useEffect(() => {
    if (!isActorPending && actor === 'watcher') {
      navigate({ to: '/reports', replace: true })
    }
  }, [actor, isActorPending, navigate])

  if (actor === 'watcher') return null

  return <InboxSubjectsPage />
}
