// application/services/FactCheckingQueryService.ts
//
// Read side of the fact-checking context: collection listings, single-resource
// fetch-by-id / sub-resource reads, and the director dashboard aggregation.
// Controllers delegate every read here so the interface layer stays transport
// only and the not-found rules live in the application layer.

import type {
  IAuthoritySourceRepository,
  ICitizenRepository,
  ICorrectionRepository,
  IDirectorRepository,
  IEvidenceRepository,
  IInboxSubjectMediaRepository,
  IInboxSubjectRepository,
  IInvestigationMediaRepository,
  IInvestigationRepository,
  IJournalistRepository,
  INotificationRepository,
  IPublicationRepository,
  IReportMediaRepository,
  IReportRepository,
  IWatcherApplicationRepository,
} from '../../domain/repositories'
import type { Citizen } from '../../domain/entities/Citizen'
import type { Correction } from '../../domain/entities/Correction'
import type { Director } from '../../domain/entities/Director'
import type {
  InboxSubject,
  InboxSubjectStatus,
} from '../../domain/entities/InboxSubject'
import type { Investigation } from '../../domain/entities/Investigation'
import type { Journalist } from '../../domain/entities/Journalist'
import type { Publication } from '../../domain/entities/Publication'
import type { Report } from '../../domain/entities/Report'
import type { WatcherApplication } from '../../domain/entities/WatcherApplication'
import type {
  AuthoritySource,
  SourceType,
} from '../../domain/entities/AuthoritySource'
import type {
  EvidenceMedia,
  InvestigationMedia,
  MediaOrigin,
  MediaType,
} from '../../domain/value-objects/Media'
import type { EvidenceWithMedia } from '../../domain/processes/investigationReviewReadiness'
import type { ActorRole } from '../../shared/types'
import { NotFoundError } from '../../shared/errors'

// Collapse a list of (possibly repeated, possibly null/undefined) foreign keys
// into the distinct ids actually worth resolving, so the batched `findByIds`
// reads stay minimal instead of loading whole tables.
const uniqueIds = (ids: ReadonlyArray<string | null | undefined>): string[] => [
  ...new Set(ids.filter((id): id is string => Boolean(id))),
]

export interface ReaderContext {
  actorId: string
  actorRole: ActorRole
}

export interface InvestigationListFilter {
  scope?: string
  journalistId?: string
}

export interface DirectorDashboardData {
  pendingReviews: Investigation[]
  publishedCount: number
  totalNotifications: number
}

// Dashboard KPIs scoped to the connected actor. The shape is discriminated by
// `profile` because each role tracks different counters. Definitions are kept
// strictly computable from existing aggregates (no invented semantics):
// - director: global pipeline counts
// - journalist: own investigations by lifecycle stage
// - citizen: own reports + how far each travelled (publication / corrections)
// - watcher: own evidence (followed investigations, this-month, published-on)
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

// Read-model wrappers: the domain entity plus the display names/titles joined
// from related aggregates, resolved on the read side so the UI gets one shape.
export interface EnrichedReport {
  report: Report
  reporterName: string | null
}

export interface EnrichedInboxSubject {
  subject: InboxSubject
  ownerName: string | null
}

export interface EnrichedInvestigation {
  investigation: Investigation
  title: string | null
  subject: string | null
  journalistName: string | null
}

export interface EnrichedPublication {
  publication: Publication
  title: string | null
  authoritySourceNames: ReadonlyMap<string, string>
}

export interface EnrichedInvestigationMedia {
  media: InvestigationMedia
  authoritySourceName: string | null
  authoritySourceType: SourceType | null
}

export interface EnrichedEvidence {
  evidence: EvidenceWithMedia['evidence']
  media: EvidenceMedia[]
  watcherName: string | null
}

export interface EnrichedWatcherApplication {
  application: WatcherApplication
  applicantName: string | null
}

// Unified read-model for the media attached to an inbox subject: director
// subjects carry their own InboxSubjectMedia, report-origin subjects surface the
// originating report's media. Origin tags the provenance for the UI.
export interface InboxSubjectMediaView {
  id: number
  url: string
  type: MediaType
  order: number
  origin: MediaOrigin
  uploadedById: string
  createdAt: Date
  updatedAt: Date
}

