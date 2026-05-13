import type { AppSession } from '../../lib/auth-client'
import type { UserRole } from '../../entities/session/model'

export type NavigationItem = {
  to: string
  label: string
  roles?: UserRole[]
}

const navigation: NavigationItem[] = [
  { to: '/', label: 'Accueil' },
  { to: '/citizen', label: 'Citoyen', roles: ['CITIZEN'] },
  { to: '/journalist', label: 'Journaliste', roles: ['JOURNALIST'] },
  { to: '/dashboard', label: 'Dashboard', roles: ['EDITORIAL_DIRECTOR'] },
  {
    to: '/reports',
    label: 'Signalements',
    roles: ['CITIZEN'],
  },
  {
    to: '/watcher-applications',
    label: 'Vigie',
    roles: ['CITIZEN', 'EDITORIAL_DIRECTOR'],
  },
  {
    to: '/inbox-subjects',
    label: 'Inbox',
    roles: ['JOURNALIST', 'EDITORIAL_DIRECTOR'],
  },
  {
    to: '/investigations',
    label: 'Enquêtes',
    roles: ['CITIZEN', 'JOURNALIST', 'EDITORIAL_DIRECTOR'],
  },
  {
    to: '/publications',
    label: 'Publications',
    roles: ['CITIZEN', 'JOURNALIST', 'EDITORIAL_DIRECTOR'],
  },
  {
    to: '/journalists',
    label: 'Journalistes',
    roles: ['EDITORIAL_DIRECTOR'],
  },
  {
    to: '/notifications',
    label: 'Notifications',
    roles: ['CITIZEN', 'JOURNALIST', 'EDITORIAL_DIRECTOR'],
  },
  {
    to: '/profile',
    label: 'Profil',
    roles: ['CITIZEN', 'JOURNALIST', 'EDITORIAL_DIRECTOR'],
  },
]

export function getNavigationForSession(session: AppSession | null) {
  const role = session?.user.actorRole as UserRole | undefined

  return navigation.filter((item) => {
    if (!item.roles) {
      return true
    }

    return !!role && item.roles.includes(role)
  })
}
