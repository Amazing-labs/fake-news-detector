import { authClient, type AppSession } from '../../lib/auth-client'

export type UserRole = 'CITIZEN' | 'JOURNALIST' | 'EDITORIAL_DIRECTOR'

export function useAppSession() {
  const query = authClient.useSession()

  return {
    ...query,
    session: (query.data as AppSession | null) ?? null,
  }
}

export function hasRole(session: AppSession | null, roles: UserRole[]) {
  const role = session?.user.actorRole as UserRole | undefined
  return !!role && roles.includes(role)
}