export class FactCheckingQueryService {
  constructor(
    private readonly reportRepository: IReportRepository,
    private readonly inboxSubjectRepository: IInboxSubjectRepository,
    private readonly investigationRepository: IInvestigationRepository,
    private readonly investigationMediaRepository: IInvestigationMediaRepository,
    private readonly evidenceRepository: IEvidenceRepository,
    private readonly publicationRepository: IPublicationRepository,
    private readonly correctionRepository: ICorrectionRepository,
    private readonly watcherApplicationRepository: IWatcherApplicationRepository,
    private readonly citizenRepository: ICitizenRepository,
    private readonly journalistRepository: IJournalistRepository,
    private readonly directorRepository: IDirectorRepository,
    private readonly notificationRepository: INotificationRepository,
    private readonly inboxSubjectMediaRepository: IInboxSubjectMediaRepository,
    private readonly reportMediaRepository: IReportMediaRepository,
    private readonly authoritySourceRepository: IAuthoritySourceRepository,
  ) {}

  // ---------------------------------------------------------------------------
  // Collection reads
  // ---------------------------------------------------------------------------

  // A citizen may only ever read their own reports; staff (journalist /
  // director) may read any citizen's reports or the full list.
  async listReportsForReader(
    reader: ReaderContext,
    citizenId?: string,
  ): Promise<Report[]> {
    if (reader.actorRole === 'CITIZEN') {
      return this.reportRepository.findByCitizenId(reader.actorId)
    }
    return citizenId
      ? this.reportRepository.findByCitizenId(citizenId)
      : this.reportRepository.findAll()
  }

  async listOpenReportsInbox(): Promise<Report[]> {
    return this.reportRepository.listInbox()
  }

  async listInboxSubjects(
    status?: InboxSubjectStatus,
  ): Promise<InboxSubject[]> {
    return status
      ? this.inboxSubjectRepository.findByStatus(status)
      : this.inboxSubjectRepository.findAll()
  }

  async listInvestigations(
    filter: InvestigationListFilter = {},
  ): Promise<Investigation[]> {
    switch (filter.scope) {
      case 'in-progress':
        return this.investigationRepository.findInProgress()
      case 'pending-review':
        return this.investigationRepository.findPendingReviews()
      case 'published':
        return this.investigationRepository.findPublished()
      case 'canceled':
        return this.investigationRepository.findCanceled()
      case 'contributable':
        return this.investigationRepository.findContributable()
    }

    if (filter.journalistId) {
      return this.investigationRepository.findByJournalistId(
        filter.journalistId,
      )
    }

    return this.investigationRepository.findPendingReviews()
  }

  async listPublications(scope?: string): Promise<Publication[]> {
    return scope === 'corrections'
      ? this.publicationRepository.findCorrections()
      : this.publicationRepository.findAll({ orderBy: 'desc' })
  }

  async listWatcherApplications(): Promise<WatcherApplication[]> {
    return this.watcherApplicationRepository.findAll()
  }

  async getDirectorDashboard(): Promise<DirectorDashboardData> {
    const [pendingReviews, publishedCount, totalNotifications] =
      await Promise.all([
        this.investigationRepository.findPendingReviews(),
        this.publicationRepository.count(),
        this.notificationRepository.count(),
      ])
    return { pendingReviews, publishedCount, totalNotifications }
  }

  // Dashboard KPIs for the connected actor. Citizens and watchers share the
  // CITIZEN role, so the citizenType decides which profile to compute.
  async getActorMetrics(reader: ReaderContext): Promise<ActorMetrics> {
    if (reader.actorRole === 'EDITORIAL_DIRECTOR') {
      return this.directorMetrics()
    }
    if (reader.actorRole === 'JOURNALIST') {
      return this.journalistMetrics(reader.actorId)
    }
    const citizen = await this.citizenRepository.findById(reader.actorId)
    return citizen?.isWatcher()
      ? this.watcherMetrics(reader.actorId)
      : this.citizenMetrics(reader.actorId)
  }

