// interfaces/middlewares/authMiddleware.ts
import type { MiddlewareHandler } from 'hono'
import {
  type Permission,
  SecurityService,
} from '../../application/services/SecurityService'
import type { AppVariables } from '../http/types'

export function createAuthMiddleware(
  securityService: SecurityService,
): MiddlewareHandler<{ Variables: AppVariables }> {
  return async (c, next) => {
    const auth = await securityService.authenticate(c.req.raw.headers)
    if (!auth.isValid || !auth.actorId || !auth.role) {
      return c.json({ success: false, error: 'Unauthorized' }, 401)
    }

    if (auth.status && auth.status !== 'ACTIVE') {
      return c.json({ success: false, error: 'Forbidden' }, 403)
    }

    c.set('actor', {
      actorId: auth.actorId,
      actorRole: auth.role,
    })
    c.set('authSession', auth)

    await next()
  }
}

export function createPermissionMiddleware(
  securityService: SecurityService,
  permission: Permission,
): MiddlewareHandler<{ Variables: AppVariables }> {
  return async (c, next) => {
    const actor = c.get('actor')
    if (!actor) {
      return c.json({ success: false, error: 'Unauthorized' }, 401)
    }

    if (!securityService.hasPermission(actor.actorRole, permission)) {
      return c.json({ success: false, error: 'Forbidden' }, 403)
    }

    await next()
  }
}
