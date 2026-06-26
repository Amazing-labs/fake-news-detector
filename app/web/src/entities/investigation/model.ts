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
  /** Assigned journalist name, resolved server-side. */
  journalistName: string | null
  createdAt: string
  updatedAt: string
}

export type InvestigationList = {
  items: InvestigationItem[]
  total: number
}
