import { Hono } from 'hono'
import type { SecurityService } from '../../application/services/SecurityService'
import { ReportController } from '../controllers/ReportController'
import {
  createAuthMiddleware,
  createPermissionMiddleware,
} from '../middlewares/authMiddleware'
import type { AppVariables } from '../http/types'

export function createReportRoutes(
  reportController: ReportController,
  securityService: SecurityService,
) {
  const reportRoutes = new Hono<{ Variables: AppVariables }>()
  const auth = createAuthMiddleware(securityService)

  reportRoutes.use('*', auth)

  reportRoutes.get('/', reportController.listReports)
  reportRoutes.get('/:reportId', reportController.getById)

  reportRoutes.post(
    '/',
    createPermissionMiddleware(securityService, 'report.submit'),
    reportController.createReport,
  )

  return reportRoutes
}
