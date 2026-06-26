export type ReportItem = {
  id: string
  citizenId: string
  theme: string
  title: string
  content: string
  status: string
  /** Reporting citizen name, resolved server-side. */
  reporterName: string | null
  createdAt: string
  updatedAt: string
}

export type ReportList = {
  items: ReportItem[]
  total: number
}
