/** Role-scoped dashboard KPIs returned by GET /api/dashboard/metrics. */
export type ActorMetrics =
  | {
      profile: 'director'
      openSubjects: number
      inProgressInvestigations: number
      pendingReviews: number
      publishedCount: number
    }
  | {
      profile: 'journalist'
      currentDossiers: number
      pendingReviews: number
      directorReturns: number
    }
  | {
      profile: 'citizen'
      activeReports: number
      awaitingReply: number
      repliesReceived: number
      corrections: number
    }
  | {
      profile: 'watcher'
      followedInvestigations: number
      evidenceThisMonth: number
      acceptedContributions: number
    }

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
