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

export class InboxSubjectController {
  constructor(
    private readonly factCheckingService: FactCheckingService,
    private readonly inboxSubjectRepository: IInboxSubjectRepository,
    private readonly reportRepository: IReportRepository,
  ) {}

  list = async (c: Context<{ Variables: AppVariables }>) => {
    const status = c.req.query('status')
    const items = status
      ? await this.inboxSubjectRepository.findByStatus(
          status as InboxSubjectStatus,
        )
      : await this.inboxSubjectRepository.findAll()
    return ok(c, presentInboxSubjectList(items))
  }

  createDirectorSubject = async (c: Context<{ Variables: AppVariables }>) => {
    const body = createDirectorInboxSubjectSchema.parse(await c.req.json())
    const inboxSubjectId =
      await this.factCheckingService.createDirectorInboxSubject(
        body.directorId,
        {
          theme: body.theme,
          description: body.description,
          media: body.media,
        },
      )
    return created(c, { id: inboxSubjectId }, 'Sujet de veille cree')
  }

  pick = async (c: Context<{ Variables: AppVariables }>) => {
    const body = pickInboxSubjectSchema.parse(await c.req.json())
    const investigation = await this.factCheckingService.pickInboxSubject(
      body.journalistId,
      requiredParam(c, 'inboxSubjectId'),
    )
    return created(
      c,
      presentInvestigation(investigation),
      'Sujet pris en charge',
    )
  }

  delete = async (c: Context<{ Variables: AppVariables }>) => {
    const body = deleteInboxSubjectSchema.parse(await c.req.json())
    await this.factCheckingService.deleteInboxSubjectByDirector(
      body.directorId,
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
