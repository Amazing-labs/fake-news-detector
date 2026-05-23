import { useSyncExternalStore } from 'react'
import { authClient, type AppSession } from '../../lib/auth-client'
import {
  clearFrontendBypassSession,
  readFrontendBypassSession,
  subscribeToFrontendBypassSession,
} from '../../shared/session/frontend-auth-bypass'

export type UserRole = 'CITIZEN' | 'JOURNALIST' | 'EDITORIAL_DIRECTOR'

type AppSessionState = {
  session: AppSession | null
  isPending: boolean
  isRefetching: boolean
  error: string | null
}

const INITIAL_APP_SESSION_STATE: AppSessionState = {
  session: null,
  isPending: true,
  isRefetching: false,
  error: null,
}

let betterAuthSessionState: AppSessionState = INITIAL_APP_SESSION_STATE
let hasLoadedBetterAuthSession = false

const betterAuthSessionListeners = new Set<() => void>()

function emitBetterAuthSessionChange() {
  betterAuthSessionListeners.forEach((listener) => {
    listener()
  })
}

function updateBetterAuthSessionState(nextState: AppSessionState) {
  betterAuthSessionState = nextState
  emitBetterAuthSessionChange()
}

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

async function refreshBetterAuthSession(isRefetch: boolean) {
  updateBetterAuthSessionState({
    ...betterAuthSessionState,
    isPending: !hasLoadedBetterAuthSession && !isRefetch,
    isRefetching: isRefetch,
    error: null,
  })

  try {
    const result = await authClient.getSession()

    hasLoadedBetterAuthSession = true
    updateBetterAuthSessionState({
      session: mapFetchedSession(result.data),
      isPending: false,
      isRefetching: false,
      error: result.error?.message ?? null,
    })
  } catch (error) {
    hasLoadedBetterAuthSession = true
    updateBetterAuthSessionState({
      session: null,
      isPending: false,
      isRefetching: false,
      error:
        error instanceof Error
          ? error.message
          : 'Impossible de recuperer la session.',
    })
  }
}

function subscribeToBetterAuthSession(onChange: () => void): () => void {
  betterAuthSessionListeners.add(onChange)

  if (!hasLoadedBetterAuthSession && betterAuthSessionListeners.size === 1) {
    void refreshBetterAuthSession(false)
  }

  return () => {
    betterAuthSessionListeners.delete(onChange)
  }
}

function getBetterAuthSessionSnapshot() {
  return betterAuthSessionState
}

function useBetterAuthSessionStore() {
  return useSyncExternalStore(
    subscribeToBetterAuthSession,
    getBetterAuthSessionSnapshot,
    () => INITIAL_APP_SESSION_STATE,
  )
}

function useFrontendBypassSession() {
  return useSyncExternalStore(
    subscribeToFrontendBypassSession,
    readFrontendBypassSession,
    () => null,
  )
}

export function useAppSession() {
  const bypassSession = useFrontendBypassSession()
  const betterAuthState = useBetterAuthSessionStore()

  return {
    session: bypassSession ?? betterAuthState.session,
    isPending: bypassSession ? false : betterAuthState.isPending,
    isRefetching: bypassSession ? false : betterAuthState.isRefetching,
    error: betterAuthState.error,
    async refetch() {
      if (bypassSession) {
        return
      }

      await refreshBetterAuthSession(true)
    },
    async signOut() {
      if (bypassSession) {
        clearFrontendBypassSession()
        return
      }

      await authClient.signOut()
      await refreshBetterAuthSession(false)
    },
  }
}

export function hasRole(session: AppSession | null, roles: UserRole[]) {
  const role = session?.user.actorRole as UserRole | undefined
  return !!role && roles.includes(role)
}
