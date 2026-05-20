export type JournalistWorkspaceSummary = {
  inboxSubjectCount: number
  investigationCount: number
  pendingReviewCount: number
}

export type JournalistItem = {
  id: string
  name: string
  email: string
  status: string
  engagementScore: number
  activeInvestigationsCount: number
  statusReason: string | null
  statusReasonDetails: string | null
  createdAt: string
  updatedAt: string
}

export type JournalistList = {
  items: JournalistItem[]
  total: number
}
