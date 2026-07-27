import type {
  EvidenceView,
  InvestigationMediaView,
} from '../investigation/model'

export type PublicationItem = {
  id: string
  investigationId: string
  approvedById: string
  finalVerdict: string
  /**
   * Editorial statement the director signed the publication off with. `null`
   * for publications released before the statement became mandatory — those
   * were never signed, so nothing is attributed to anyone.
   */
  publicationNotes: string | null
  publishedAt: string
  isCorrection: boolean
  /** Linked investigation's inbox subject theme, resolved server-side. */
  title: string | null
  verifiedLinks: Array<{
    id: number
    url: string
    authoritySourceId: string | null
    /** Authority source name, resolved server-side. */
    authoritySourceName: string | null
  }>
  verifiedMedia: Array<{
    id: number
    url: string
    type: string
    order: number
    authoritySourceId: string | null
    /** Authority source name, resolved server-side. */
    authoritySourceName: string | null
  }>
  createdAt: string
  updatedAt: string
}

export type PublicationList = {
  items: PublicationItem[]
  total: number
}

/**
 * The full editorial trail behind a publication. Carries no actor identifier:
 * contributions are attributed through `credits` and the watcher display name,
 * so the citizen who filed the originating report stays anonymous.
 */
export type PublicationDossier = PublicationItem & {
  /** Description of the inbox subject the investigation was opened on. */
  subject: string | null
  /** The journalist's investigation notes. */
  investigationNotes: string
  media: InvestigationMediaView[]
  evidence: EvidenceView[]
  credits: {
    journalistName: string | null
    directorName: string | null
    watcherNames: string[]
  }
}

export type CorrectionItem = {
  id: string
  publicationId: string
  notificationId: string | null
  title: string
  content: string
  correctedById: string
  createdAt: string
  updatedAt: string
}

export type CorrectionList = {
  items: CorrectionItem[]
  total: number
}
