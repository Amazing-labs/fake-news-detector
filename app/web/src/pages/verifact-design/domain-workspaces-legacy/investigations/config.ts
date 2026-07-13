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

// Origin is context, not state: it is told by an icon and a label. Colour stays
// reserved for where the work stands (see StatusBadge), so the two vocabularies
// never contradict each other on the same media card.
export const ORIGIN_CONFIG = {
  CITIZEN_REPORT: { Icon: User },
  DIRECTOR_INITIATED: { Icon: Shield },
  JOURNALIST_PROOF: { Icon: Newspaper },
  WATCHER: { Icon: Users },
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
