import type { ReactNode } from 'react'
import { Navigate, useRouterState } from '@tanstack/react-router'
import type { AppSession } from '@lib/auth-client'

// The only two pages a signed-out visitor may see. Everything else is a
// workspace that belongs to an actor.
const publicRoutes = ['/', '/auth']

export function AppShell(props: {
  session: AppSession | null | undefined
  isPending: boolean
  children: ReactNode
}) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  if (publicRoutes.includes(pathname)) return <>{props.children}</>

  // The session is read asynchronously: rendering a workspace before it settles
  // would bounce a signed-in visitor off their own page.
  if (props.isPending) return null

  // Guards every workspace above the router outlet, so a stale URL — a bookmark,
  // or the back button after a sign-out — cannot render a workspace to a visitor
  // who no longer has a session.
  if (!props.session) return <Navigate to="/" replace />

  return <>{props.children}</>
}
