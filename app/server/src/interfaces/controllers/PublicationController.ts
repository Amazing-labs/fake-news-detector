import type { Context } from 'hono'
import { FactCheckingService } from '../../application/services/FactCheckingService'
import type {
  ICorrectionRepository,
  IPublicationRepository,
} from '../../domain/repositories'
import { NotFoundError } from '../../shared/errors'
import { created, ok } from '../http/responses'
import type { AppVariables } from '../http/types'
import { requiredParam } from '../http/request'
import { correctionSchema } from '../http/schemas/publicationSchemas'
import {
  presentCorrectionList,
  presentPublication,
  presentPublicationList,
} from '../presenters/publicationPresenter'

export class PublicationController {
  constructor(
    private readonly factCheckingService: FactCheckingService,
    private readonly publicationRepository: IPublicationRepository,
    private readonly correctionRepository: ICorrectionRepository,
  ) {}

  list = async (c: Context<{ Variables: AppVariables }>) => {
    const scope = c.req.query('scope')
    const items =
      scope === 'corrections'
        ? await this.publicationRepository.findCorrections()
        : await this.publicationRepository.findAll({ orderBy: 'desc' })
    return ok(c, presentPublicationList(items))
  }

  getById = async (c: Context<{ Variables: AppVariables }>) => {
    const id = requiredParam(c, 'publicationId')
    const publication = await this.publicationRepository.findById(id)
    if (!publication) throw new NotFoundError('Publication', id)
    return ok(c, presentPublication(publication))
  }

  listCorrections = async (c: Context<{ Variables: AppVariables }>) => {
    const id = requiredParam(c, 'publicationId')
    const corrections = await this.correctionRepository.findByPublicationId(id)
    return ok(c, presentCorrectionList(corrections))
  }

  publishCorrection = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    const body = correctionSchema.parse(await c.req.json())
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
