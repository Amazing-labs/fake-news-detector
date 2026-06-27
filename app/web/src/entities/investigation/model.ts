import type { SourceType } from './schemas'

export type InvestigationItem = {
  id: string
  inboxSubjectId: string
  journalistId: string
  mediaCategory: string | null
  draftVerdict: string | null
  investigationNotes: string | null
  attemptCount: number
  status: string
  /** Linked inbox subject theme, resolved server-side. */
  title: string | null
  /** Linked inbox subject description, resolved server-side. */
  subject: string | null
  /** Assigned journalist name, resolved server-side. */
  journalistName: string | null
  createdAt: string
  updatedAt: string
}

export type InvestigationList = {
  items: InvestigationItem[]
  total: number
}

export type InvestigationMediaItem = {
  id: number
  url: string
  type: string
  order: number
  origin: string
  investigationId: string
  uploadedById: string
  category: string | null
  reliability: string | null
  justification: string | null
  authoritySourceId: string | null
  /** Authority source name, resolved server-side. */
  authoritySourceName: string | null
  /** Authority source type, resolved server-side. */
  authoritySourceType: SourceType | null
  createdAt: string
  updatedAt: string
}

export type InvestigationMediaList = {
  items: InvestigationMediaItem[]
  total: number
}

export type EvidenceMediaItem = {
  id: number
  url: string
  type: string
  order: number
  evidenceId: string
  uploadedById: string
  category: string | null
  reliability: string | null
  justification: string | null
  createdAt: string
  updatedAt: string
}

export type EvidenceItem = {
  id: string
  title: string
  content: string
  investigationId: string
  watcherId: string
  /** Watcher (author) name, resolved server-side. */
  watcherName: string | null
  media: EvidenceMediaItem[]
  createdAt: string
  updatedAt: string
}

export type EvidenceList = {
  items: EvidenceItem[]
  total: number
}
