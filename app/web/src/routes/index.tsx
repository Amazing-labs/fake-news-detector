import { Navigate, createFileRoute } from '@tanstack/react-router'
import { useAppSession } from '@entities/session/model'
import { LandingPage } from '../pages/landing/landing-page'
import {
  actorFromSession,
  dashboardPathForSession,
} from '../pages/verifact-design/session-routing'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { session, isPending } = useAppSession()

  // Wait for the session read before deciding, so authenticated visitors are
  // never shown the public landing on the way to their dashboard.
  if (isPending) return null

  if (session && actorFromSession(session)) {
    return <Navigate to={dashboardPathForSession(session)} />
  }

  return <LandingPage />
}
