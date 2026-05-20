import type { UserRole } from '../../entities/session/model'
import type { AppSession } from '../../lib/auth-client'

export type NavigationItem = {
  to: string
  label: string
  roles?: UserRole[]
  publicOnly?: boolean
}

const navigation: NavigationItem[] = [
  { to: '/', label: 'Accueil' },
  { to: '/auth', label: 'Connexion', publicOnly: true },
  { to: '/citizen', label: 'Citoyen', roles: ['CITIZEN'] },
  { to: '/journalist', label: 'Journaliste', roles: ['JOURNALIST'] },
  {
    to: '/dashboard',
    label: 'Tableau de bord',
    roles: ['EDITORIAL_DIRECTOR'],
  },
  {
    to: '/reports',
    label: 'Signalements',
    roles: ['CITIZEN'],
  },
  {
    to: '/watcher-applications',
    label: 'Vigies',
    roles: ['CITIZEN', 'EDITORIAL_DIRECTOR'],
  },
  {
    to: '/inbox-subjects',
    label: 'Sujets',
    roles: ['JOURNALIST', 'EDITORIAL_DIRECTOR'],
  },
  {
    to: '/investigations',
    label: 'Enquetes',
    roles: ['CITIZEN', 'JOURNALIST', 'EDITORIAL_DIRECTOR'],
  },
  {
    to: '/publications/list',
    label: 'Publications',
    roles: ['CITIZEN', 'JOURNALIST', 'EDITORIAL_DIRECTOR'],
  },
  {
    to: '/journalists/list',
    label: 'Utilisateurs',
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

export function getNavigationForSession(
  session: AppSession | null | undefined,
) {
  const role = session?.user.actorRole as UserRole | undefined

  return navigation.filter((item) => {
    if (item.publicOnly) {
      return !session
    }

    if (!item.roles) {
      return true
    }

    return !!role && item.roles.includes(role)
  })
}
