export type InvestigationItem = {
  id: string
  inboxSubjectId: string
  journalistId: string
  mediaCategory: string | null
  draftVerdict: string | null
  investigationNotes: string | null
  attemptCount: number
  status: string
  createdAt: string
  updatedAt: string
}

export type InvestigationList = {
  items: InvestigationItem[]
  total: number
}
