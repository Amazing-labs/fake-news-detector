import { createRoute } from '@hono/zod-openapi'
import type { SecurityService } from '../../application/services/SecurityService'
import { DirectorController } from '../controllers/DirectorController'
import {
  createAuthMiddleware,
  createPermissionMiddleware,
} from '../middlewares/authMiddleware'
import {
  createOpenAPIRoutes,
  jsonBody,
  noContentResponse,
  okResponse,
} from '../http/openapi'
import {
  citizenIdParamSchema,
  citizenManagementSchema,
} from '../http/schemas/common'

export function createDirectorRoutes(
  directorController: DirectorController,
  securityService: SecurityService,
) {
  const routes = createOpenAPIRoutes()
  const auth = createAuthMiddleware(securityService)
  const manageCitizen = createPermissionMiddleware(
    securityService,
    'citizen.manage',
  )

  routes.use('*', auth)

  routes.openapi(
    createRoute({
      method: 'get',
      path: '/dashboard',
      middleware: createPermissionMiddleware(
        securityService,
        'director.dashboard.read',
      ),
      responses: okResponse('Director dashboard'),
    }),
    directorController.getDashboard,
  )

  routes.openapi(
    createRoute({
      method: 'get',
      path: '/citizens',
      middleware: manageCitizen,
      responses: okResponse('List of citizens'),
    }),
    directorController.listCitizens,
  )

  routes.openapi(
    createRoute({
      method: 'post',
      path: '/citizens/{citizenId}/ban',
      middleware: manageCitizen,
      request: {
        params: citizenIdParamSchema,
        body: jsonBody(citizenManagementSchema),
      },
      responses: noContentResponse('Citizen banned'),
    }),
    directorController.banCitizen,
  )

  routes.openapi(
    createRoute({
      method: 'post',
      path: '/citizens/{citizenId}/disable',
      middleware: manageCitizen,
      request: {
        params: citizenIdParamSchema,
        body: jsonBody(citizenManagementSchema),
      },
      responses: noContentResponse('Citizen disabled'),
    }),
    directorController.disableCitizen,
  )

  routes.openapi(
    createRoute({
      method: 'post',
      path: '/citizens/{citizenId}/activate',
      middleware: manageCitizen,
      request: { params: citizenIdParamSchema },
      responses: noContentResponse('Citizen activated'),
    }),
    directorController.activateCitizen,
  )

  return routes
}
