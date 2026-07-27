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

/**
 * Non-enriched investigation payload returned by the "pick subject" endpoint
 * (server-side `presentInvestigation`): no joined title/subject/journalist name.
 */
export type InvestigationRef = Omit<
  InvestigationItem,
  'title' | 'subject' | 'journalistName'
>

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

/**
 * The media fields the dossier views actually read. The publication dossier
 * serves the same rows stripped of every actor id (the citizen author stays
 * anonymous), so the shared adapters are typed against this subset rather than
 * the full investigation payload.
 */
export type InvestigationMediaView = Pick<
  InvestigationMediaItem,
  | 'id'
  | 'url'
  | 'type'
  | 'origin'
  | 'category'
  | 'reliability'
  | 'justification'
  | 'authoritySourceName'
  | 'authoritySourceType'
>

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

/** Evidence counterpart of {@link InvestigationMediaView}. */
export type EvidenceView = Pick<
  EvidenceItem,
  'id' | 'title' | 'content' | 'watcherName'
> & {
  media: Array<
    Pick<
      EvidenceMediaItem,
      'id' | 'url' | 'type' | 'category' | 'reliability' | 'justification'
    >
  >
}
