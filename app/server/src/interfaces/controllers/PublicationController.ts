import type { Context } from 'hono'
import { FactCheckingService } from '../../application/services/FactCheckingService'
import type { IPublicationRepository } from '../../domain/repositories'
import { created, ok } from '../http/responses'
import type { AppVariables } from '../http/types'
import { requiredParam } from '../http/request'
import { correctionSchema } from '../http/schemas/publicationSchemas'
import { presentPublicationList } from '../presenters/publicationPresenter'

export class PublicationController {
  constructor(
    private readonly factCheckingService: FactCheckingService,
    private readonly publicationRepository: IPublicationRepository,
  ) {}

  list = async (c: Context<{ Variables: AppVariables }>) => {
    const scope = c.req.query('scope')
    const items =
      scope === 'corrections'
        ? await this.publicationRepository.findCorrections()
        : await this.publicationRepository.findAll({ orderBy: 'desc' })
    return ok(c, presentPublicationList(items))
  }

  publishCorrection = async (c: Context<{ Variables: AppVariables }>) => {
    const body = correctionSchema.parse(await c.req.json())
    const correctionId = await this.factCheckingService.publishCorrection(
      body.directorId,
      requiredParam(c, 'publicationId'),
      {
        title: body.title,
        content: body.content,
      },
    )
    return created(c, { correctionId }, 'Correction publiee')
  }
}
