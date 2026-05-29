import { useSyncExternalStore } from 'react'
import { isBetterAuthDisabled } from '../../lib/auth-config'
import type { AppSession } from '../../lib/auth-client'
import { authClient } from '../../lib/auth-client'

export type UserRole = 'CITIZEN' | 'JOURNALIST' | 'EDITORIAL_DIRECTOR'
export type CitizenType = 'REGULAR' | 'WATCHER'
export type LocalAuthActor = 'director' | 'journalist' | 'citizen'

const localSessionStorageKey = 'fnd-local-auth-session'
const localSessionChangedEvent = 'fnd-local-auth-session-changed'

const roleLabels: Record<UserRole, string> = {
  CITIZEN: 'Citoyen',
  JOURNALIST: 'Journaliste',
  EDITORIAL_DIRECTOR: 'Direction éditoriale',
}

const statusLabels: Record<string, string> = {
  ACTIVE: 'Actif',
  APPROVED: 'Approuve',
  PENDING: 'En attente',
  PENDING_REVIEW: 'En revue',
  REJECTED: 'Refuse',
  SUSPENDED: 'Suspendu',
}

const citizenTypeLabels: Record<string, string> = {
  CITIZEN: 'Citoyen',
  REGULAR: 'Citoyen',
  WATCHER: 'Vigie citoyenne',
}

export const localAuthActors: Array<{
  actor: LocalAuthActor
  label: string
  description: string
}> = [
  {
    actor: 'director',
    label: 'Directeur local',
    description: "Accès à l'arbitrage, aux publications et aux utilisateurs.",
  },
  {
    actor: 'journalist',
    label: 'Journaliste local',
    description: 'Accès aux sujets, enquêtes et publications.',
  },
  {
    actor: 'citizen',
    label: 'Citoyen local',
    description: 'Accès aux signalements, vigies et publications publiques.',
  },
]

const localSessions: Record<LocalAuthActor, AppSession> = {
  director: createLocalSession({
    id: 'local-director',
    name: 'Directeur local',
    email: 'directeur.local@fnd.test',
    actorRole: 'EDITORIAL_DIRECTOR',
  }),
  journalist: createLocalSession({
    id: 'local-journalist',
    name: 'Journaliste local',
    email: 'journaliste.local@fnd.test',
    actorRole: 'JOURNALIST',
  }),
  citizen: createLocalSession({
    id: 'local-citizen',
    name: 'Citoyen local',
    email: 'citoyen.local@fnd.test',
    actorRole: 'CITIZEN',
    citizenType: 'REGULAR',
  }),
}

function createLocalSession(user: {
  id: string
  name: string
  email: string
  actorRole: UserRole
  citizenType?: CitizenType
}): AppSession {
  return {
    session: {
      id: `${user.id}-session`,
      userId: user.id,
      expiresAt: new Date('2099-12-31T23:59:59.000Z').toISOString(),
    },
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      actorId: user.id,
      actorRole: user.actorRole,
      actorStatus: 'ACTIVE',
      citizenType: user.citizenType ?? null,
      image: null,
    },
  }
}

function getLocalSessionSnapshot() {
  if (typeof window === 'undefined') return null

  const actor = readLocalSessionActor()

  return actor ? (localSessions[actor] ?? null) : null
}

function subscribeToLocalSession(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {}

  const onStorage = (event: StorageEvent) => {
    if (event.key === localSessionStorageKey) {
      onStoreChange()
    }
  }

  window.addEventListener('storage', onStorage)
  window.addEventListener(localSessionChangedEvent, onStoreChange)

  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(localSessionChangedEvent, onStoreChange)
  }
}

function emitLocalSessionChange() {
  if (typeof window === 'undefined') return

  window.dispatchEvent(new Event(localSessionChangedEvent))
}

function readLocalSessionActor() {
  try {
    return window.localStorage.getItem(
      localSessionStorageKey,
    ) as LocalAuthActor | null
  } catch {
    return null
  }
}

function writeLocalSessionActor(actor: LocalAuthActor) {
  try {
    window.localStorage.setItem(localSessionStorageKey, actor)
    return true
  } catch {
    return false
  }
}

function removeLocalSessionActor() {
  try {
    window.localStorage.removeItem(localSessionStorageKey)
    return true
  } catch {
    return false
  }
}

export async function signInLocalActor(actor: LocalAuthActor) {
  if (!isBetterAuthDisabled || typeof window === 'undefined') return

  if (writeLocalSessionActor(actor)) {
    emitLocalSessionChange()
  }
}

export async function signOutAppSession() {
  if (isBetterAuthDisabled) {
    if (typeof window !== 'undefined' && removeLocalSessionActor()) {
      emitLocalSessionChange()
    }
    return
  }

  await authClient.signOut()
}

function useLocalAppSession() {
  const session = useSyncExternalStore(
    subscribeToLocalSession,
    getLocalSessionSnapshot,
    () => null,
  )

  return {
    data: session,
    session,
    isPending: false,
    error: null,
  }
}

function useBetterAuthSession() {
  const session = authClient.useSession()

  return {
    ...session,
    session: (session.data ?? null) as AppSession | null,
  }
}

export const useAppSession = isBetterAuthDisabled
  ? useLocalAppSession
  : useBetterAuthSession

export function hasRole(
  session: AppSession | null | undefined,
  roles: readonly UserRole[],
) {
  const role = session?.user.actorRole as UserRole | undefined
  return !!role && roles.includes(role)
}

function fallbackLabel(
  value: string | null | undefined,
  empty = 'Non renseigne',
) {
  if (!value) return empty

  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function formatUserRole(role: string | null | undefined) {
  return roleLabels[role as UserRole] ?? fallbackLabel(role, 'Invité')
}

export function formatActorStatus(status: string | null | undefined) {
  return statusLabels[status ?? ''] ?? fallbackLabel(status)
}

export function formatCitizenType(type: string | null | undefined) {
  return citizenTypeLabels[type ?? ''] ?? fallbackLabel(type)
}
