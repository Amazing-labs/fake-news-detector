// application/services/FactCheckingQueryService.ts
//
// Read side of the fact-checking context: collection listings, single-resource
// fetch-by-id / sub-resource reads, and the director dashboard aggregation.
// Controllers delegate every read here so the interface layer stays transport
// only and the not-found rules live in the application layer.

import type {
  ICitizenRepository,
  ICorrectionRepository,
  IDirectorRepository,
  IEvidenceRepository,
  IInboxSubjectRepository,
  IInvestigationMediaRepository,
  IInvestigationRepository,
  IJournalistRepository,
  INotificationRepository,
  IPublicationRepository,
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
import type { InvestigationMedia } from '../../domain/value-objects/Media'
import type { EvidenceWithMedia } from '../../domain/processes/investigationReviewReadiness'
import type { ActorRole } from '../../shared/types'
import { NotFoundError } from '../../shared/errors'

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
