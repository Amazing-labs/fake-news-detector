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
    id: string
    url: string
    authoritySourceId: string | null
  }>
  verifiedMedia: Array<{
    id: number
    url: string
    type: string
    order: number
    authoritySourceId: string | null
  }>
  createdAt: string
  updatedAt: string
}

export type PublicationList = {
  items: PublicationItem[]
  total: number
}
