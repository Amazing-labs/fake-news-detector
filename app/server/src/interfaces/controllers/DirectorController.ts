import type { Context } from 'hono'
import { ActorManagementService } from '../../application/services/ActorManagementService'
import type {
  ICitizenRepository,
  IInvestigationRepository,
  INotificationRepository,
  IPublicationRepository,
} from '../../domain/repositories'
import { noContent, ok } from '../http/responses'
import type { AppVariables } from '../http/types'
import { requiredParam } from '../http/request'
import { journalistActionSchema } from '../http/schemas/journalistSchemas'
import { ValidationError } from '../../shared/errors'
import { presentDirectorDashboard } from '../presenters/directorPresenter'

export class DirectorController {
  constructor(
    private readonly investigationRepository: IInvestigationRepository,
    private readonly publicationRepository: IPublicationRepository,
    private readonly notificationRepository: INotificationRepository,
    private readonly citizenRepository: ICitizenRepository,
    private readonly actorManagementService: ActorManagementService,
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

  banCitizen = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    const body = journalistActionSchema.parse(await c.req.json())
    if (!body.reason)
      throw new ValidationError('reason is required to ban a citizen')
    await this.actorManagementService.banCitizen(
      actor.actorId,
      requiredParam(c, 'citizenId'),
      body.reason,
      body.details,
    )
    return noContent(c)
  }

  disableCitizen = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    const body = journalistActionSchema.parse(await c.req.json())
    if (!body.reason)
      throw new ValidationError('reason is required to disable a citizen')
    await this.actorManagementService.disableCitizen(
      actor.actorId,
      requiredParam(c, 'citizenId'),
      body.reason,
      body.details,
    )
    return noContent(c)
  }

  activateCitizen = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    await this.actorManagementService.activateCitizen(
      actor.actorId,
      requiredParam(c, 'citizenId'),
    )
    return noContent(c)
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
