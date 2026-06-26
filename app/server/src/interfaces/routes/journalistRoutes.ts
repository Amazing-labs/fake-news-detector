import { createRoute } from '@hono/zod-openapi'
import type { SecurityService } from '../../application/services/SecurityService'
import { JournalistManagementController } from '../controllers/JournalistManagementController'
import {
  createAuthMiddleware,
  createPermissionMiddleware,
} from '../middlewares/authMiddleware'
import {
  createOpenAPIRoutes,
  createdResponse,
  jsonBody,
  noContentResponse,
  okResponse,
} from '../http/openapi'
import {
  createJournalistSchema,
  journalistActionSchema,
  journalistIdParamSchema,
} from '../http/schemas/journalistSchemas'

export function createJournalistRoutes(
  journalistManagementController: JournalistManagementController,
  securityService: SecurityService,
) {
  const routes = createOpenAPIRoutes()
  const auth = createAuthMiddleware(securityService)
  const manage = createPermissionMiddleware(
    securityService,
    'journalist.manage',
  )

  routes.use('*', auth)

  routes.openapi(
    createRoute({
      method: 'get',
      path: '/',
      middleware: manage,
      responses: okResponse('List of journalists'),
    }),
    journalistManagementController.list,
  )

  routes.openapi(
    createRoute({
      method: 'post',
      path: '/',
      middleware: manage,
      request: { body: jsonBody(createJournalistSchema) },
      responses: createdResponse('Journalist created'),
    }),
    journalistManagementController.create,
  )

  routes.openapi(
    createRoute({
      method: 'post',
      path: '/{journalistId}/ban',
      middleware: manage,
      request: {
        params: journalistIdParamSchema,
        body: jsonBody(journalistActionSchema),
      },
      responses: noContentResponse('Journalist banned'),
    }),
    journalistManagementController.ban,
  )

  routes.openapi(
    createRoute({
      method: 'post',
      path: '/{journalistId}/disable',
      middleware: manage,
      request: {
        params: journalistIdParamSchema,
        body: jsonBody(journalistActionSchema),
      },
      responses: noContentResponse('Journalist disabled'),
    }),
    journalistManagementController.disable,
  )

  routes.openapi(
    createRoute({
      method: 'post',
      path: '/{journalistId}/activate',
      middleware: manage,
      request: { params: journalistIdParamSchema },
      responses: noContentResponse('Journalist activated'),
    }),
    journalistManagementController.activate,
  )

  return routes
}
