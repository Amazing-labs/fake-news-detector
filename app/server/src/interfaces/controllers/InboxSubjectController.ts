import type { Context } from 'hono'
import { FactCheckingService } from '../../application/services/FactCheckingService'
import type {
  IInboxSubjectRepository,
  IReportRepository,
} from '../../domain/repositories'
import { created, noContent, ok } from '../http/responses'
import type { AppVariables } from '../http/types'
import { requiredParam } from '../http/request'
import type { InboxSubjectStatus } from '../../domain/entities/InboxSubject'
import {
  createDirectorInboxSubjectSchema,
  deleteInboxSubjectSchema,
  pickInboxSubjectSchema,
} from '../http/schemas/inboxSubjectSchemas'
import { presentInboxSubjectList } from '../presenters/inboxSubjectPresenter'
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
    private readonly inboxSubjectRepository: IInboxSubjectRepository,
    private readonly reportRepository: IReportRepository,
  ) {}

  list = async (c: Context<{ Variables: AppVariables }>) => {
    const rawStatus = c.req.query('status')
    const status = rawStatus
      ? inboxSubjectStatusQuerySchema.parse(rawStatus)
      : undefined
    const items = status
      ? await this.inboxSubjectRepository.findByStatus(
          status as InboxSubjectStatus,
        )
      : await this.inboxSubjectRepository.findAll()
    return ok(c, presentInboxSubjectList(items))
  }

  createDirectorSubject = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    const body = createDirectorInboxSubjectSchema.parse(await c.req.json())
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
    pickInboxSubjectSchema.parse(await c.req.json())
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
    const body = deleteInboxSubjectSchema.parse(await c.req.json())
    await this.factCheckingService.deleteInboxSubjectByDirector(
      actor.actorId,
      requiredParam(c, 'inboxSubjectId'),
      body.reason,
    )
    return noContent(c)
  }

  listOpenReports = async (c: Context<{ Variables: AppVariables }>) => {
    const items = await this.reportRepository.listInbox()
    return ok(c, presentReportList(items))
  }
}
