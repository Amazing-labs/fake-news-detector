import {
  formatCitizenType,
  formatUserRole,
  useAppSession,
} from '@entities/session/model'
import type { AppSession } from '@lib/auth-client'
import { actorLabels } from './data'
import type { Actor } from './types'

export function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
}

export function actorFromSession(
  session: AppSession | null | undefined,
): Actor | null {
  const role = session?.user.actorRole
  const citizenType = session?.user.citizenType

  if (role === 'EDITORIAL_DIRECTOR') return 'director'
  if (role === 'JOURNALIST') return 'journalist'
  if (role === 'CITIZEN' && citizenType === 'WATCHER') return 'watcher'
  if (role === 'CITIZEN') return 'citizen'

  return null
}

export function useResolvedActor(fallback: Actor = 'guest') {
  const { session, isPending } = useAppSession()
  const actor = actorFromSession(session)
  const isActorPending = isPending || (!!session && !actor)

  return {
    actor: actor ?? fallback,
    isActorPending,
    isPending,
    session,
  }
}

export function dashboardPathForSession(
  session: AppSession | null | undefined,
) {
  const actor = actorFromSession(session)

  if (actor === 'director') return '/dashboard'
  if (actor === 'journalist') return '/journalist'
  if (actor === 'watcher') return '/watcher-applications'
  if (actor === 'citizen') return '/citizen'

  return '/'
}

export function sessionRoleLabel(
  session: AppSession | null | undefined,
  actor: Actor,
) {
  if (!session) return actorLabels[actor]

  if (session.user.actorRole === 'CITIZEN') {
    return formatCitizenType(session.user.citizenType)
  }

  return formatUserRole(session.user.actorRole)
}

export function inferActor(pathname: string): Actor {
  if (pathname.includes('journalists')) return 'admin'
  if (
    pathname.includes('publications') ||
    pathname.includes('investigations')
  ) {
    return 'director'
  }
  if (pathname.includes('reports') || pathname.includes('watcher')) {
    return 'watcher'
  }
  if (pathname.includes('citizen')) return 'citizen'
  if (pathname === '/' || pathname.includes('auth')) return 'guest'

  return 'journalist'
}
