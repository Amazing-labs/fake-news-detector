import { createRoute } from '@hono/zod-openapi'
import type { SecurityService } from '../../application/services/SecurityService'
import { InvestigationController } from '../controllers/InvestigationController'
import {
  createAuthMiddleware,
  createPermissionMiddleware,
} from '../middlewares/authMiddleware'
import {
  createOpenAPIRoutes,
  createdResponse,
  noContentResponse,
  okResponse,
} from '../http/openapi'
import {
  approveInvestigationSchema,
  archiveSchema,
  directorReasonSchema,
  investigationEvidenceMediaParamSchema,
  investigationIdParamSchema,
  investigationSourceMediaParamSchema,
  proofMediaSchema,
  submitWatcherEvidenceSchema,
  updateMediaSchema,
} from '../http/schemas/investigationSchemas'

const jsonBody = <T>(schema: T) => ({
  content: { 'application/json': { schema } },
})

export function createInvestigationRoutes(
  investigationController: InvestigationController,
  securityService: SecurityService,
) {
  const routes = createOpenAPIRoutes()
  const auth = createAuthMiddleware(securityService)

  routes.use('*', auth)

  routes.openapi(
    createRoute({
      method: 'get',
      path: '/',
      responses: okResponse('List of investigations'),
    }),
    investigationController.list,
  )

  routes.openapi(
    createRoute({
      method: 'get',
      path: '/{investigationId}',
      request: { params: investigationIdParamSchema },
      responses: okResponse('Investigation detail'),
    }),
    investigationController.getById,
  )

  routes.openapi(
    createRoute({
      method: 'get',
      path: '/{investigationId}/source-media',
      request: { params: investigationIdParamSchema },
      responses: okResponse('Investigation source media'),
    }),
    investigationController.listSourceMedia,
  )

  routes.openapi(
    createRoute({
      method: 'get',
      path: '/{investigationId}/evidence',
      request: { params: investigationIdParamSchema },
      responses: okResponse('Investigation watcher evidence'),
    }),
    investigationController.listEvidence,
  )

  routes.openapi(
    createRoute({
      method: 'post',
      path: '/{investigationId}/review',
      middleware: createPermissionMiddleware(
        securityService,
        'investigation.submitForReview',
      ),
      request: { params: investigationIdParamSchema },
      responses: noContentResponse('Investigation submitted for review'),
    }),
    investigationController.submitForReview,
  )

  routes.openapi(
    createRoute({
      method: 'post',
      path: '/{investigationId}/source-media/{mediaId}',
      middleware: createPermissionMiddleware(
        securityService,
        'investigation.update',
      ),
      request: {
        params: investigationSourceMediaParamSchema,
        body: jsonBody(updateMediaSchema),
      },
      responses: noContentResponse('Source media updated'),
    }),
    investigationController.updateSourceMedia,
  )

  routes.openapi(
    createRoute({
      method: 'post',
      path: '/{investigationId}/evidence/{evidenceId}/media/{mediaId}',
      middleware: createPermissionMiddleware(
        securityService,
        'investigation.update',
      ),
      request: {
        params: investigationEvidenceMediaParamSchema,
        body: jsonBody(updateMediaSchema),
      },
      responses: noContentResponse('Watcher evidence media updated'),
    }),
    investigationController.updateWatcherEvidenceMedia,
  )

  routes.openapi(
    createRoute({
      method: 'post',
      path: '/{investigationId}/proof-media',
      middleware: createPermissionMiddleware(
        securityService,
        'investigation.update',
      ),
      request: {
        params: investigationIdParamSchema,
        body: jsonBody(proofMediaSchema),
      },
      responses: noContentResponse('Proof media added'),
    }),
    investigationController.addProofMedia,
  )

  routes.openapi(
    createRoute({
      method: 'post',
      path: '/{investigationId}/evidence',
      middleware: createPermissionMiddleware(
        securityService,
        'evidence.submit',
      ),
      request: {
        params: investigationIdParamSchema,
        body: jsonBody(submitWatcherEvidenceSchema),
      },
      responses: createdResponse('Watcher evidence submitted'),
    }),
    investigationController.submitWatcherEvidence,
  )

  routes.openapi(
    createRoute({
      method: 'post',
      path: '/{investigationId}/approve',
      middleware: createPermissionMiddleware(
        securityService,
        'investigation.approve',
      ),
      request: {
        params: investigationIdParamSchema,
        body: jsonBody(approveInvestigationSchema),
      },
      responses: createdResponse('Investigation approved'),
    }),
    investigationController.approve,
  )

  routes.openapi(
    createRoute({
      method: 'post',
      path: '/{investigationId}/reject',
      middleware: createPermissionMiddleware(
        securityService,
        'investigation.reject',
      ),
      request: {
        params: investigationIdParamSchema,
        body: jsonBody(directorReasonSchema),
      },
      responses: noContentResponse('Investigation rejected'),
    }),
    investigationController.reject,
  )

  routes.openapi(
    createRoute({
      method: 'post',
      path: '/{investigationId}/archive',
      middleware: createPermissionMiddleware(
        securityService,
        'investigation.archive',
      ),
      request: {
        params: investigationIdParamSchema,
        body: jsonBody(archiveSchema),
      },
      responses: noContentResponse('Investigation archived'),
    }),
    investigationController.archive,
  )

  routes.openapi(
    createRoute({
      method: 'post',
      path: '/{investigationId}/cancel',
      middleware: createPermissionMiddleware(
        securityService,
        'investigation.cancel',
      ),
      request: {
        params: investigationIdParamSchema,
        body: jsonBody(directorReasonSchema),
      },
      responses: noContentResponse('Investigation canceled'),
    }),
    investigationController.cancel,
  )

  return routes
}
