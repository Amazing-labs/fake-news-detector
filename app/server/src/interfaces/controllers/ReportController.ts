import { FactCheckingService } from '../../application/services/FactCheckingService'
import type { IReportRepository } from '../../domain/repositories'
import { NotFoundError } from '../../shared/errors'
import { created, ok } from '../http/responses'
import type { AppVariables } from '../http/types'
import type { Context } from 'hono'
import { requiredParam } from '../http/request'
import { submitReportSchema } from '../http/schemas/reportSchemas'
import { presentReport, presentReportList } from '../presenters/reportPresenter'

export class ReportController {
  constructor(
    private readonly factCheckingService: FactCheckingService,
    private readonly reportRepository: IReportRepository,
  ) {}

  createReport = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    const body = submitReportSchema.parse(await c.req.json())
    const reportId = await this.factCheckingService.submitReport({
      citizenId: actor.actorId,
      ...body,
    })
    return created(c, { id: reportId }, 'Signalement cree')
  }

  getById = async (c: Context<{ Variables: AppVariables }>) => {
    const id = requiredParam(c, 'reportId')
    const report = await this.reportRepository.findById(id)
    if (!report) throw new NotFoundError('Report', id)
    return ok(c, presentReport(report))
  }

  listReports = async (c: Context<{ Variables: AppVariables }>) => {
    const citizenId = c.req.query('citizenId')
    const reports = citizenId
      ? await this.reportRepository.findByCitizenId(citizenId)
      : await this.reportRepository.findAll()

    return ok(c, presentReportList(reports))
  }
}
