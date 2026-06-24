import { Hono } from 'hono'
import type { SecurityService } from '../../application/services/SecurityService'
import { InvestigationController } from '../controllers/InvestigationController'
import type { AppVariables } from '../http/types'
import {
  createAuthMiddleware,
  createPermissionMiddleware,
} from '../middlewares/authMiddleware'

export function createInvestigationRoutes(
  investigationController: InvestigationController,
  securityService: SecurityService,
) {
  const routes = new Hono<{ Variables: AppVariables }>()
  const auth = createAuthMiddleware(securityService)

  routes.use('*', auth)

  routes.get('/', investigationController.list)
  routes.get('/:investigationId', investigationController.getById)
  routes.get(
    '/:investigationId/source-media',
    investigationController.listSourceMedia,
  )
  routes.get('/:investigationId/evidence', investigationController.listEvidence)
  routes.post(
    '/:investigationId/review',
    createPermissionMiddleware(
      securityService,
      'investigation.submitForReview',
    ),
    investigationController.submitForReview,
  )
  routes.post(
    '/:investigationId/source-media/:mediaId',
    createPermissionMiddleware(securityService, 'investigation.update'),
    investigationController.updateSourceMedia,
  )
  routes.post(
    '/:investigationId/evidence/:evidenceId/media/:mediaId',
    createPermissionMiddleware(securityService, 'investigation.update'),
    investigationController.updateWatcherEvidenceMedia,
  )
  routes.post(
    '/:investigationId/proof-media',
    createPermissionMiddleware(securityService, 'investigation.update'),
    investigationController.addProofMedia,
  )
  routes.post(
    '/:investigationId/evidence',
    createPermissionMiddleware(securityService, 'evidence.submit'),
    investigationController.submitWatcherEvidence,
  )
  routes.post(
    '/:investigationId/approve',
    createPermissionMiddleware(securityService, 'investigation.approve'),
    investigationController.approve,
  )
  routes.post(
    '/:investigationId/reject',
    createPermissionMiddleware(securityService, 'investigation.reject'),
    investigationController.reject,
  )
  routes.post(
    '/:investigationId/archive',
    createPermissionMiddleware(securityService, 'investigation.archive'),
    investigationController.archive,
  )
  routes.post(
    '/:investigationId/cancel',
    createPermissionMiddleware(securityService, 'investigation.cancel'),
    investigationController.cancel,
  )

  return routes
}
