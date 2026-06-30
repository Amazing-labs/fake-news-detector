import type { Context } from 'hono'
import { FactCheckingQueryService } from '../../application/services/FactCheckingQueryService'
import { BusinessRuleError } from '../../shared/errors'
import { ok } from '../http/responses'
import type { AppVariables } from '../http/types'

export class MeController {
  constructor(private readonly queryService: FactCheckingQueryService) {}

  getMe = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')

    if (actor.actorRole === 'CITIZEN') {
      const citizen = await this.queryService.getCitizen(actor.actorId)
      return ok(c, {
        id: citizen.id,
        role: 'CITIZEN' as const,
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
      })
    }

    if (actor.actorRole === 'JOURNALIST') {
      const journalist = await this.queryService.getJournalist(actor.actorId)
      return ok(c, {
        id: journalist.id,
        role: 'JOURNALIST' as const,
        name: journalist.name,
        email: journalist.email,
        status: journalist.status,
        engagementScore: journalist.engagementScore,
        activeInvestigationsCount: journalist.activeInvestigationsCount,
        statusReason: journalist.statusReason,
        statusReasonDetails: journalist.statusReasonDetails,
        createdAt: journalist.createdAt.toISOString(),
        updatedAt: journalist.updatedAt.toISOString(),
      })
    }

    if (actor.actorRole === 'EDITORIAL_DIRECTOR') {
      const director = await this.queryService.getDirector(actor.actorId)
      return ok(c, {
        id: director.id,
        role: 'EDITORIAL_DIRECTOR' as const,
        name: director.name,
        email: director.email,
        status: director.status,
        createdAt: director.createdAt.toISOString(),
        updatedAt: director.updatedAt.toISOString(),
      })
    }

    throw new BusinessRuleError(
      `Unsupported actor role: ${actor.actorRole as string}`,
    )
  }

  // The connected actor's own contributions (watcher evidence), newest first.
  // Returns an empty list for actors who have never contributed.
  listContributions = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    const contributions =
      await this.queryService.listContributionsForWatcherEnriched(actor.actorId)

    return ok(c, {
      items: contributions.map(
        ({ evidence, investigationTitle, investigationStatus }) => ({
          id: evidence.id,
          investigationId: evidence.investigationId,
          investigationTitle,
          investigationStatus,
          title: evidence.title,
          content: evidence.content,
          createdAt: evidence.createdAt.toISOString(),
        }),
      ),
      total: contributions.length,
    })
  }
}
