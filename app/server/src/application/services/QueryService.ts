// application/services/QueryService.ts
//
// Read-only queries used by routes/controllers. Returns plain DTOs instead of
// leaking domain entities to outer layers.

import {
  type ICitizenRepository,
  type IDirectorRepository,
  type IInboxSubjectMediaRepository,
  type IInboxSubjectRepository,
  type IInvestigationRepository,
  type IJournalistRepository,
  type INotificationRepository,
  type IPublicationRepository,
  type IReportMediaRepository,
  type IReportRepository,
} from '../../domain/repositories'
import { Citizen } from '../../domain/entities/Citizen'
import { Director } from '../../domain/entities/Director'
import { Journalist } from '../../domain/entities/Journalist'
import { Investigation } from '../../domain/entities/Investigation'
import { Publication } from '../../domain/entities/Publication'
import { Report } from '../../domain/entities/Report'
import { Notification } from '../../domain/entities/Notification'
import { NotFoundError } from '../../shared/errors'

export interface CitizenProfileDto {
  id: string
  name: string
  email: string
  status: string
  citizenType: string
  engagementScore: number
  openReportsCount: number
  lastInboxRead: Date
}

export interface CitizenHistoryDto {
  citizenId: string
  reports: ReportSummaryDto[]
}

export interface JournalistProfileDto {
  id: string
  name: string
  email: string
  status: string
  engagementScore: number
  activeInvestigationsCount: number
}

export interface JournalistHistoryDto {
  journalistId: string
  investigations: InvestigationSummaryDto[]
}

export interface DirectorProfileDto {
  id: string
  name: string
  email: string
  status: string
  scoreInvestigation: number
}

export interface AdminDashboardDto {
  pendingReviews: InvestigationSummaryDto[]
  publishedCount: number
  totalNotifications: number
}

export interface ReportSummaryDto {
  id: string
  theme: string
  status: string
  createdAt: Date
}

export interface InvestigationSummaryDto {
  id: string
  inboxSubjectId: string
  journalistId: string
  status: string
  draftVerdict: string
  attemptCount: number
  updatedAt: Date
}

export interface InboxSubjectMediaItemDto {
  id: number
  url: string
  type: string
  order: number
}

export interface InboxSubjectDetailDto {
  id: string
  theme: string
  description: string
  origin: string
  status: string
  reportId: string | null
  createdById: string
  media: InboxSubjectMediaItemDto[]
}

export interface PublicationSummaryDto {
  id: string
  investigationId: string
  finalVerdict: string
  publishedAt: Date
}

export interface NotificationSummaryDto {
  id: string
  type: string
  theme: string
  message: string
  isRead: boolean
  publicationId?: string
  investigationId?: string
  createdAt: Date
}

export interface NotificationsQueryOptions {
  skip?: number
  take?: number
  activeOnly?: boolean
}

export class QueryService {
  constructor(
    private readonly reportRepository: IReportRepository,
    private readonly reportMediaRepository: IReportMediaRepository,
    private readonly investigationRepository: IInvestigationRepository,
    private readonly publicationRepository: IPublicationRepository,
    private readonly notificationRepository: INotificationRepository,
    private readonly citizenRepository: ICitizenRepository,
    private readonly journalistRepository: IJournalistRepository,
    private readonly directorRepository: IDirectorRepository,
    private readonly inboxSubjectRepository: IInboxSubjectRepository,
    private readonly inboxSubjectMediaRepository: IInboxSubjectMediaRepository,
  ) {}

  async getCitizenProfile(citizenId: string): Promise<CitizenProfileDto> {
    const citizen = await this.citizenRepository.findById(citizenId)
    if (!citizen) throw new NotFoundError('Citizen', citizenId)
    return this.toCitizenProfile(citizen)
  }

  async getCitizenHistory(citizenId: string): Promise<CitizenHistoryDto> {
    const reports = await this.reportRepository.findByCitizenId(citizenId)
    return {
      citizenId,
      reports: reports.map((r) => this.toReportSummary(r)),
    }
  }

  async getJournalistProfile(
    journalistId: string,
  ): Promise<JournalistProfileDto> {
    const journalist = await this.journalistRepository.findById(journalistId)
    if (!journalist) throw new NotFoundError('Journalist', journalistId)
    return this.toJournalistProfile(journalist)
  }

  async getJournalistHistory(
    journalistId: string,
  ): Promise<JournalistHistoryDto> {
    const investigations =
      await this.investigationRepository.findByJournalistId(journalistId)
    return {
      journalistId,
      investigations: investigations.map((i) => this.toInvestigationSummary(i)),
    }
  }

  async getDirectorProfile(directorId: string): Promise<DirectorProfileDto> {
    const director = await this.directorRepository.findById(directorId)
    if (!director) throw new NotFoundError('Director', directorId)
    return this.toDirectorProfile(director)
  }

