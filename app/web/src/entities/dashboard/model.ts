export type { ActorMetrics } from './schemas'

export type DirectorDashboard = {
  pendingReviews: Array<{
    id: string
    inboxSubjectId: string
    journalistId: string
    draftVerdict: string | null
    status: string
    attemptCount: number
    updatedAt: string
  }>
  publishedCount: number
  totalNotifications: number
}
