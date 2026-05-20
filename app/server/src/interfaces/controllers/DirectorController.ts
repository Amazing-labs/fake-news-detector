import type { Context } from 'hono'
import type {
  ICitizenRepository,
  IInvestigationRepository,
  INotificationRepository,
  IPublicationRepository,
} from '../../domain/repositories'
import { ok } from '../http/responses'
import type { AppVariables } from '../http/types'
import { presentDirectorDashboard } from '../presenters/directorPresenter'

export class DirectorController {
  constructor(
    private readonly investigationRepository: IInvestigationRepository,
    private readonly publicationRepository: IPublicationRepository,
    private readonly notificationRepository: INotificationRepository,
    private readonly citizenRepository: ICitizenRepository,
  ) {}

  getDashboard = async (c: Context<{ Variables: AppVariables }>) => {
    const [pendingReviews, publishedCount, totalNotifications] =
      await Promise.all([
        this.investigationRepository.findPendingReviews(),
        this.publicationRepository.count(),
        this.notificationRepository.count(),
      ])

    return ok(
      c,
      presentDirectorDashboard({
        pendingReviews,
        publishedCount,
        totalNotifications,
      }),
    )
  }

  listCitizens = async (c: Context<{ Variables: AppVariables }>) => {
    const citizens = await this.citizenRepository.findAll()

    return ok(c, {
      items: citizens.map((citizen) => ({
        id: citizen.id,
        name: citizen.name,
        email: citizen.email,
        status: citizen.status,
        citizenType: citizen.citizenType,
        engagementScore: citizen.engagementScore,
        openReportsCount: citizen.openReportsCount,
        statusReason: citizen.statusReason,
        statusReasonDetails: citizen.statusReasonDetails,
        createdAt: citizen.createdAt.toISOString(),
        updatedAt: citizen.updatedAt.toISOString(),
      })),
      total: citizens.length,
    })
  }
}
