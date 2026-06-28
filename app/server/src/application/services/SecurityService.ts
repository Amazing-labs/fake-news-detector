// application/services/SecurityService.ts
//
// Authentication adapter contract + deterministic role/action policy.
// Real token verification is delegated to an injected adapter; the service
// itself is concerned with policy enforcement.

import { ActorRole } from '../../shared/types'
import { BusinessRuleError } from '../../shared/errors'

export interface AuthenticationResult {
  isValid: boolean
  actorId?: string
  role?: ActorRole
  status?: 'ACTIVE' | 'DISABLED' | 'BANNED'
}

export interface IRequestAuthenticator {
  authenticate(headers: Headers): Promise<AuthenticationResult>
}

export type Permission =
  // Citizen
  | 'report.submit'
  | 'watcher.apply'
  | 'evidence.submit'
  // Journalist
  | 'report.pick'
  | 'investigation.update'
  | 'investigation.submitForReview'
  // Staff (journalist + director): read the editorial inbox
  | 'inbox.read'
  // Director
  | 'investigation.approve'
  | 'publication.correct'
  | 'investigation.cancel'
  | 'investigation.reject'
  | 'investigation.archive'
  | 'watcherApplication.decide'
  | 'journalist.manage'
  | 'citizen.manage'
  | 'inbox.manage'
  | 'director.dashboard.read'
  // Shared
  | 'notifications.read'

const ROLE_PERMISSIONS: Record<ActorRole, ReadonlySet<Permission>> = {
  CITIZEN: new Set<Permission>([
    'report.submit',
    'watcher.apply',
    'evidence.submit',
    'notifications.read',
  ]),
  JOURNALIST: new Set<Permission>([
    'report.pick',
    'investigation.update',
    'investigation.submitForReview',
    'inbox.read',
    'notifications.read',
  ]),
  EDITORIAL_DIRECTOR: new Set<Permission>([
    'investigation.approve',
    'publication.correct',
    'investigation.cancel',
    'investigation.reject',
    'investigation.archive',
    'watcherApplication.decide',
    'journalist.manage',
    'citizen.manage',
    'inbox.manage',
    'inbox.read',
    'director.dashboard.read',
    'notifications.read',
  ]),
}

export class SecurityService {
  constructor(private readonly requestAuthenticator?: IRequestAuthenticator) {}

  async authenticate(headers: Headers): Promise<AuthenticationResult> {
    if (!this.requestAuthenticator) {
      // No verifier wired yet; reject by default to avoid silent allow-all.
      return { isValid: false }
    }
    return this.requestAuthenticator.authenticate(headers)
  }

  hasPermission(role: ActorRole, permission: Permission): boolean {
    return ROLE_PERMISSIONS[role]?.has(permission) ?? false
  }

  assertAccess(role: ActorRole, permission: Permission): void {
    if (!this.hasPermission(role, permission)) {
      throw new BusinessRuleError(
        `Role ${role} is not allowed to perform ${permission}`,
      )
    }
  }
}
