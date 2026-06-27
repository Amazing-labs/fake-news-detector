import type {
  InvestigationStatus,
  MediaCategory,
  MediaOrigin,
  MediaType,
  SourceType,
  Verdict,
} from '@entities/investigation/schemas'

export type SourceMedia = {
  id: number
  type: MediaType
  url?: string
  origin: Extract<MediaOrigin, 'CITIZEN_REPORT' | 'DIRECTOR_INITIATED'>
  reliability: Verdict | null
  category: MediaCategory | null
  justification: string | null
}

export type SourceGroup = {
  origin: Extract<MediaOrigin, 'CITIZEN_REPORT' | 'DIRECTOR_INITIATED'>
  media: SourceMedia[]
}

export type JournalistProofMedia = {
  id: number
  type: MediaType
  origin: Extract<MediaOrigin, 'JOURNALIST_PROOF'>
  authoritySource: string | null
  sourceType: SourceType | null
  url?: string
}

export type WatcherEvidenceMedia = {
  url: string
  type: MediaType
  category?: MediaCategory | null
  reliability?: Verdict | null
  justification?: string | null
}

export type WatcherEvidenceItem = {
  id: string
  title: string
  watcher: string | null
  media: WatcherEvidenceMedia[]
  note: string
}

export type Dossier = {
  id: string
  title: string
  subject: string
  journalist: string | null
  status: InvestigationStatus
  category: MediaCategory | null
  verdict: Verdict
  attempts: number
  updatedAt: string
  notes: string
}
