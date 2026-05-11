import type { Context } from 'hono'
import { ActorManagementService } from '../../application/services/ActorManagementService'
import { created, noContent } from '../http/responses'
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
  ) {}

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
