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
  journalistName: string | null
}

export interface EnrichedPublication {
  publication: Publication
  title: string | null
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
  // Enriched collection reads (display-ready: names/titles joined)
  // ---------------------------------------------------------------------------

  async listReportsForReaderEnriched(
    reader: ReaderContext,
    citizenId?: string,
  ): Promise<EnrichedReport[]> {
    const reports = await this.listReportsForReader(reader, citizenId)
    const citizenNames = await this.citizenNameMap()
    return reports.map((report) => ({
      report,
      reporterName: citizenNames.get(report.citizenId) ?? null,
    }))
  }

  async listOpenReportsInboxEnriched(): Promise<EnrichedReport[]> {
    const reports = await this.listOpenReportsInbox()
    const citizenNames = await this.citizenNameMap()
    return reports.map((report) => ({
      report,
      reporterName: citizenNames.get(report.citizenId) ?? null,
    }))
  }

  async listInboxSubjectsEnriched(
    status?: InboxSubjectStatus,
  ): Promise<EnrichedInboxSubject[]> {
    const subjects = await this.listInboxSubjects(status)
    const [investigationsByInbox, journalistNames] = await Promise.all([
      this.investigationByInboxMap(),
      this.journalistNameMap(),
    ])
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
    const [inboxThemes, journalistNames] = await Promise.all([
      this.inboxThemeMap(),
      this.journalistNameMap(),
    ])
    return investigations.map((investigation) => ({
      investigation,
      title: inboxThemes.get(investigation.inboxSubjectId) ?? null,
      journalistName: journalistNames.get(investigation.journalistId) ?? null,
    }))
  }

  async listPublicationsEnriched(
    scope?: string,
  ): Promise<EnrichedPublication[]> {
    const publications = await this.listPublications(scope)
    const [investigationsById, inboxThemes] = await Promise.all([
      this.investigationByIdMap(),
      this.inboxThemeMap(),
    ])
    return publications.map((publication) => {
      const investigation = investigationsById.get(publication.investigationId)
      return {
        publication,
        title: investigation
          ? (inboxThemes.get(investigation.inboxSubjectId) ?? null)
          : null,
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
    const inboxSubject = investigation
      ? await this.inboxSubjectRepository.findById(investigation.inboxSubjectId)
      : null
    return { publication, title: inboxSubject?.theme ?? null }
  }

  // ---------------------------------------------------------------------------
  // Lookup maps (id -> display value) used to enrich collections in one pass
  // ---------------------------------------------------------------------------

  private async citizenNameMap(): Promise<Map<string, string>> {
    const citizens = await this.citizenRepository.findAll()
    return new Map(citizens.map((citizen) => [citizen.id, citizen.name]))
  }

  private async journalistNameMap(): Promise<Map<string, string>> {
    const journalists = await this.journalistRepository.findAll()
    return new Map(
      journalists.map((journalist) => [journalist.id, journalist.name]),
    )
  }

  private async inboxThemeMap(): Promise<Map<string, string>> {
    const subjects = await this.inboxSubjectRepository.findAll()
    return new Map(subjects.map((subject) => [subject.id, subject.theme]))
  }

  private async investigationByIdMap(): Promise<Map<string, Investigation>> {
    const investigations = await this.investigationRepository.findAll()
    return new Map(
      investigations.map((investigation) => [investigation.id, investigation]),
    )
  }

  private async investigationByInboxMap(): Promise<Map<string, Investigation>> {
    const investigations = await this.investigationRepository.findAll()
    return new Map(
      investigations.map((investigation) => [
        investigation.inboxSubjectId,
        investigation,
      ]),
    )
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
