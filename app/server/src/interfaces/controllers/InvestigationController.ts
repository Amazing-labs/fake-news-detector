import type { Context } from 'hono'
import { FactCheckingService } from '../../application/services/FactCheckingService'
import type { IInvestigationRepository } from '../../domain/repositories'
import { created, noContent, ok } from '../http/responses'
import type { AppVariables } from '../http/types'
import { requiredNumericParam, requiredParam } from '../http/request'
import {
  approveInvestigationSchema,
  archiveSchema,
  directorReasonSchema,
  journalistActionSchema,
  proofMediaSchema,
  submitWatcherEvidenceSchema,
  updateMediaSchema,
} from '../http/schemas/investigationSchemas'
import { presentInvestigationList } from '../presenters/investigationPresenter'

export class InvestigationController {
  constructor(
    private readonly factCheckingService: FactCheckingService,
    private readonly investigationRepository: IInvestigationRepository,
  ) {}

  list = async (c: Context<{ Variables: AppVariables }>) => {
    const scope = c.req.query('scope')
    const journalistId = c.req.query('journalistId')

    if (scope === 'pending-review') {
      const items = await this.investigationRepository.findPendingReviews()
      return ok(c, presentInvestigationList(items))
    }

    if (scope === 'published') {
      const items = await this.investigationRepository.findPublished()
      return ok(c, presentInvestigationList(items))
    }

    if (journalistId) {
      const items =
        await this.investigationRepository.findByJournalistId(journalistId)
      return ok(c, presentInvestigationList(items))
    }

    const items = await this.investigationRepository.findPendingReviews()
    return ok(c, presentInvestigationList(items))
  }

  submitForReview = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    journalistActionSchema.parse(await c.req.json())
    await this.factCheckingService.submitInvestigationForReview(
      actor.actorId,
      requiredParam(c, 'investigationId'),
    )
    return noContent(c)
  }

  updateSourceMedia = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    const body = updateMediaSchema.parse(await c.req.json())
    await this.factCheckingService.updateInvestigationSourceMediaItem(
      actor.actorId,
      requiredParam(c, 'investigationId'),
      requiredNumericParam(c, 'mediaId'),
      {
        category: body.category,
        reliability: body.reliability,
        justification: body.justification,
      },
    )
    return noContent(c)
  }

  updateWatcherEvidenceMedia = async (
    c: Context<{ Variables: AppVariables }>,
  ) => {
    const actor = c.get('actor')
    const body = updateMediaSchema.parse(await c.req.json())
    await this.factCheckingService.updateWatcherEvidenceMediaItem(
      actor.actorId,
      requiredParam(c, 'investigationId'),
      requiredParam(c, 'evidenceId'),
      requiredNumericParam(c, 'mediaId'),
      {
        category: body.category,
        reliability: body.reliability,
        justification: body.justification,
      },
    )
    return noContent(c)
  }

  addProofMedia = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    const body = proofMediaSchema.parse(await c.req.json())
    await this.factCheckingService.addJournalistProofMedia(
      actor.actorId,
      requiredParam(c, 'investigationId'),
      {
        url: body.url,
        type: body.type,
        order: body.order,
        authoritySourceName: body.authoritySourceName,
        authoritySourceType: body.authoritySourceType,
      },
    )
    return noContent(c)
  }

  approve = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    const body = approveInvestigationSchema.parse(await c.req.json())
    const publicationId = await this.factCheckingService.approveInvestigation(
      actor.actorId,
      requiredParam(c, 'investigationId'),
      {
        verifiedLinks: body.verifiedLinks,
        verifiedMedia: body.verifiedMedia,
      },
    )
    return created(c, { publicationId }, 'Investigation approuvee')
  }

  reject = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    const body = directorReasonSchema.parse(await c.req.json())
    await this.factCheckingService.rejectInvestigation(
      actor.actorId,
      requiredParam(c, 'investigationId'),
      body.reason,
    )
    return noContent(c)
  }

  archive = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    const body = archiveSchema.parse(await c.req.json())
    await this.factCheckingService.archiveUnverifiableInvestigation(
      actor.actorId,
      requiredParam(c, 'investigationId'),
      body.comment,
    )
    return noContent(c)
  }

  cancel = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    const body = directorReasonSchema.parse(await c.req.json())
    await this.factCheckingService.cancelInvestigation(
      actor.actorId,
      requiredParam(c, 'investigationId'),
      body.reason,
    )
    return noContent(c)
  }

  submitWatcherEvidence = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    const body = submitWatcherEvidenceSchema.parse(await c.req.json())
    const evidenceId = await this.factCheckingService.submitWatcherEvidence({
      citizenId: actor.actorId,
      investigationId: requiredParam(c, 'investigationId'),
      title: body.title,
      content: body.content,
      media: body.media,
    })
    return created(c, { id: evidenceId }, 'Preuve watcher enregistree')
  }
}
