import type { Context } from 'hono'
import { FactCheckingService } from '../../application/services/FactCheckingService'
import type {
  IEvidenceRepository,
  IInvestigationMediaRepository,
  IInvestigationRepository,
} from '../../domain/repositories'
import { NotFoundError } from '../../shared/errors'
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
import {
  presentEvidence,
  presentInvestigation,
  presentInvestigationList,
  presentInvestigationMedia,
} from '../presenters/investigationPresenter'

export class InvestigationController {
  constructor(
    private readonly factCheckingService: FactCheckingService,
    private readonly investigationRepository: IInvestigationRepository,
    private readonly investigationMediaRepository: IInvestigationMediaRepository,
    private readonly evidenceRepository: IEvidenceRepository,
  ) {}

  list = async (c: Context<{ Variables: AppVariables }>) => {
    const scope = c.req.query('scope')
    const journalistId = c.req.query('journalistId')

    if (scope === 'in-progress') {
      const items = await this.investigationRepository.findInProgress()
      return ok(c, presentInvestigationList(items))
    }

    if (scope === 'pending-review') {
      const items = await this.investigationRepository.findPendingReviews()
      return ok(c, presentInvestigationList(items))
    }

    if (scope === 'published') {
      const items = await this.investigationRepository.findPublished()
      return ok(c, presentInvestigationList(items))
    }

    if (scope === 'canceled') {
      const items = await this.investigationRepository.findCanceled()
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

  getById = async (c: Context<{ Variables: AppVariables }>) => {
    const id = requiredParam(c, 'investigationId')
    const investigation = await this.investigationRepository.findById(id)
    if (!investigation) throw new NotFoundError('Investigation', id)
    return ok(c, presentInvestigation(investigation))
  }

  listSourceMedia = async (c: Context<{ Variables: AppVariables }>) => {
    const id = requiredParam(c, 'investigationId')
    const media =
      await this.investigationMediaRepository.findByInvestigationId(id)
    return ok(c, {
      items: media.map(presentInvestigationMedia),
      total: media.length,
    })
  }

  listEvidence = async (c: Context<{ Variables: AppVariables }>) => {
    const id = requiredParam(c, 'investigationId')
    const evidences =
      await this.evidenceRepository.findWithMediaByInvestigationId(id)
    const items = evidences.map(({ evidence, media }) => ({
      ...presentEvidence(evidence),
      media: media.map((m) => ({
        id: m.id,
        url: m.url,
        type: m.type,
        order: m.order,
        evidenceId: m.evidenceId,
        uploadedById: m.uploadedById,
        category: m.category ?? null,
        reliability: m.reliability ?? null,
        justification: m.justification ?? null,
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
      })),
    }))
    return ok(c, { items, total: items.length })
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
