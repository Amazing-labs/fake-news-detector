import type { AppSession } from '../../lib/auth-client'

export type UserRole = 'CITIZEN' | 'JOURNALIST' | 'EDITORIAL_DIRECTOR'

const roleLabels: Record<UserRole, string> = {
  CITIZEN: 'Citoyen',
  JOURNALIST: 'Journaliste',
  EDITORIAL_DIRECTOR: 'Direction editoriale',
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

export function useAppSession() {
  return {
    data: null,
    error: null,
    isPending: false,
    session: null as AppSession | null,
  }
}

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
  return roleLabels[role as UserRole] ?? fallbackLabel(role, 'Invite')
}

export function formatActorStatus(status: string | null | undefined) {
  return statusLabels[status ?? ''] ?? fallbackLabel(status)
}

export function formatCitizenType(type: string | null | undefined) {
  return citizenTypeLabels[type ?? ''] ?? fallbackLabel(type)
}
