import { createAuthClient } from 'better-auth/react'

function resolveAuthBaseUrl(): string {
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'http://localhost:5173'
  const authPath = import.meta.env.VITE_AUTH_BASE_URL || '/api/auth'
  return new URL(authPath, origin).toString()
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
    citizenType?: string | null
  }
}
