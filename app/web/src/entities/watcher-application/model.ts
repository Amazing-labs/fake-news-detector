export type WatcherApplicationItem = {
  id: string
  actorId: string
  motivation: string
  status: string
  /** Applicant name, resolved server-side. */
  applicantName: string | null
  createdAt: string
  updatedAt: string
}

export type WatcherApplicationList = {
  items: WatcherApplicationItem[]
  total: number
}
