import type { ActorRole } from '../../shared/types'

export interface AuthenticatedActor {
  actorId: string
  actorRole: ActorRole
}

export interface AppVariables {
  actor: AuthenticatedActor
  authSession: unknown
}
