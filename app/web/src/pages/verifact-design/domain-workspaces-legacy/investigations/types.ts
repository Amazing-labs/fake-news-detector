import type {
  InvestigationStatus,
  MediaCategory,
  MediaOrigin,
  MediaType,
  SourceType,
  Verdict,
} from '@entities/investigation/schemas'

export type SourceMedia = {
  title: string
  type: MediaType
  url?: string
  origin: Extract<MediaOrigin, 'CITIZEN_REPORT' | 'DIRECTOR_INITIATED'>
  reliability: Verdict
  category: MediaCategory
  justification: string
}

export type SourceGroup = {
  origin: Extract<MediaOrigin, 'CITIZEN_REPORT' | 'DIRECTOR_INITIATED'>
  submitterNote?: string
  media: SourceMedia[]
}

export type JournalistProofMedia = {
  title: string
  type: MediaType
  origin: Extract<MediaOrigin, 'JOURNALIST_PROOF'>
  authoritySource: string
  sourceType: SourceType
  url?: string
}

export type WatcherEvidenceMedia = {
  url: string
  type: MediaType
  category?: MediaCategory
  reliability?: Verdict
  justification?: string
}

export type WatcherEvidenceItem = {
  title: string
  watcher: string
  media: WatcherEvidenceMedia[]
  note: string
}

export type Dossier = {
  id: string
  title: string
  subject: string
  journalist: string
  status: InvestigationStatus
  category: MediaCategory
  verdict: Verdict
  attempts: number
  updatedAt: string
  notes: string
}
