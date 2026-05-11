import type { Context } from 'hono'
import { FactCheckingService } from '../../application/services/FactCheckingService'
import type { IWatcherApplicationRepository } from '../../domain/repositories'
import { created, noContent, ok } from '../http/responses'
import type { AppVariables } from '../http/types'
import { requiredParam } from '../http/request'
import {
  submitWatcherApplicationSchema,
  watcherDecisionSchema,
} from '../http/schemas/watcherApplicationSchemas'
import { presentWatcherApplicationList } from '../presenters/watcherApplicationPresenter'

export class WatcherApplicationController {
  constructor(
    private readonly factCheckingService: FactCheckingService,
    private readonly watcherApplicationRepository: IWatcherApplicationRepository,
  ) {}

  submit = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    const body = submitWatcherApplicationSchema.parse(await c.req.json())
    const applicationId =
      await this.factCheckingService.submitWatcherApplication(
        actor.actorId,
        body.motivation,
      )
    return created(c, { id: applicationId }, 'Candidature watcher envoyee')
  }

  list = async (c: Context<{ Variables: AppVariables }>) => {
    const items = await this.watcherApplicationRepository.findAll()
    return ok(c, presentWatcherApplicationList(items))
  }

  approve = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    watcherDecisionSchema.parse(await c.req.json())
    await this.factCheckingService.approveWatcherApplication(
      actor.actorId,
      requiredParam(c, 'applicationId'),
    )
    return noContent(c)
  }

  reject = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    watcherDecisionSchema.parse(await c.req.json())
    await this.factCheckingService.rejectWatcherApplication(
      actor.actorId,
      requiredParam(c, 'applicationId'),
    )
    return noContent(c)
  }
}
