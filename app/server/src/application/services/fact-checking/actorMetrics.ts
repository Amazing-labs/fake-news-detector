/**
 * @module
 * Dashboard KPIs scoped to the connected actor. Each role tracks different
 * counters, so the result is a union discriminated by `profile`. Definitions
 * stay strictly computable from existing aggregates — nothing here invents a
 * semantic the rest of the context does not already carry.
 */

import type {
  ICitizenRepository,
  ICorrectionRepository,
  IDirectorRepository,
  IEvidenceRepository,
  IInboxSubjectRepository,
  IInvestigationRepository,
  IJournalistRepository,
  IPublicationRepository,
  IReportRepository,
} from '../../../domain/repositories'
import type { InboxSubject } from '../../../domain/entities/InboxSubject'
import type { ActorRole } from '../../../shared/types'

/**
 * Every variant carries `contributionScore` — the actor's cumulative
 * engagement/arbitration score kept on the domain entity — so the profile page
 * can surface it uniformly regardless of role.
 */
export type ActorMetrics =
  | {
      profile: 'director'
      openSubjects: number
      inProgressInvestigations: number
      pendingReviews: number
      publishedCount: number
      contributionScore: number
    }
  | {
      profile: 'journalist'
      currentDossiers: number
      pendingReviews: number
      directorReturns: number
      contributionScore: number
    }
  | {
      profile: 'citizen'
      activeReports: number
      awaitingReply: number
      repliesReceived: number
      corrections: number
      contributionScore: number
    }
  | {
      profile: 'watcher'
      followedInvestigations: number
      evidenceThisMonth: number
      acceptedContributions: number
      contributionScore: number
    }

export interface ActorMetricsDeps {
  reportRepository: IReportRepository
  inboxSubjectRepository: IInboxSubjectRepository
  investigationRepository: IInvestigationRepository
  evidenceRepository: IEvidenceRepository
  publicationRepository: IPublicationRepository
  correctionRepository: ICorrectionRepository
  citizenRepository: ICitizenRepository
  journalistRepository: IJournalistRepository
  directorRepository: IDirectorRepository
}

/**
 * Citizens and watchers share the CITIZEN role, so the citizenType — not the
 * role — decides which of the two profiles to compute.
 */
export async function computeActorMetrics(
  deps: ActorMetricsDeps,
  actor: { actorId: string; actorRole: ActorRole },
): Promise<ActorMetrics> {
  if (actor.actorRole === 'EDITORIAL_DIRECTOR') {
    return directorMetrics(deps, actor.actorId)
  }
  if (actor.actorRole === 'JOURNALIST') {
    return journalistMetrics(deps, actor.actorId)
  }
  const citizen = await deps.citizenRepository.findById(actor.actorId)
  const contributionScore = citizen?.engagementScore ?? 0
  return citizen?.isWatcher()
    ? watcherMetrics(deps, actor.actorId, contributionScore)
    : citizenMetrics(deps, actor.actorId, contributionScore)
}

async function directorMetrics(
  deps: ActorMetricsDeps,
  directorId: string,
): Promise<ActorMetrics> {
  const [openSubjects, inProgress, pendingReviews, publishedCount, director] =
    await Promise.all([
      deps.inboxSubjectRepository.findByStatus('OPEN'),
      deps.investigationRepository.findMany({ statuses: ['IN_PROGRESS'] }),
      deps.investigationRepository.findMany({ statuses: ['PENDING_REVIEW'] }),
      deps.publicationRepository.count(),
      deps.directorRepository.findById(directorId),
    ])
  return {
    profile: 'director',
    openSubjects: openSubjects.length,
    inProgressInvestigations: inProgress.length,
    pendingReviews: pendingReviews.length,
    publishedCount,
    contributionScore: director?.scoreInvestigation ?? 0,
  }
}

