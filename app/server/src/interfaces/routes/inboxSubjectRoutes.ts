import { Hono } from 'hono'
import type { SecurityService } from '../../application/services/SecurityService'
import { InboxSubjectController } from '../controllers/InboxSubjectController'
import type { AppVariables } from '../http/types'
import {
  createAuthMiddleware,
  createPermissionMiddleware,
} from '../middlewares/authMiddleware'

export function createInboxSubjectRoutes(
  inboxSubjectController: InboxSubjectController,
  securityService: SecurityService,
) {
  const routes = new Hono<{ Variables: AppVariables }>()
  const auth = createAuthMiddleware(securityService)

  routes.use('*', auth)

  routes.get('/', inboxSubjectController.list)
  routes.get(
    '/report-inbox',
    createPermissionMiddleware(securityService, 'report.pick'),
    inboxSubjectController.listOpenReports,
  )
  routes.post(
    '/',
    createPermissionMiddleware(securityService, 'inbox.manage'),
    inboxSubjectController.createDirectorSubject,
  )
  routes.post(
    '/:inboxSubjectId/pick',
    createPermissionMiddleware(securityService, 'report.pick'),
    inboxSubjectController.pick,
  )
  routes.delete(
    '/:inboxSubjectId',
    createPermissionMiddleware(securityService, 'inbox.manage'),
    inboxSubjectController.delete,
  )

  return routes
}