  async getAdminDashboard(directorId: string): Promise<AdminDashboardDto> {
    const director = await this.directorRepository.findById(directorId)
    if (!director) throw new NotFoundError('Director', directorId)

    const [pendingReviews, publishedCount, totalNotifications] =
      await Promise.all([
        this.investigationRepository.findPendingReviews(),
        this.publicationRepository.count(),
        this.notificationRepository.count(),
      ])

    return {
      pendingReviews: pendingReviews.map((i) => this.toInvestigationSummary(i)),
      publishedCount,
      totalNotifications,
    }
  }

  async getNotifications(
    actorId: string,
    options: NotificationsQueryOptions = {},
  ): Promise<NotificationSummaryDto[]> {
    const items = await this.notificationRepository.findByActorId(
      actorId,
      options,
    )
    return items.map((n) => this.toNotificationSummary(n))
  }

  async listAvailableInbox(): Promise<ReportSummaryDto[]> {
    const reports = await this.reportRepository.listInbox()
    return reports.map((r) => this.toReportSummary(r))
  }

  async listRecentPublications(): Promise<PublicationSummaryDto[]> {
    const publications = await this.publicationRepository.findAll({
      orderBy: 'desc',
    })
    return publications.map((p) => this.toPublicationSummary(p))
  }

  async getInboxSubjectDetail(
    inboxSubjectId: string,
  ): Promise<InboxSubjectDetailDto> {
    const subject = await this.inboxSubjectRepository.findById(inboxSubjectId)
    if (!subject) throw new NotFoundError('InboxSubject', inboxSubjectId)

    let media: InboxSubjectMediaItemDto[]
    if (subject.origin === 'REPORT' && subject.reportId) {
      const rows = await this.reportMediaRepository.findByReportId(
        subject.reportId,
      )
      media = rows
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((m) => ({
          id: m.id,
          url: m.url,
          type: m.type,
          order: m.order,
        }))
    } else {
      const rows =
        await this.inboxSubjectMediaRepository.findByInboxSubjectId(
          inboxSubjectId,
        )
      media = rows
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((m) => ({
          id: m.id,
          url: m.url,
          type: m.type,
          order: m.order,
        }))
    }

    return {
      id: subject.id,
      theme: subject.theme,
      description: subject.description,
      origin: subject.origin,
      status: subject.status,
      reportId: subject.reportId,
      createdById: subject.createdById,
      media,
    }
  }

  // ---------------------------------------------------------------------------
  // Mappers
  // ---------------------------------------------------------------------------

  private toCitizenProfile(citizen: Citizen): CitizenProfileDto {
    return {
      id: citizen.id,
      name: citizen.name,
      email: citizen.email,
      status: citizen.status,
      citizenType: citizen.citizenType,
      engagementScore: citizen.engagementScore,
      openReportsCount: citizen.openReportsCount,
      lastInboxRead: citizen.lastInboxRead,
    }
  }

  private toJournalistProfile(journalist: Journalist): JournalistProfileDto {
    return {
      id: journalist.id,
      name: journalist.name,
      email: journalist.email,
      status: journalist.status,
      engagementScore: journalist.engagementScore,
      activeInvestigationsCount: journalist.activeInvestigationsCount,
    }
  }

  private toDirectorProfile(director: Director): DirectorProfileDto {
    return {
      id: director.id,
      name: director.name,
      email: director.email,
      status: director.status,
      scoreInvestigation: director.scoreInvestigation,
    }
  }

  private toReportSummary(report: Report): ReportSummaryDto {
    return {
      id: report.id,
      theme: report.theme,
      status: report.status,
      createdAt: report.createdAt,
    }
  }

  private toInvestigationSummary(
    investigation: Investigation,
  ): InvestigationSummaryDto {
    return {
      id: investigation.id,
      inboxSubjectId: investigation.inboxSubjectId,
      journalistId: investigation.journalistId,
      status: investigation.status,
      draftVerdict: investigation.draftVerdict,
      attemptCount: investigation.attemptCount,
      updatedAt: investigation.updatedAt,
    }
  }

  private toPublicationSummary(
    publication: Publication,
  ): PublicationSummaryDto {
    return {
      id: publication.id,
      investigationId: publication.investigationId,
      finalVerdict: publication.finalVerdict,
      publishedAt: publication.publishedAt,
    }
  }

  private toNotificationSummary(
    notification: Notification,
  ): NotificationSummaryDto {
    return {
      id: notification.id,
      type: notification.type,
      theme: notification.theme,
      message: notification.message,
      isRead: notification.isRead,
      publicationId: notification.publicationId,
      investigationId: notification.investigationId,
      createdAt: notification.createdAt,
    }
  }
}
