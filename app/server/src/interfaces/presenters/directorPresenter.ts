import type { Investigation } from '../../domain/entities/Investigation'

export function presentDirectorDashboard(input: {
  pendingReviews: Investigation[]
  publishedCount: number
  totalNotifications: number
}) {
  return {
    pendingReviews: input.pendingReviews.map((investigation) => ({
      id: investigation.id,
      inboxSubjectId: investigation.inboxSubjectId,
      journalistId: investigation.journalistId,
      draftVerdict: investigation.draftVerdict,
      status: investigation.status,
      attemptCount: investigation.attemptCount,
      updatedAt: investigation.updatedAt.toISOString(),
    })),
    publishedCount: input.publishedCount,
    totalNotifications: input.totalNotifications,
  }
}