async function journalistMetrics(
  deps: ActorMetricsDeps,
  journalistId: string,
): Promise<ActorMetrics> {
  const [own, journalist] = await Promise.all([
    deps.investigationRepository.findMany({ journalistId }),
    deps.journalistRepository.findById(journalistId),
  ])
  return {
    profile: 'journalist',
    currentDossiers: own.filter((i) => i.canBeEdited()).length,
    pendingReviews: own.filter((i) => i.isPendingReview()).length,
    directorReturns: own.filter((i) => i.status === 'NEEDS_REVISION').length,
    contributionScore: journalist?.engagementScore ?? 0,
  }
}

async function citizenMetrics(
  deps: ActorMetricsDeps,
  citizenId: string,
  contributionScore: number,
): Promise<ActorMetrics> {
  const reports = await deps.reportRepository.findByCitizenId(citizenId)
  const activeReports = reports.filter((r) => r.status === 'OPEN').length

  // Walk the report trail (report -> subject -> investigation -> publication
  // -> corrections) one batched query per hop instead of four reads per report,
  // then assemble each report's outcome from the lookup maps. This keeps the
  // dashboard flat as a citizen's report history grows.
  const subjects = await deps.inboxSubjectRepository.findByReportIds(
    reports.map((report) => report.id),
  )
  const subjectByReportId = new Map<string, InboxSubject>()
  for (const subject of subjects) {
    if (subject.reportId) subjectByReportId.set(subject.reportId, subject)
  }

  const investigations =
    await deps.investigationRepository.findByInboxSubjectIds(
      subjects.map((subject) => subject.id),
    )
  const investigationByInboxId = new Map(
    investigations.map((investigation) => [
      investigation.inboxSubjectId,
      investigation,
    ]),
  )

  const publicationRefs =
    await deps.publicationRepository.findRefsByInvestigationIds(
      investigations.map((investigation) => investigation.id),
    )
  const publicationByInvestigationId = new Map(
    publicationRefs.map((ref) => [ref.investigationId, ref]),
  )

  const corrections = await deps.correctionRepository.findByPublicationIds(
    publicationRefs.map((ref) => ref.id),
  )
  const correctionCountByPublicationId = new Map<string, number>()
  for (const correction of corrections) {
    correctionCountByPublicationId.set(
      correction.publicationId,
      (correctionCountByPublicationId.get(correction.publicationId) ?? 0) + 1,
    )
  }

  const trails = reports.map((report) => {
    const subject = subjectByReportId.get(report.id)
    const investigation = subject
      ? investigationByInboxId.get(subject.id)
      : undefined
    const publication = investigation
      ? publicationByInvestigationId.get(investigation.id)
      : undefined
    if (!publication) {
      return { replied: false, corrections: 0, status: report.status }
    }
    return {
      replied: true,
      corrections: correctionCountByPublicationId.get(publication.id) ?? 0,
      status: report.status,
    }
  })

  return {
    profile: 'citizen',
    activeReports,
    awaitingReply: trails.filter((t) => !t.replied && t.status === 'OPEN')
      .length,
    repliesReceived: trails.filter((t) => t.replied).length,
    corrections: trails.reduce((sum, t) => sum + t.corrections, 0),
    contributionScore,
  }
}

async function watcherMetrics(
  deps: ActorMetricsDeps,
  watcherId: string,
  contributionScore: number,
): Promise<ActorMetrics> {
  const [evidence, publishedInvestigations] = await Promise.all([
    deps.evidenceRepository.findByWatcherId(watcherId),
    deps.investigationRepository.findMany({ statuses: ['PUBLISHED'] }),
  ])
  const publishedIds = new Set(publishedInvestigations.map((i) => i.id))
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  return {
    profile: 'watcher',
    followedInvestigations: new Set(evidence.map((e) => e.investigationId))
      .size,
    evidenceThisMonth: evidence.filter((e) => e.createdAt >= startOfMonth)
      .length,
    acceptedContributions: evidence.filter((e) =>
      publishedIds.has(e.investigationId),
    ).length,
    contributionScore,
  }
}
