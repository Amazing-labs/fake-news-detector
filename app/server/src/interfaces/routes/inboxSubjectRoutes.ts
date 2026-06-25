import { createRoute } from '@hono/zod-openapi'
import type { SecurityService } from '../../application/services/SecurityService'
import { InboxSubjectController } from '../controllers/InboxSubjectController'
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
  createDirectorInboxSubjectSchema,
  deleteInboxSubjectSchema,
  inboxSubjectIdParamSchema,
} from '../http/schemas/inboxSubjectSchemas'

export function createInboxSubjectRoutes(
  inboxSubjectController: InboxSubjectController,
  securityService: SecurityService,
) {
  const routes = createOpenAPIRoutes()
  const auth = createAuthMiddleware(securityService)

  routes.use('*', auth)

  routes.openapi(
    createRoute({
      method: 'get',
      path: '/',
      responses: okResponse('List of inbox subjects'),
    }),
    inboxSubjectController.list,
  )

  routes.openapi(
    createRoute({
      method: 'get',
      path: '/report-inbox',
      middleware: createPermissionMiddleware(securityService, 'report.pick'),
      responses: okResponse('Open citizen reports inbox'),
    }),
    inboxSubjectController.listOpenReports,
  )

  routes.openapi(
    createRoute({
      method: 'get',
      path: '/{inboxSubjectId}',
      request: { params: inboxSubjectIdParamSchema },
      responses: okResponse('Inbox subject detail'),
    }),
    inboxSubjectController.getById,
  )

  routes.openapi(
    createRoute({
      method: 'post',
      path: '/',
      middleware: createPermissionMiddleware(securityService, 'inbox.manage'),
      request: {
        body: {
          content: {
            'application/json': { schema: createDirectorInboxSubjectSchema },
          },
        },
      },
      responses: createdResponse('Inbox subject created'),
    }),
    inboxSubjectController.createDirectorSubject,
  )

  routes.openapi(
    createRoute({
      method: 'post',
      path: '/{inboxSubjectId}/pick',
      middleware: createPermissionMiddleware(securityService, 'report.pick'),
      request: { params: inboxSubjectIdParamSchema },
      responses: createdResponse('Inbox subject picked up'),
    }),
    inboxSubjectController.pick,
  )

  routes.openapi(
    createRoute({
      method: 'delete',
      path: '/{inboxSubjectId}',
      middleware: createPermissionMiddleware(securityService, 'inbox.manage'),
      request: {
        params: inboxSubjectIdParamSchema,
        body: {
          content: {
            'application/json': { schema: deleteInboxSubjectSchema },
          },
        },
      },
      responses: noContentResponse('Inbox subject deleted'),
    }),
    inboxSubjectController.delete,
  )

  return routes
}
