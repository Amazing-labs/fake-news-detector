import type { ElementType } from 'react'
import {
  AlignLeft,
  FileText,
  Film,
  Image as ImageIcon,
  Link2,
  Music2,
  Newspaper,
  Shield,
  User,
  Users,
} from 'lucide-react'

export const ORIGIN_CONFIG = {
  CITIZEN_REPORT: {
    badgeClass:
      'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300',
    Icon: User,
  },
  DIRECTOR_INITIATED: {
    badgeClass:
      'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300',
    Icon: Shield,
  },
  JOURNALIST_PROOF: {
    badgeClass:
      'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300',
    Icon: Newspaper,
  },
  WATCHER: {
    badgeClass:
      'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300',
    Icon: Users,
  },
} as const

export const MEDIA_TYPE_ICONS: Record<string, ElementType> = {
  IMAGE: ImageIcon,
  VIDEO: Film,
  AUDIO: Music2,
  DOCUMENT: FileText,
  LINK: Link2,
  TEXT: AlignLeft,
}

export const CATEGORY_OPTIONS = [
  ['CONTEXT_COLLAPSE', 'Contexte déplacé'],
  ['MANIPULATED', 'Manipulé'],
  ['FABRICATED', 'Fabriqué'],
  ['SATIRE', 'Satire'],
  ['MISLEADING', 'Trompeur'],
  ['IMPOSTOR', 'Usurpation'],
  ['OTHER', 'Autre'],
]

export const RELIABILITY_OPTIONS = [
  ['TRUE', 'Vrai'],
  ['FALSE', 'Faux'],
  ['MISLEADING', 'Trompeur'],
  ['UNVERIFIABLE', 'Non vérifiable'],
]

export const SOURCE_TYPE_OPTIONS = [
  ['OFFICIAL_DECREE', 'Décision officielle'],
  ['ORIGINAL_RETRACTION', 'Rectificatif original'],
  ['DIRECT_EVIDENCE', 'Preuve directe'],
  ['MEDIA_CROSSCHECK', 'Recoupement média'],
  ['AUTHORITY_STATEMENT', "Déclaration d'autorité"],
]

export const MEDIA_TYPE_OPTIONS = [
  ['LINK', 'Lien'],
  ['IMAGE', 'Image'],
  ['VIDEO', 'Vidéo'],
  ['DOCUMENT', 'Document'],
  ['AUDIO', 'Audio'],
  ['TEXT', 'Texte'],
]

export const SELECT_CLASS =
  'border-input bg-background ring-offset-background focus-visible:ring-ring h-10 w-full rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
