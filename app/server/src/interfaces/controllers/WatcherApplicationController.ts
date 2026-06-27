import type { Context } from 'hono'
import { FactCheckingService } from '../../application/services/FactCheckingService'
import { FactCheckingQueryService } from '../../application/services/FactCheckingQueryService'
import { created, noContent, ok } from '../http/responses'
import type { AppVariables } from '../http/types'
import { requiredParam, validatedJson } from '../http/request'
import type { submitWatcherApplicationSchema } from '../http/schemas/watcherApplicationSchemas'
import {
  presentEnrichedWatcherApplication,
  presentEnrichedWatcherApplicationList,
} from '../presenters/watcherApplicationPresenter'
import type { z } from 'zod'

export class WatcherApplicationController {
  constructor(
    private readonly factCheckingService: FactCheckingService,
    private readonly queryService: FactCheckingQueryService,
  ) {}

  submit = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    const body =
      validatedJson<z.infer<typeof submitWatcherApplicationSchema>>(c)
    const applicationId =
      await this.factCheckingService.submitWatcherApplication(
        actor.actorId,
        body.motivation,
      )
    return created(c, { id: applicationId }, 'Candidature watcher envoyee')
  }

  getById = async (c: Context<{ Variables: AppVariables }>) => {
    const id = requiredParam(c, 'applicationId')
    const application =
      await this.queryService.getWatcherApplicationEnriched(id)
    return ok(c, presentEnrichedWatcherApplication(application))
  }

  list = async (c: Context<{ Variables: AppVariables }>) => {
    const items = await this.queryService.listWatcherApplicationsEnriched()
    return ok(c, presentEnrichedWatcherApplicationList(items))
  }

  approve = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    await this.factCheckingService.approveWatcherApplication(
      actor.actorId,
      requiredParam(c, 'applicationId'),
    )
    return noContent(c)
  }

  reject = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    await this.factCheckingService.rejectWatcherApplication(
      actor.actorId,
      requiredParam(c, 'applicationId'),
    )
    return noContent(c)
  }
}
