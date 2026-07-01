import { z } from 'zod'

/** Role-scoped dashboard KPIs returned by GET /api/dashboard/metrics. */
export const actorMetricsSchema = z.discriminatedUnion('profile', [
  z.object({
    profile: z.literal('director'),
    openSubjects: z.number(),
    inProgressInvestigations: z.number(),
    pendingReviews: z.number(),
    publishedCount: z.number(),
    contributionScore: z.number(),
  }),
  z.object({
    profile: z.literal('journalist'),
    currentDossiers: z.number(),
    pendingReviews: z.number(),
    directorReturns: z.number(),
    contributionScore: z.number(),
  }),
  z.object({
    profile: z.literal('citizen'),
    activeReports: z.number(),
    awaitingReply: z.number(),
    repliesReceived: z.number(),
    corrections: z.number(),
    contributionScore: z.number(),
  }),
  z.object({
    profile: z.literal('watcher'),
    followedInvestigations: z.number(),
    evidenceThisMonth: z.number(),
    acceptedContributions: z.number(),
    contributionScore: z.number(),
  }),
])

export type ActorMetrics = z.infer<typeof actorMetricsSchema>
