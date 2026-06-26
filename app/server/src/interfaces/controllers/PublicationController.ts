import type { Context } from 'hono'
import { FactCheckingService } from '../../application/services/FactCheckingService'
import { FactCheckingQueryService } from '../../application/services/FactCheckingQueryService'
import { created, ok } from '../http/responses'
import type { AppVariables } from '../http/types'
import { requiredParam, validatedJson } from '../http/request'
import type { correctionSchema } from '../http/schemas/publicationSchemas'
import {
  presentCorrectionList,
  presentEnrichedPublication,
  presentEnrichedPublicationList,
} from '../presenters/publicationPresenter'
import type { z } from 'zod'

export class PublicationController {
  constructor(
    private readonly factCheckingService: FactCheckingService,
    private readonly queryService: FactCheckingQueryService,
  ) {}

  list = async (c: Context<{ Variables: AppVariables }>) => {
    const items = await this.queryService.listPublicationsEnriched(
      c.req.query('scope'),
    )
    return ok(c, presentEnrichedPublicationList(items))
  }

  getById = async (c: Context<{ Variables: AppVariables }>) => {
    const id = requiredParam(c, 'publicationId')
    const publication = await this.queryService.getPublicationEnriched(id)
    return ok(c, presentEnrichedPublication(publication))
  }

  listCorrections = async (c: Context<{ Variables: AppVariables }>) => {
    const id = requiredParam(c, 'publicationId')
    const corrections = await this.queryService.getPublicationCorrections(id)
    return ok(c, presentCorrectionList(corrections))
  }

  publishCorrection = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    const body = validatedJson<z.infer<typeof correctionSchema>>(c)
    const correctionId = await this.factCheckingService.publishCorrection(
      actor.actorId,
      requiredParam(c, 'publicationId'),
      {
        title: body.title,
        content: body.content,
      },
    )
    return created(c, { correctionId }, 'Correction publiee')
  }
}
