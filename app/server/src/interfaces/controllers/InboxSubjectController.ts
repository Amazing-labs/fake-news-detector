import type { Context } from 'hono'
import { FactCheckingService } from '../../application/services/FactCheckingService'
import { FactCheckingQueryService } from '../../application/services/FactCheckingQueryService'
import { created, noContent, ok } from '../http/responses'
import type { AppVariables } from '../http/types'
import { requiredParam, validatedJson, validatedQuery } from '../http/request'
import type {
  createDirectorInboxSubjectSchema,
  deleteInboxSubjectSchema,
  inboxSubjectListQuerySchema,
} from '../http/schemas/inboxSubjectSchemas'
import {
  presentEnrichedInboxSubject,
  presentEnrichedInboxSubjectList,
} from '../presenters/inboxSubjectPresenter'
import { presentInvestigation } from '../presenters/investigationPresenter'
import { presentEnrichedReportList } from '../presenters/reportPresenter'
import type { z } from 'zod'

export class InboxSubjectController {
  constructor(
    private readonly factCheckingService: FactCheckingService,
    private readonly queryService: FactCheckingQueryService,
  ) {}

  getById = async (c: Context<{ Variables: AppVariables }>) => {
    const id = requiredParam(c, 'inboxSubjectId')
    const subject = await this.queryService.getInboxSubjectEnriched(id)
    return ok(c, presentEnrichedInboxSubject(subject))
  }

  list = async (c: Context<{ Variables: AppVariables }>) => {
    const { status } =
      validatedQuery<z.infer<typeof inboxSubjectListQuerySchema>>(c)
    const items = await this.queryService.listInboxSubjectsEnriched(status)
    return ok(c, presentEnrichedInboxSubjectList(items))
  }

  createDirectorSubject = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    const body =
      validatedJson<z.infer<typeof createDirectorInboxSubjectSchema>>(c)
    const inboxSubjectId =
      await this.factCheckingService.createDirectorInboxSubject(actor.actorId, {
        theme: body.theme,
        description: body.description,
        media: body.media,
      })
    return created(c, { id: inboxSubjectId }, 'Sujet de veille cree')
  }

  pick = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    const investigation = await this.factCheckingService.pickInboxSubject(
      actor.actorId,
      requiredParam(c, 'inboxSubjectId'),
    )
    return created(
      c,
      presentInvestigation(investigation),
      'Sujet pris en charge',
    )
  }

  delete = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    const body = validatedJson<z.infer<typeof deleteInboxSubjectSchema>>(c)
    await this.factCheckingService.deleteInboxSubjectByDirector(
      actor.actorId,
      requiredParam(c, 'inboxSubjectId'),
      body.reason,
    )
    return noContent(c)
  }

  listOpenReports = async (c: Context<{ Variables: AppVariables }>) => {
    const items = await this.queryService.listOpenReportsInboxEnriched()
    return ok(c, presentEnrichedReportList(items))
  }
}
