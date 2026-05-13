export type PublicationItem = {
  id: string
  investigationId: string
  approvedById: string
  finalVerdict: string
  publishedAt: string
  isCorrection: boolean
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
