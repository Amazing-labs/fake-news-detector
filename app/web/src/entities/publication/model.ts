export type PublicationItem = {
  id: string
  investigationId: string
  approvedById: string
  finalVerdict: string
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
