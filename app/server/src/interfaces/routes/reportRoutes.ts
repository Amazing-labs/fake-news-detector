import { createRoute } from '@hono/zod-openapi'
import type { SecurityService } from '../../application/services/SecurityService'
import { ReportController } from '../controllers/ReportController'
import {
  createAuthMiddleware,
  createPermissionMiddleware,
} from '../middlewares/authMiddleware'
import {
  createOpenAPIRoutes,
  createdResponse,
  okResponse,
} from '../http/openapi'
import {
  reportIdParamSchema,
  submitReportSchema,
} from '../http/schemas/reportSchemas'

export function createReportRoutes(
  reportController: ReportController,
  securityService: SecurityService,
) {
  const routes = createOpenAPIRoutes()
  const auth = createAuthMiddleware(securityService)

  routes.use('*', auth)

  routes.openapi(
    createRoute({
      method: 'get',
      path: '/',
      responses: okResponse('List of reports'),
    }),
    reportController.listReports,
  )

  routes.openapi(
    createRoute({
      method: 'get',
      path: '/{reportId}',
      request: { params: reportIdParamSchema },
      responses: okResponse('Report detail'),
    }),
    reportController.getById,
  )

  routes.openapi(
    createRoute({
      method: 'post',
      path: '/',
      middleware: createPermissionMiddleware(securityService, 'report.submit'),
      request: {
        body: {
          content: { 'application/json': { schema: submitReportSchema } },
        },
      },
      responses: createdResponse('Report created'),
    }),
    reportController.createReport,
  )

  return routes
}
