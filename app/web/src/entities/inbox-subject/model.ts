export type InboxSubjectItem = {
  id: string
  theme: string
  description: string
  createdById: string
  reportId: string | null
  status: string
  origin: string
  /** Name of the journalist handling the linked investigation, if any. */
  ownerName: string | null
  createdAt: string
  updatedAt: string
}

export type InboxSubjectList = {
  items: InboxSubjectItem[]
  total: number
}
