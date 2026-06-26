import type { Context } from 'hono'
import { ActorManagementService } from '../../application/services/ActorManagementService'
import { FactCheckingQueryService } from '../../application/services/FactCheckingQueryService'
import { noContent, ok } from '../http/responses'
import type { AppVariables } from '../http/types'
import { requiredParam, validatedJson } from '../http/request'
import type { citizenManagementSchema } from '../http/schemas/common'
import { presentDirectorDashboard } from '../presenters/directorPresenter'
import type { z } from 'zod'

export class DirectorController {
  constructor(
    private readonly queryService: FactCheckingQueryService,
    private readonly actorManagementService: ActorManagementService,
  ) {}

  getDashboard = async (c: Context<{ Variables: AppVariables }>) => {
    const dashboard = await this.queryService.getDirectorDashboard()
    return ok(c, presentDirectorDashboard(dashboard))
  }

  banCitizen = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    const body = validatedJson<z.infer<typeof citizenManagementSchema>>(c)
    await this.actorManagementService.banCitizen(
      actor.actorId,
      requiredParam(c, 'citizenId'),
      body.reason ?? 'OTHER',
      body.details,
    )
    return noContent(c)
  }

  disableCitizen = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    const body = validatedJson<z.infer<typeof citizenManagementSchema>>(c)
    await this.actorManagementService.disableCitizen(
      actor.actorId,
      requiredParam(c, 'citizenId'),
      body.reason ?? 'OTHER',
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
    const citizens = await this.actorManagementService.listCitizens()

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
