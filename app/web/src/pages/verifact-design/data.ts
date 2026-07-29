import {
  Bell,
  BookOpenCheck,
  Circle,
  FilePlus2,
  FileSearch,
  Inbox,
  LayoutDashboard,
  Newspaper,
  ShieldCheck,
  Users,
} from 'lucide-react'
import type { Actor, NavItem, RoleCard } from './types'

export const actorLabels: Record<Actor, string> = {
  guest: 'Invité',
  citizen: 'Citoyen',
  watcher: 'Vigie',
  journalist: 'Journaliste',
  director: 'Directeur',
  admin: 'Admin',
}

export const navItems: NavItem[] = [
  { label: 'Tableau de bord', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Sujets', to: '/inbox-subjects/global', icon: Inbox },
  { label: 'Signalements', to: '/reports', icon: FileSearch },
  { label: 'Enquêtes', to: '/investigations', icon: ShieldCheck },
  { label: 'Vigies', to: '/watcher-applications', icon: BookOpenCheck },
  {
    label: 'Publications',
    to: '/publications/list',
    icon: Newspaper,
    children: [
      { label: 'Vrai', to: '/publications/list', icon: Circle, search: { verdict: 'TRUE' } },
      { label: 'Faux', to: '/publications/list', icon: Circle, search: { verdict: 'FALSE' } },
      {
        label: 'Trompeur',
        to: '/publications/list',
        icon: Circle,
        search: { verdict: 'MISLEADING' },
      },
      {
        label: 'Non vérifiable',
        to: '/publications/list',
        icon: Circle,
        search: { verdict: 'UNVERIFIABLE' },
      },
    ],
  },
  { label: 'Utilisateurs', to: '/journalists/list', icon: Users },
  { label: 'Notifications', to: '/notifications', icon: Bell },
]

export const navByActor: Record<Actor, string[]> = {
  guest: ['Tableau de bord'],
  citizen: [
    'Tableau de bord',
    'Signalements',
    'Vigies',
    'Publications',
    'Notifications',
  ],
  watcher: [
    'Tableau de bord',
    'Vigies',
    'Signalements',
    'Publications',
    'Notifications',
  ],
  journalist: [
    'Tableau de bord',
    'Sujets',
    'Enquêtes',
    'Publications',
    'Notifications',
  ],
  director: [
    'Tableau de bord',
    'Vigies',
    'Sujets',
    'Enquêtes',
    'Publications',
    'Utilisateurs',
    'Notifications',
  ],
  admin: ['Tableau de bord', 'Utilisateurs', 'Notifications'],
}

export const roleCards: RoleCard[] = [
  {
    actor: 'citizen',
    title: 'Citoyen',
    description:
      'Déposer un signalement, suivre son état et recevoir les corrections.',
    icon: FilePlus2,
  },
  {
    actor: 'watcher',
    title: 'Vigie',
    description:
      'Qualifier les sujets entrants et documenter les premières preuves.',
    icon: FileSearch,
  },
  {
    actor: 'journalist',
    title: 'Journaliste',
    description:
      'Conduire les enquêtes, recouper les sources et préparer la note.',
    icon: BookOpenCheck,
  },
  {
    actor: 'director',
    title: 'Directeur',
    description:
      'Arbitrer, publier, demander un correctif ou archiver un dossier.',
    icon: ShieldCheck,
  },
]