  private async directorMetrics(): Promise<ActorMetrics> {
    const [openSubjects, inProgress, pendingReviews, publishedCount] =
      await Promise.all([
        this.inboxSubjectRepository.findByStatus('OPEN'),
        this.investigationRepository.findInProgress(),
        this.investigationRepository.findPendingReviews(),
        this.publicationRepository.count(),
      ])
    return {
      profile: 'director',
      openSubjects: openSubjects.length,
      inProgressInvestigations: inProgress.length,
      pendingReviews: pendingReviews.length,
      publishedCount,
    }
  }

  private async journalistMetrics(journalistId: string): Promise<ActorMetrics> {
    const own =
      await this.investigationRepository.findByJournalistId(journalistId)
    return {
      profile: 'journalist',
      currentDossiers: own.filter((i) => i.canBeEdited()).length,
      pendingReviews: own.filter((i) => i.isPendingReview()).length,
      directorReturns: own.filter((i) => i.status === 'NEEDS_REVISION').length,
    }
  }

  private async citizenMetrics(citizenId: string): Promise<ActorMetrics> {
    const reports = await this.reportRepository.findByCitizenId(citizenId)
    const activeReports = reports.filter((r) => r.status === 'OPEN').length

    // Walk the report trail (report -> subject -> investigation -> publication
    // -> corrections) one batched query per hop instead of four reads per
    // report, then assemble each report's outcome from the lookup maps. This
    // keeps the dashboard flat as a citizen's report history grows.
    const subjects = await this.inboxSubjectRepository.findByReportIds(
      reports.map((report) => report.id),
    )
    const subjectByReportId = new Map<string, InboxSubject>()
    for (const subject of subjects) {
      if (subject.reportId) subjectByReportId.set(subject.reportId, subject)
    }

    const investigations =
      await this.investigationRepository.findByInboxSubjectIds(
        subjects.map((subject) => subject.id),
      )
    const investigationByInboxId = new Map(
      investigations.map((investigation) => [
        investigation.inboxSubjectId,
        investigation,
      ]),
    )

    const publicationRefs =
      await this.publicationRepository.findRefsByInvestigationIds(
        investigations.map((investigation) => investigation.id),
      )
    const publicationByInvestigationId = new Map(
      publicationRefs.map((ref) => [ref.investigationId, ref]),
    )

    const corrections = await this.correctionRepository.findByPublicationIds(
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
    }
  }

