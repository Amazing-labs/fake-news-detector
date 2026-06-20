import {
  Outlet,
  createFileRoute,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router'
import { useEffect } from 'react'
import { InvestigationsPage } from '../pages/investigations/investigations-page'
import { useResolvedActor } from '../pages/verifact-design/session-routing'

export const Route = createFileRoute('/investigations')({
  component: InvestigationsRoute,
})

function InvestigationsRoute() {
  const { actor, isActorPending } = useResolvedActor('guest')
  const navigate = useNavigate()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  useEffect(() => {
    if (!isActorPending && actor === 'watcher' && pathname === '/investigations') {
      navigate({ to: '/watcher-applications', replace: true })
    }
  }, [actor, isActorPending, navigate, pathname])

  if (actor === 'watcher' && pathname === '/investigations') return null

  if (pathname === '/investigations') {
    return <InvestigationsPage />
  }

  return <Outlet />
}
