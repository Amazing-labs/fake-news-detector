import type { Context } from 'hono'
import { ActorManagementService } from '../../application/services/ActorManagementService'
import type { IJournalistRepository } from '../../domain/repositories'
import { created, noContent, ok } from '../http/responses'
import type { AppVariables } from '../http/types'
import { requiredParam } from '../http/request'
import {
  activateJournalistSchema,
  createJournalistSchema,
  journalistActionSchema,
} from '../http/schemas/journalistSchemas'

export class JournalistManagementController {
  constructor(
    private readonly actorManagementService: ActorManagementService,
    private readonly journalistRepository: IJournalistRepository,
  ) {}

  list = async (c: Context<{ Variables: AppVariables }>) => {
    const journalists = await this.journalistRepository.findAll()
    return ok(c, {
      items: journalists.map((journalist) => ({
        id: journalist.id,
        name: journalist.name,
        email: journalist.email,
        status: journalist.status,
        engagementScore: journalist.engagementScore,
        activeInvestigationsCount: journalist.activeInvestigationsCount,
        statusReason: journalist.statusReason,
        statusReasonDetails: journalist.statusReasonDetails,
        createdAt: journalist.createdAt.toISOString(),
        updatedAt: journalist.updatedAt.toISOString(),
      })),
      total: journalists.length,
    })
  }

  create = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    const body = createJournalistSchema.parse(await c.req.json())
    const journalistId = await this.actorManagementService.createJournalist(
      actor.actorId,
      body.name,
      body.email,
    )
    return created(c, { id: journalistId }, 'Journaliste cree')
  }

  ban = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    const body = journalistActionSchema.parse(await c.req.json())
    await this.actorManagementService.banJournalist(
      actor.actorId,
      requiredParam(c, 'journalistId'),
      body.reason ?? 'OTHER',
      body.details,
    )
    return noContent(c)
  }

  disable = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    const body = journalistActionSchema.parse(await c.req.json())
    await this.actorManagementService.disableJournalist(
      actor.actorId,
      requiredParam(c, 'journalistId'),
      body.reason ?? 'OTHER',
      body.details,
    )
    return noContent(c)
  }

  activate = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    activateJournalistSchema.parse(await c.req.json())
    await this.actorManagementService.activateJournalist(
      actor.actorId,
      requiredParam(c, 'journalistId'),
    )
    return noContent(c)
  }
}
