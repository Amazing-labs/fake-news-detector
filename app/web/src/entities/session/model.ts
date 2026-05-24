import {
  createElement,
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { authClient, type AppSession } from '../../lib/auth-client'
import {
  clearFrontendBypassSession,
  readFrontendBypassSession,
  subscribeToFrontendBypassSession,
} from '../../shared/session/frontend-auth-bypass'

export type UserRole = 'CITIZEN' | 'JOURNALIST' | 'EDITORIAL_DIRECTOR'

type AppSessionController = {
  session: AppSession | null
  isPending: boolean
  isRefetching: boolean
  error: string | null
  refetch: () => Promise<void>
  signOut: () => Promise<void>
}

const AppSessionContext = createContext<AppSessionController | null>(null)

function mapFetchedSession(value: unknown): AppSession | null {
  if (!value) {
    return null
  }

  return {
    ...(value as AppSession),
    meta: {
      authSource: 'better-auth',
    },
  }
}

function useFrontendBypassSession() {
  return useSyncExternalStore(
    subscribeToFrontendBypassSession,
    readFrontendBypassSession,
    () => null,
  )
}

function FrontendBypassSessionProvider(props: {
  session: AppSession
  children: ReactNode
}) {
  const value: AppSessionController = {
    session: props.session,
    isPending: false,
    isRefetching: false,
    error: null,
    async refetch() {
      return
    },
    async signOut() {
      clearFrontendBypassSession()
      try {
        await authClient.signOut()
      } catch {
        return
      }
    },
  }

  return createElement(AppSessionContext.Provider, {
    value,
    children: props.children,
  })
}

function BetterAuthSessionProvider(props: { children: ReactNode }) {
  const query = authClient.useSession()

  const value: AppSessionController = {
    session: mapFetchedSession(query.data),
    isPending: query.isPending,
    isRefetching: query.isRefetching,
    error: query.error?.message ?? null,
    async refetch() {
      await query.refetch()
    },
    async signOut() {
      await authClient.signOut()
      await query.refetch()
    },
  }

  return createElement(AppSessionContext.Provider, {
    value,
    children: props.children,
  })
}

export function AppSessionProvider(props: { children: ReactNode }) {
  const bypassSession = useFrontendBypassSession()

  if (bypassSession) {
    return createElement(FrontendBypassSessionProvider, {
      session: bypassSession,
      children: props.children,
    })
  }

  return createElement(BetterAuthSessionProvider, {
    children: props.children,
  })
}

export function useAppSession() {
  const context = useContext(AppSessionContext)

  if (!context) {
    throw new Error('useAppSession must be used within an AppSessionProvider.')
  }

  return context
}

export function hasRole(session: AppSession | null, roles: UserRole[]) {
  const role = session?.user.actorRole as UserRole | undefined
  return !!role && roles.includes(role)
}
