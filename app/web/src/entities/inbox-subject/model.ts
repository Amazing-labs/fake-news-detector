export type InboxSubjectItem = {
  id: string
  theme: string
  description: string
  createdById: string
  reportId: string | null
  status: string
  origin: string
  createdAt: string
  updatedAt: string
}

export type InboxSubjectList = {
  items: InboxSubjectItem[]
  total: number
}
