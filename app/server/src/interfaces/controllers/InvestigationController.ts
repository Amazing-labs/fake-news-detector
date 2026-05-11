import type { Context } from 'hono'
import { FactCheckingService } from '../../application/services/FactCheckingService'
import type { IInvestigationRepository } from '../../domain/repositories'
import { created, noContent, ok } from '../http/responses'
import type { AppVariables } from '../http/types'
import { requiredParam } from '../http/request'
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
    const { journalistId } = journalistActionSchema.parse(await c.req.json())
    await this.factCheckingService.submitInvestigationForReview(
      journalistId,
      requiredParam(c, 'investigationId'),
    )
    return noContent(c)
  }

  updateSourceMedia = async (c: Context<{ Variables: AppVariables }>) => {
    const body = updateMediaSchema.parse(await c.req.json())
    await this.factCheckingService.updateInvestigationSourceMediaItem(
      body.journalistId,
      requiredParam(c, 'investigationId'),
      Number(requiredParam(c, 'mediaId')),
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
    const body = updateMediaSchema.parse(await c.req.json())
    await this.factCheckingService.updateWatcherEvidenceMediaItem(
      body.journalistId,
      requiredParam(c, 'investigationId'),
      requiredParam(c, 'evidenceId'),
      Number(requiredParam(c, 'mediaId')),
      {
        category: body.category,
        reliability: body.reliability,
        justification: body.justification,
      },
    )
    return noContent(c)
  }

  addProofMedia = async (c: Context<{ Variables: AppVariables }>) => {
    const body = proofMediaSchema.parse(await c.req.json())
    await this.factCheckingService.addJournalistProofMedia(
      body.journalistId,
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
    const body = approveInvestigationSchema.parse(await c.req.json())
    const publicationId = await this.factCheckingService.approveInvestigation(
      body.directorId,
      requiredParam(c, 'investigationId'),
      {
        verifiedLinks: body.verifiedLinks,
        verifiedMedia: body.verifiedMedia,
      },
    )
    return created(c, { publicationId }, 'Investigation approuvee')
  }

  reject = async (c: Context<{ Variables: AppVariables }>) => {
    const body = directorReasonSchema.parse(await c.req.json())
    await this.factCheckingService.rejectInvestigation(
      body.directorId,
      requiredParam(c, 'investigationId'),
      body.reason,
    )
    return noContent(c)
  }

  archive = async (c: Context<{ Variables: AppVariables }>) => {
    const body = archiveSchema.parse(await c.req.json())
    await this.factCheckingService.archiveUnverifiableInvestigation(
      body.directorId,
      requiredParam(c, 'investigationId'),
      body.comment,
    )
    return noContent(c)
  }

  cancel = async (c: Context<{ Variables: AppVariables }>) => {
    const body = directorReasonSchema.parse(await c.req.json())
    await this.factCheckingService.cancelInvestigation(
      body.directorId,
      requiredParam(c, 'investigationId'),
      body.reason,
    )
    return noContent(c)
  }

  submitWatcherEvidence = async (c: Context<{ Variables: AppVariables }>) => {
    const body = submitWatcherEvidenceSchema.parse(await c.req.json())
    const evidenceId = await this.factCheckingService.submitWatcherEvidence({
      citizenId: body.citizenId,
      investigationId: requiredParam(c, 'investigationId'),
      title: body.title,
      content: body.content,
      media: body.media,
    })
    return created(c, { id: evidenceId }, 'Preuve watcher enregistree')
  }
}
