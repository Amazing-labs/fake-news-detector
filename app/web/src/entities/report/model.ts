import type { InboxSubjectStatus } from '@entities/inbox-subject/api'

export type ReportItem = {
  id: string
  citizenId: string
  theme: string
  title: string
  content: string
  status: string
  /** Reporting citizen name, resolved server-side. */
  reporterName: string | null
  /**
   * Status of the InboxSubject this report was converted into, joined
   * server-side. Lets the citizen follow the editorial lifecycle
   * (OPEN -> IN_PROGRESS -> ARCHIVED). Null when no subject exists yet.
   */
  subjectStatus: InboxSubjectStatus | null
  createdAt: string
  updatedAt: string
}

export type ReportList = {
  items: ReportItem[]
  total: number
}

export type ReportMediaItem = {
  id: number
  url: string
  type: string
  order: number
  origin: string
  uploadedById: string
  createdAt: string
  updatedAt: string
}

export type ReportMediaList = {
  items: ReportMediaItem[]
  total: number
}