  private async watcherMetrics(watcherId: string): Promise<ActorMetrics> {
    const [evidence, publishedInvestigations] = await Promise.all([
      this.evidenceRepository.findByWatcherId(watcherId),
      this.investigationRepository.findPublished(),
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
    }
  }

  // ---------------------------------------------------------------------------
  // Enriched collection reads (display-ready: names/titles joined)
  // ---------------------------------------------------------------------------

  async listReportsForReaderEnriched(
    reader: ReaderContext,
    citizenId?: string,
  ): Promise<EnrichedReport[]> {
    const reports = await this.listReportsForReader(reader, citizenId)
    const citizenNames = await this.citizenNameMap(
      reports.map((report) => report.citizenId),
    )
    return reports.map((report) => ({
      report,
      reporterName: citizenNames.get(report.citizenId) ?? null,
    }))
  }

  async listOpenReportsInboxEnriched(): Promise<EnrichedReport[]> {
    const reports = await this.listOpenReportsInbox()
    const citizenNames = await this.citizenNameMap(
      reports.map((report) => report.citizenId),
    )
    return reports.map((report) => ({
      report,
      reporterName: citizenNames.get(report.citizenId) ?? null,
    }))
  }

  async listInboxSubjectsEnriched(
    status?: InboxSubjectStatus,
  ): Promise<EnrichedInboxSubject[]> {
    const subjects = await this.listInboxSubjects(status)
    const investigationsByInbox = await this.investigationByInboxMap(
      subjects.map((subject) => subject.id),
    )
    const journalistNames = await this.journalistNameMap(
      [...investigationsByInbox.values()].map(
        (investigation) => investigation.journalistId,
      ),
    )
    return subjects.map((subject) => {
      const investigation = investigationsByInbox.get(subject.id)
      return {
        subject,
        ownerName: investigation
          ? (journalistNames.get(investigation.journalistId) ?? null)
          : null,
      }
    })
  }

  async listInvestigationsEnriched(
    filter: InvestigationListFilter = {},
  ): Promise<EnrichedInvestigation[]> {
    const investigations = await this.listInvestigations(filter)
    const [inboxSubjects, journalistNames] = await Promise.all([
      this.inboxSubjectByIdMap(
        investigations.map((investigation) => investigation.inboxSubjectId),
      ),
      this.journalistNameMap(
        investigations.map((investigation) => investigation.journalistId),
      ),
    ])
    return investigations.map((investigation) => {
      const subject = inboxSubjects.get(investigation.inboxSubjectId)
      return {
        investigation,
        title: subject?.theme ?? null,
        subject: subject?.description ?? null,
        journalistName: journalistNames.get(investigation.journalistId) ?? null,
      }
    })
  }

  async listPublicationsEnriched(
    scope?: string,
  ): Promise<EnrichedPublication[]> {
    const publications = await this.listPublications(scope)
    const [investigationsById, authoritySourceNames] = await Promise.all([
      this.investigationByIdMap(
        publications.map((publication) => publication.investigationId),
      ),
      this.authoritySourceNameMap(
        publications.flatMap((publication) =>
          this.publicationAuthoritySourceIds(publication),
        ),
      ),
    ])
    const inboxSubjects = await this.inboxSubjectByIdMap(
      [...investigationsById.values()].map(
        (investigation) => investigation.inboxSubjectId,
      ),
    )
    return publications.map((publication) => {
      const investigation = investigationsById.get(publication.investigationId)
      const subject = investigation
        ? inboxSubjects.get(investigation.inboxSubjectId)
        : undefined
      return {
        publication,
        title: subject?.theme ?? null,
        authoritySourceNames,
      }
    })
  }

  // ---------------------------------------------------------------------------
  // Enriched single-resource reads
  // ---------------------------------------------------------------------------

  async getReportForReaderEnriched(
    reportId: string,
    reader: ReaderContext,
  ): Promise<EnrichedReport> {
    const report = await this.getReportForReader(reportId, reader)
    const citizen = await this.citizenRepository.findById(report.citizenId)
    return { report, reporterName: citizen?.name ?? null }
  }

  async getInboxSubjectEnriched(
    inboxSubjectId: string,
  ): Promise<EnrichedInboxSubject> {
    const subject = await this.getInboxSubject(inboxSubjectId)
    const investigation =
      await this.investigationRepository.findByInboxSubjectId(subject.id)
    const journalist = investigation
      ? await this.journalistRepository.findById(investigation.journalistId)
      : null
    return { subject, ownerName: journalist?.name ?? null }
  }

  async getInvestigationEnriched(
    investigationId: string,
  ): Promise<EnrichedInvestigation> {
    const investigation = await this.getInvestigation(investigationId)
    const [inboxSubject, journalist] = await Promise.all([
      this.inboxSubjectRepository.findById(investigation.inboxSubjectId),
      this.journalistRepository.findById(investigation.journalistId),
    ])
    return {
      investigation,
      title: inboxSubject?.theme ?? null,
      subject: inboxSubject?.description ?? null,
      journalistName: journalist?.name ?? null,
    }
  }

  async getPublicationEnriched(
    publicationId: string,
  ): Promise<EnrichedPublication> {
    const publication = await this.getPublication(publicationId)
    const investigation = await this.investigationRepository.findById(
      publication.investigationId,
    )
    const [inboxSubject, authoritySourceNames] = await Promise.all([
      investigation
        ? this.inboxSubjectRepository.findById(investigation.inboxSubjectId)
        : null,
      this.authoritySourceNameMap(
        this.publicationAuthoritySourceIds(publication),
      ),
    ])
    return {
      publication,
      title: inboxSubject?.theme ?? null,
      authoritySourceNames,
    }
  }

  async getInvestigationSourceMediaEnriched(
    investigationId: string,
  ): Promise<EnrichedInvestigationMedia[]> {
    const media = await this.getInvestigationSourceMedia(investigationId)
    const authoritySources = await this.authoritySourceMap(
      media.map((item) => item.authoritySourceId),
    )
    return media.map((item) => {
      const source = item.authoritySourceId
        ? (authoritySources.get(item.authoritySourceId) ?? null)
        : null
      return {
        media: item,
        authoritySourceName: source?.name ?? null,
        authoritySourceType: source?.type ?? null,
      }
    })
  }

  async getInvestigationEvidenceEnriched(
    investigationId: string,
  ): Promise<EnrichedEvidence[]> {
    const bundles = await this.getInvestigationEvidence(investigationId)
    const citizenNames = await this.citizenNameMap(
      bundles.map(({ evidence }) => evidence.watcherId),
    )
    return bundles.map(({ evidence, media }) => ({
      evidence,
      media,
      watcherName: citizenNames.get(evidence.watcherId) ?? null,
    }))
  }

  // Inbox subject media: director-initiated subjects own InboxSubjectMedia;
  // report-origin subjects surface the originating report's media.
  async getInboxSubjectMedia(
    inboxSubjectId: string,
  ): Promise<InboxSubjectMediaView[]> {
    const subject = await this.getInboxSubject(inboxSubjectId)
    if (subject.origin === 'DIRECTOR_INITIATED') {
      const media = await this.inboxSubjectMediaRepository.findByInboxSubjectId(
        subject.id,
      )
      return media.map((item) => ({
        id: item.id,
        url: item.url,
        type: item.type,
        order: item.order,
        origin: 'DIRECTOR_INITIATED',
        uploadedById: item.uploadedById,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }))
    }
    if (!subject.reportId) return []
    const media = await this.reportMediaRepository.findByReportId(
      subject.reportId,
    )
    return media.map((item) => ({
      id: item.id,
      url: item.url,
      type: item.type,
      order: item.order,
      origin: 'CITIZEN_REPORT',
      uploadedById: item.uploadedById,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }))
  }

  async listWatcherApplicationsEnriched(): Promise<
    EnrichedWatcherApplication[]
  > {
    const applications = await this.listWatcherApplications()
    const citizenNames = await this.citizenNameMap(
      applications.map((application) => application.actorId),
    )
    return applications.map((application) => ({
      application,
      applicantName: citizenNames.get(application.actorId) ?? null,
    }))
  }

  async getWatcherApplicationEnriched(
    applicationId: string,
  ): Promise<EnrichedWatcherApplication> {
    const application = await this.getWatcherApplication(applicationId)
    const citizen = await this.citizenRepository.findById(application.actorId)
    return { application, applicantName: citizen?.name ?? null }
  }

  // ---------------------------------------------------------------------------
  // Lookup maps (id -> display value) used to enrich collections in one pass
  // ---------------------------------------------------------------------------

  private async citizenNameMap(
    ids: ReadonlyArray<string | null | undefined>,
  ): Promise<Map<string, string>> {
    const citizens = await this.citizenRepository.findByIds(uniqueIds(ids))
    return new Map(citizens.map((citizen) => [citizen.id, citizen.name]))
  }

  private async journalistNameMap(
    ids: ReadonlyArray<string | null | undefined>,
  ): Promise<Map<string, string>> {
    const journalists = await this.journalistRepository.findByIds(
      uniqueIds(ids),
    )
    return new Map(
      journalists.map((journalist) => [journalist.id, journalist.name]),
    )
  }

  private async inboxSubjectByIdMap(
    ids: ReadonlyArray<string | null | undefined>,
  ): Promise<Map<string, InboxSubject>> {
    const subjects = await this.inboxSubjectRepository.findByIds(uniqueIds(ids))
    return new Map(subjects.map((subject) => [subject.id, subject]))
  }

  private async authoritySourceNameMap(
    ids: ReadonlyArray<string | null | undefined>,
  ): Promise<Map<string, string>> {
    const sources = await this.authoritySourceRepository.findByIds(
      uniqueIds(ids),
    )
    return new Map(sources.map((source) => [source.id, source.name]))
  }

  private async authoritySourceMap(
    ids: ReadonlyArray<string | null | undefined>,
  ): Promise<Map<string, AuthoritySource>> {
    const sources = await this.authoritySourceRepository.findByIds(
      uniqueIds(ids),
    )
    return new Map(sources.map((source) => [source.id, source]))
  }

  private async investigationByIdMap(
    ids: ReadonlyArray<string | null | undefined>,
  ): Promise<Map<string, Investigation>> {
    const investigations = await this.investigationRepository.findByIds(
      uniqueIds(ids),
    )
    return new Map(
      investigations.map((investigation) => [investigation.id, investigation]),
    )
  }

  // Keyed by inboxSubjectId — each subject backs at most one investigation, so
  // the FK is effectively unique on this side of the relation.
  private async investigationByInboxMap(
    inboxSubjectIds: ReadonlyArray<string | null | undefined>,
  ): Promise<Map<string, Investigation>> {
    const investigations =
      await this.investigationRepository.findByInboxSubjectIds(
        uniqueIds(inboxSubjectIds),
      )
    return new Map(
      investigations.map((investigation) => [
        investigation.inboxSubjectId,
        investigation,
      ]),
    )
  }

  // The authority sources referenced by a publication's verified media/links.
  private publicationAuthoritySourceIds(publication: Publication): string[] {
    return [
      ...publication.verifiedMedia.map((media) => media.authoritySourceId),
      ...publication.verifiedLinks.map((link) => link.authoritySourceId),
    ].filter((id): id is string => Boolean(id))
  }

  // ---------------------------------------------------------------------------
  // Single-resource reads
  // ---------------------------------------------------------------------------

  async getReport(reportId: string): Promise<Report> {
    const report = await this.reportRepository.findById(reportId)
    if (!report) throw new NotFoundError('Report', reportId)
    return report
  }

  // A citizen may only read their own report; staff may read any. Unauthorized
  // access is reported as "not found" so a report's existence is not leaked.
  async getReportForReader(
    reportId: string,
    reader: ReaderContext,
  ): Promise<Report> {
    const report = await this.getReport(reportId)
    if (reader.actorRole === 'CITIZEN' && report.citizenId !== reader.actorId) {
      throw new NotFoundError('Report', reportId)
    }
    return report
  }

  async getInboxSubject(inboxSubjectId: string): Promise<InboxSubject> {
    const subject = await this.inboxSubjectRepository.findById(inboxSubjectId)
    if (!subject) throw new NotFoundError('InboxSubject', inboxSubjectId)
    return subject
  }

  async getInvestigation(investigationId: string): Promise<Investigation> {
    const investigation =
      await this.investigationRepository.findById(investigationId)
    if (!investigation)
      throw new NotFoundError('Investigation', investigationId)
    return investigation
  }

  async getInvestigationSourceMedia(
    investigationId: string,
  ): Promise<InvestigationMedia[]> {
    await this.getInvestigation(investigationId)
    return this.investigationMediaRepository.findByInvestigationId(
      investigationId,
    )
  }

  async getInvestigationEvidence(
    investigationId: string,
  ): Promise<EvidenceWithMedia[]> {
    await this.getInvestigation(investigationId)
    return this.evidenceRepository.findWithMediaByInvestigationId(
      investigationId,
    )
  }

  async getPublication(publicationId: string): Promise<Publication> {
    const publication = await this.publicationRepository.findById(publicationId)
    if (!publication) throw new NotFoundError('Publication', publicationId)
    return publication
  }

  async getPublicationCorrections(
    publicationId: string,
  ): Promise<Correction[]> {
    await this.getPublication(publicationId)
    return this.correctionRepository.findByPublicationId(publicationId)
  }

  async getWatcherApplication(
    applicationId: string,
  ): Promise<WatcherApplication> {
    const application =
      await this.watcherApplicationRepository.findWatcherApplicationById(
        applicationId,
      )
    if (!application)
      throw new NotFoundError('WatcherApplication', applicationId)
    return application
  }

  async getCitizen(citizenId: string): Promise<Citizen> {
    const citizen = await this.citizenRepository.findById(citizenId)
    if (!citizen) throw new NotFoundError('Citizen', citizenId)
    return citizen
  }

  async getJournalist(journalistId: string): Promise<Journalist> {
    const journalist = await this.journalistRepository.findById(journalistId)
    if (!journalist) throw new NotFoundError('Journalist', journalistId)
    return journalist
  }

  async getDirector(directorId: string): Promise<Director> {
    const director = await this.directorRepository.findById(directorId)
    if (!director) throw new NotFoundError('Director', directorId)
    return director
  }
}
