import type { Context } from 'hono'
import { FactCheckingQueryService } from '../../application/services/FactCheckingQueryService'
import { ok } from '../http/responses'
import type { AppVariables } from '../http/types'
import { presentActorMetrics } from '../presenters/dashboardPresenter'

export class DashboardController {
  constructor(private readonly queryService: FactCheckingQueryService) {}

  metrics = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    const metrics = await this.queryService.getActorMetrics({
      actorId: actor.actorId,
      actorRole: actor.actorRole,
    })
    return ok(c, presentActorMetrics(metrics))
  }
}
