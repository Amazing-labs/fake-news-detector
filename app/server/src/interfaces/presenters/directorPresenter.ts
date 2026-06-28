import type { Investigation } from '../../domain/entities/Investigation'
import type { EnrichedDecision } from '../../application/services/FactCheckingQueryService'

export function presentDecision({ audit, title }: EnrichedDecision) {
  return {
    id: audit.id,
    investigationId: audit.investigationId,
    title,
    newStatus: audit.newStatus,
    previousStatus: audit.previousStatus,
    comment: audit.comment,
    createdAt: audit.createdAt.toISOString(),
  }
}

export function presentDecisionList(decisions: EnrichedDecision[]) {
  return {
    items: decisions.map(presentDecision),
    total: decisions.length,
  }
}

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
