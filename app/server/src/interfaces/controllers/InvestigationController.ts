import type { Context } from 'hono'
import { FactCheckingService } from '../../application/services/FactCheckingService'
import { FactCheckingQueryService } from '../../application/services/FactCheckingQueryService'
import { created, noContent, ok } from '../http/responses'
import type { AppVariables } from '../http/types'
import {
  requiredNumericParam,
  requiredParam,
  validatedJson,
} from '../http/request'
import type {
  approveInvestigationSchema,
  archiveSchema,
  directorReasonSchema,
  proofMediaSchema,
  submitWatcherEvidenceSchema,
  updateInvestigationDraftSchema,
  updateMediaSchema,
} from '../http/schemas/investigationSchemas'
import {
  presentEnrichedEvidenceList,
  presentEnrichedInvestigation,
  presentEnrichedInvestigationList,
  presentEnrichedInvestigationMediaList,
} from '../presenters/investigationPresenter'
import type { z } from 'zod'

export class InvestigationController {
  constructor(
    private readonly factCheckingService: FactCheckingService,
    private readonly queryService: FactCheckingQueryService,
  ) {}

  list = async (c: Context<{ Variables: AppVariables }>) => {
    const items = await this.queryService.listInvestigationsEnriched({
      scope: c.req.query('scope'),
      journalistId: c.req.query('journalistId'),
    })
    return ok(c, presentEnrichedInvestigationList(items))
  }

  getById = async (c: Context<{ Variables: AppVariables }>) => {
    const id = requiredParam(c, 'investigationId')
    const investigation = await this.queryService.getInvestigationEnriched(id)
    return ok(c, presentEnrichedInvestigation(investigation))
  }

  listSourceMedia = async (c: Context<{ Variables: AppVariables }>) => {
    const id = requiredParam(c, 'investigationId')
    const media =
      await this.queryService.getInvestigationSourceMediaEnriched(id)
    return ok(c, presentEnrichedInvestigationMediaList(media))
  }

  listEvidence = async (c: Context<{ Variables: AppVariables }>) => {
    const id = requiredParam(c, 'investigationId')
    const evidences =
      await this.queryService.getInvestigationEvidenceEnriched(id)
    return ok(c, presentEnrichedEvidenceList(evidences))
  }

  submitForReview = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    await this.factCheckingService.submitInvestigationForReview(
      actor.actorId,
      requiredParam(c, 'investigationId'),
    )
    return noContent(c)
  }

  updateDraft = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    const body =
      validatedJson<z.infer<typeof updateInvestigationDraftSchema>>(c)
    await this.factCheckingService.updateInvestigationDraft(
      actor.actorId,
      requiredParam(c, 'investigationId'),
      {
        mediaCategory: body.mediaCategory,
        draftVerdict: body.draftVerdict,
        investigationNotes: body.investigationNotes,
      },
    )
    return noContent(c)
  }

  updateSourceMedia = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    const body = validatedJson<z.infer<typeof updateMediaSchema>>(c)
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
    const body = validatedJson<z.infer<typeof updateMediaSchema>>(c)
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
    const body = validatedJson<z.infer<typeof proofMediaSchema>>(c)
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
    const body = validatedJson<z.infer<typeof approveInvestigationSchema>>(c)
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
    const body = validatedJson<z.infer<typeof directorReasonSchema>>(c)
    await this.factCheckingService.rejectInvestigation(
      actor.actorId,
      requiredParam(c, 'investigationId'),
      body.reason,
    )
    return noContent(c)
  }

  archive = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    const body = validatedJson<z.infer<typeof archiveSchema>>(c)
    await this.factCheckingService.archiveUnverifiableInvestigation(
      actor.actorId,
      requiredParam(c, 'investigationId'),
      body.comment,
    )
    return noContent(c)
  }

  cancel = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    const body = validatedJson<z.infer<typeof directorReasonSchema>>(c)
    await this.factCheckingService.cancelInvestigation(
      actor.actorId,
      requiredParam(c, 'investigationId'),
      body.reason,
    )
    return noContent(c)
  }

  submitWatcherEvidence = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    const body = validatedJson<z.infer<typeof submitWatcherEvidenceSchema>>(c)
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
