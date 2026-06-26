import { createRoute } from '@hono/zod-openapi'
import type { SecurityService } from '../../application/services/SecurityService'
import { PublicationController } from '../controllers/PublicationController'
import {
  createAuthMiddleware,
  createPermissionMiddleware,
} from '../middlewares/authMiddleware'
import {
  createOpenAPIRoutes,
  createdResponse,
  jsonBody,
  okResponse,
} from '../http/openapi'
import {
  correctionSchema,
  publicationIdParamSchema,
} from '../http/schemas/publicationSchemas'

export function createPublicationRoutes(
  publicationController: PublicationController,
  securityService: SecurityService,
) {
  const routes = createOpenAPIRoutes()
  const auth = createAuthMiddleware(securityService)

  routes.use('*', auth)

  routes.openapi(
    createRoute({
      method: 'get',
      path: '/',
      responses: okResponse('List of publications'),
    }),
    publicationController.list,
  )

  routes.openapi(
    createRoute({
      method: 'get',
      path: '/{publicationId}',
      request: { params: publicationIdParamSchema },
      responses: okResponse('Publication detail'),
    }),
    publicationController.getById,
  )

  routes.openapi(
    createRoute({
      method: 'get',
      path: '/{publicationId}/corrections',
      request: { params: publicationIdParamSchema },
      responses: okResponse('Corrections for a publication'),
    }),
    publicationController.listCorrections,
  )

  routes.openapi(
    createRoute({
      method: 'post',
      path: '/{publicationId}/corrections',
      middleware: createPermissionMiddleware(
        securityService,
        'publication.correct',
      ),
      request: {
        params: publicationIdParamSchema,
        body: jsonBody(correctionSchema),
      },
      responses: createdResponse('Correction published'),
    }),
    publicationController.publishCorrection,
  )

  return routes
}
