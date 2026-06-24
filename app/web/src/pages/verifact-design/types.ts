import type { LucideIcon } from 'lucide-react'

export type Actor =
  | 'guest'
  | 'citizen'
  | 'watcher'
  | 'journalist'
  | 'director'
  | 'admin'

export type PageKind =
  | 'dashboard'
  | 'subjects'
  | 'reports'
  | 'investigations'
  | 'publications'
  | 'people'
  | 'notifications'
  | 'profile'
  | 'auth'
  | 'create-subject'
  | 'correction'

export type NavItem = {
  label: string
  to: string
  icon: LucideIcon
  badge?: string
}

export type RoleCard = {
  actor: Actor
  title: string
  description: string
  metric?: string
  icon: LucideIcon
}

export type TabConfig = {
  value: string
  label: string
  icon: LucideIcon
}
