import type { Context } from 'hono'
import { FactCheckingService } from '../../application/services/FactCheckingService'
import { FactCheckingQueryService } from '../../application/services/FactCheckingQueryService'
import { created, noContent, ok } from '../http/responses'
import type { AppVariables } from '../http/types'
import { requiredParam, validatedJson } from '../http/request'
import type {
  createDirectorInboxSubjectSchema,
  deleteInboxSubjectSchema,
} from '../http/schemas/inboxSubjectSchemas'
import {
  presentInboxSubject,
  presentInboxSubjectList,
} from '../presenters/inboxSubjectPresenter'
import { presentInvestigation } from '../presenters/investigationPresenter'
import { presentReportList } from '../presenters/reportPresenter'
import { z } from 'zod'

const inboxSubjectStatusQuerySchema = z.enum([
  'OPEN',
  'IN_PROGRESS',
  'ARCHIVED',
])

export class InboxSubjectController {
  constructor(
    private readonly factCheckingService: FactCheckingService,
    private readonly queryService: FactCheckingQueryService,
  ) {}

  getById = async (c: Context<{ Variables: AppVariables }>) => {
    const id = requiredParam(c, 'inboxSubjectId')
    const subject = await this.queryService.getInboxSubject(id)
    return ok(c, presentInboxSubject(subject))
  }

  list = async (c: Context<{ Variables: AppVariables }>) => {
    const rawStatus = c.req.query('status')
    const status = rawStatus
      ? inboxSubjectStatusQuerySchema.parse(rawStatus)
      : undefined
    const items = await this.queryService.listInboxSubjects(status)
    return ok(c, presentInboxSubjectList(items))
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
    const items = await this.queryService.listOpenReportsInbox()
    return ok(c, presentReportList(items))
  }
}
