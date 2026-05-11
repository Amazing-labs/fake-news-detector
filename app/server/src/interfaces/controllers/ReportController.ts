import { FactCheckingService } from '../../application/services/FactCheckingService'
import { ValidationError } from '../../shared/errors'
import type { IReportRepository } from '../../domain/repositories'
import { created, ok } from '../http/responses'
import type { AppVariables } from '../http/types'
import type { Context } from 'hono'
import { submitReportSchema } from '../http/schemas/reportSchemas'
import { presentReportList } from '../presenters/reportPresenter'

export class ReportController {
  constructor(
    private readonly factCheckingService: FactCheckingService,
    private readonly reportRepository: IReportRepository,
  ) {}

  createReport = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    const body = submitReportSchema.parse(await c.req.json())
    if (actor.actorId !== body.citizenId) {
      throw new ValidationError(
        'Authenticated actor cannot submit a report for another citizen',
      )
    }
    const reportId = await this.factCheckingService.submitReport(body)
    return created(c, { id: reportId }, 'Signalement cree')
  }

  listReports = async (c: Context<{ Variables: AppVariables }>) => {
    const citizenId = c.req.query('citizenId')
    const reports = citizenId
      ? await this.reportRepository.findByCitizenId(citizenId)
      : await this.reportRepository.findAll()

    return ok(c, presentReportList(reports))
  }
}
