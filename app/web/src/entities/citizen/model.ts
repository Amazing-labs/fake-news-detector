export type CitizenWorkspaceSummary = {
  reportCount: number
  watcherApplicationCount: number
  publicationCount: number
}

export type CitizenListItem = {
  id: string
  name: string
  email: string
  status: string
  citizenType: string
  engagementScore: number
  openReportsCount: number
  statusReason: string | null
  statusReasonDetails: string | null
  createdAt: string
  updatedAt: string
}

export type CitizenList = {
  items: CitizenListItem[]
  total: number
}
