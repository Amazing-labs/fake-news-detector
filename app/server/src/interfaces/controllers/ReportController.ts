import { FactCheckingService } from '../../application/services/FactCheckingService'
import { FactCheckingQueryService } from '../../application/services/FactCheckingQueryService'
import { created, ok } from '../http/responses'
import type { AppVariables } from '../http/types'
import type { Context } from 'hono'
import { requiredParam, validatedJson, validatedQuery } from '../http/request'
import type {
  reportListQuerySchema,
  submitReportSchema,
} from '../http/schemas/reportSchemas'
import { presentReport, presentReportList } from '../presenters/reportPresenter'
import type { z } from 'zod'

export class ReportController {
  constructor(
    private readonly factCheckingService: FactCheckingService,
    private readonly queryService: FactCheckingQueryService,
  ) {}

  createReport = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    const body = validatedJson<z.infer<typeof submitReportSchema>>(c)
    const reportId = await this.factCheckingService.submitReport({
      citizenId: actor.actorId,
      ...body,
    })
    return created(c, { id: reportId }, 'Signalement cree')
  }

  getById = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    const report = await this.queryService.getReportForReader(
      requiredParam(c, 'reportId'),
      actor,
    )
    return ok(c, presentReport(report))
  }

  listReports = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    const { citizenId } =
      validatedQuery<z.infer<typeof reportListQuerySchema>>(c)
    const reports = await this.queryService.listReportsForReader(
      actor,
      citizenId,
    )
    return ok(c, presentReportList(reports))
  }
}
