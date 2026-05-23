import type { AppSession } from '../../lib/auth-client'

export type FrontendBypassAccountId =
  | 'director'
  | 'journalist'
  | 'citizen'
  | 'watcher'

type FrontendBypassAccountDefinition = {
  id: FrontendBypassAccountId
  label: string
  description: string
  session: AppSession
}

const FRONTEND_AUTH_BYPASS_STORAGE_KEY = 'frontend-auth-bypass-session'
const FRONTEND_AUTH_BYPASS_EVENT = 'frontend-auth-bypass-changed'

const FRONTEND_AUTH_BYPASS_ENABLED =
  import.meta.env.DEV ||
  import.meta.env.VITE_ENABLE_FRONTEND_AUTH_BYPASS === 'true'

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000

function createBypassSession(definition: {
  userId: string
  name: string
  email: string
  actorId: string
  actorRole: 'CITIZEN' | 'JOURNALIST' | 'EDITORIAL_DIRECTOR'
  actorStatus?: 'ACTIVE' | 'DISABLED' | 'BANNED'
  citizenType?: 'REGULAR' | 'WATCHER' | null
}): AppSession {
  return {
    meta: {
      authSource: 'frontend-bypass',
    },
    session: {
      id: `frontend-bypass-${definition.userId}`,
      userId: definition.userId,
      expiresAt: new Date(Date.now() + ONE_DAY_IN_MS).toISOString(),
    },
    user: {
      id: definition.userId,
      name: definition.name,
      email: definition.email,
      actorId: definition.actorId,
      actorRole: definition.actorRole,
      actorStatus: definition.actorStatus ?? 'ACTIVE',
      citizenType: definition.citizenType ?? null,
    },
  }
}

export const FRONTEND_BYPASS_ACCOUNTS: FrontendBypassAccountDefinition[] = [
  {
    id: 'director',
    label: 'Directeur',
    description: 'Session frontend-only pour l’espace direction éditoriale.',
    session: createBypassSession({
      userId: 'frontend-director',
      name: 'Direction éditoriale',
      email: 'frontend-director@local.test',
      actorId: 'actor-director-bypass',
      actorRole: 'EDITORIAL_DIRECTOR',
    }),
  },
  {
    id: 'journalist',
    label: 'Journaliste',
    description: 'Session frontend-only pour l’espace journaliste.',
    session: createBypassSession({
      userId: 'frontend-journalist',
      name: 'Journaliste frontend',
      email: 'frontend-journalist@local.test',
      actorId: 'actor-journalist-bypass',
      actorRole: 'JOURNALIST',
    }),
  },
  {
    id: 'citizen',
    label: 'Citoyen',
    description: 'Session frontend-only pour un citoyen standard.',
    session: createBypassSession({
      userId: 'frontend-citizen',
      name: 'Citoyen frontend',
      email: 'frontend-citizen@local.test',
      actorId: 'actor-citizen-bypass',
      actorRole: 'CITIZEN',
      citizenType: 'REGULAR',
    }),
  },
  {
    id: 'watcher',
    label: 'Citoyen vigie',
    description: 'Session frontend-only pour un citoyen de type vigie.',
    session: createBypassSession({
      userId: 'frontend-watcher',
      name: 'Vigie frontend',
      email: 'frontend-watcher@local.test',
      actorId: 'actor-watcher-bypass',
      actorRole: 'CITIZEN',
      citizenType: 'WATCHER',
    }),
  },
]

function notifyFrontendBypassSessionChanged() {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new Event(FRONTEND_AUTH_BYPASS_EVENT))
}

export function isFrontendAuthBypassEnabled(): boolean {
  return FRONTEND_AUTH_BYPASS_ENABLED
}

export function getFrontendBypassAccountById(
  accountId: FrontendBypassAccountId,
): FrontendBypassAccountDefinition | undefined {
  return FRONTEND_BYPASS_ACCOUNTS.find((account) => account.id === accountId)
}

export function readFrontendBypassSession(): AppSession | null {
  if (
    !FRONTEND_AUTH_BYPASS_ENABLED ||
    typeof window === 'undefined'
  ) {
    return null
  }

  const rawValue = window.localStorage.getItem(FRONTEND_AUTH_BYPASS_STORAGE_KEY)
  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue) as AppSession
  } catch {
    window.localStorage.removeItem(FRONTEND_AUTH_BYPASS_STORAGE_KEY)
    return null
  }
}

export function activateFrontendBypassAccount(
  accountId: FrontendBypassAccountId,
): AppSession | null {
  if (
    !FRONTEND_AUTH_BYPASS_ENABLED ||
    typeof window === 'undefined'
  ) {
    return null
  }

  const account = getFrontendBypassAccountById(accountId)
  if (!account) {
    return null
  }

  window.localStorage.setItem(
    FRONTEND_AUTH_BYPASS_STORAGE_KEY,
    JSON.stringify(account.session),
  )
  notifyFrontendBypassSessionChanged()
  return account.session
}

export function clearFrontendBypassSession(): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(FRONTEND_AUTH_BYPASS_STORAGE_KEY)
  notifyFrontendBypassSessionChanged()
}

export function subscribeToFrontendBypassSession(
  onChange: () => void,
): () => void {
  if (typeof window === 'undefined') {
    return () => undefined
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === FRONTEND_AUTH_BYPASS_STORAGE_KEY) {
      onChange()
    }
  }

  window.addEventListener(FRONTEND_AUTH_BYPASS_EVENT, onChange)
  window.addEventListener('storage', handleStorage)

  return () => {
    window.removeEventListener(FRONTEND_AUTH_BYPASS_EVENT, onChange)
    window.removeEventListener('storage', handleStorage)
  }
}
