import { createAuthClient } from 'better-auth/react'

function resolveAuthBaseUrl(): string {
  const configured = import.meta.env.VITE_AUTH_BASE_URL
  if (configured) {
    return new URL(
      configured,
      typeof window !== 'undefined'
        ? window.location.origin
        : 'http://localhost:5173',
    ).toString()
  }

  if (typeof window !== 'undefined') {
    return new URL('/api/auth', window.location.origin).toString()
  }

  return 'http://localhost:5173/api/auth'
}

export const authClient = createAuthClient({
  baseURL: resolveAuthBaseUrl(),
  fetchOptions: {
    credentials: 'include',
  },
})

export interface AppSession {
  session: {
    id: string
    userId: string
    expiresAt: string
  }
  user: {
    id: string
    name: string
    email: string
    image?: string | null
    actorId?: string | null
    actorRole?: string | null
    actorStatus?: string | null
  }
}
