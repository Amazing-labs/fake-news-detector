import { randomUUID } from 'node:crypto'
import { prisma } from '../../infrastructure/config/database'

export type ActorAccessCandidate = {
  id: string
  name: string
  role: 'CITIZEN' | 'JOURNALIST' | 'EDITORIAL_DIRECTOR'
  status: 'ACTIVE' | 'DISABLED' | 'BANNED'
  citizenType?: 'REGULAR' | 'WATCHER'
}

type AuthUserCandidate = {
  id: string
  email: string
  emailVerified: boolean
  name: string
}

type AuthLinkLookupRow = {
  userId: string
}

function logAuthLinkDebug(
  message: string,
  details?: Record<string, unknown>,
): void {
  console.log('[AuthLinkDebug]', message, details ?? '')
}

function logAuthLinkError(
  message: string,
  error: unknown,
  details?: Record<string, unknown>,
): void {
  const normalizedError =
    error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      : { value: String(error) }

  console.error('[AuthLinkError]', message, {
    ...details,
    error: normalizedError,
  })
}

export function canAttachActorToSession(
  actor: ActorAccessCandidate | null,
  emailVerified: boolean,
): boolean {
  if (!actor) {
    return false
  }

  if (actor.role === 'CITIZEN') {
    return true
  }

  return emailVerified
}

export function canAttachLinkedActorToSession(
  actor: ActorAccessCandidate | null,
): boolean {
  return !!actor
}

export function canClaimPreprovisionedActorWithoutVerification(
  actor: ActorAccessCandidate | null,
): boolean {
  if (!actor) {
    return false
  }

  return actor.role === 'EDITORIAL_DIRECTOR' || actor.role === 'JOURNALIST'
}

export async function provisionCitizenActorForAuthUser(
  user: AuthUserCandidate,
): Promise<void> {
  try {
    const normalizedEmail = user.email.trim().toLowerCase()

    logAuthLinkDebug('provisionCitizenActorForAuthUser:start', {
      userId: user.id,
    })

    const existingActor = await prisma.actor.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        name: true,
        role: true,
      },
    })

    if (!existingActor) {
      const actor = await prisma.actor.create({
        data: {
          name: user.name,
          email: normalizedEmail,
          role: 'CITIZEN',
          status: 'ACTIVE',
        },
      })
      logAuthLinkDebug('provisionCitizenActorForAuthUser:actor-created', {
        userId: user.id,
        actorId: actor.id,
      })
      await createAuthLink(user.id, actor.id)
      logAuthLinkDebug('provisionCitizenActorForAuthUser:linked-new-actor', {
        userId: user.id,
        actorId: actor.id,
      })
      return
    }

    const actorLink = await findAuthLinkByActorId(existingActor.id)

    if (existingActor.role === 'CITIZEN' && !actorLink) {
      await createAuthLink(user.id, existingActor.id)
      logAuthLinkDebug(
        'provisionCitizenActorForAuthUser:linked-existing-citizen',
        {
          userId: user.id,
          actorId: existingActor.id,
        },
      )
    }
  } catch (error) {
    logAuthLinkError('provisionCitizenActorForAuthUser:failed', error, {
      userId: user.id,
    })
    throw error
  }
}

export async function resolveSessionActorForAuthUser(
  user: AuthUserCandidate,
): Promise<ActorAccessCandidate | null> {
  try {
    const normalizedEmail = user.email.trim().toLowerCase()

    logAuthLinkDebug('resolveSessionActorForAuthUser:start', {
      userId: user.id,
      emailVerified: user.emailVerified,
    })

    const existingLink = await prisma.$queryRaw<ActorAccessCandidate[]>`
      SELECT a."id", a."name", a."role", a."status", a."citizenType"
      FROM "auth_links" l
      INNER JOIN "actors" a ON a."id" = l."actorId"
      WHERE l."userId" = ${user.id}
      LIMIT 1
    `

    if (existingLink[0]) {
      logAuthLinkDebug('resolveSessionActorForAuthUser:existing-link-found', {
        userId: user.id,
        actorId: existingLink[0].id,
        actorRole: existingLink[0].role,
      })
      return canAttachLinkedActorToSession(existingLink[0])
        ? existingLink[0]
        : null
    }

    const actor = await prisma.actor.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        name: true,
        role: true,
        status: true,
        citizenType: true,
      },
    })

    if (!actor) {
      logAuthLinkDebug('resolveSessionActorForAuthUser:no-actor-found', {
        userId: user.id,
      })
      return null
    }

    const actorLink = await findAuthLinkByActorId(actor.id)

    if (actorLink && actorLink.userId !== user.id) {
      logAuthLinkDebug(
        'resolveSessionActorForAuthUser:actor-owned-by-other-user',
        {
          userId: user.id,
          actorId: actor.id,
          linkedUserId: actorLink.userId,
        },
      )
      return null
    }

    if (
      !canAttachActorToSession(actor, user.emailVerified) &&
      !canClaimPreprovisionedActorWithoutVerification(actor)
    ) {
      logAuthLinkDebug('resolveSessionActorForAuthUser:actor-not-attachable', {
        userId: user.id,
        actorId: actor.id,
        actorRole: actor.role,
        emailVerified: user.emailVerified,
      })
      return null
    }

    await createAuthLink(user.id, actor.id)
    logAuthLinkDebug('resolveSessionActorForAuthUser:auth-link-created', {
      userId: user.id,
      actorId: actor.id,
      actorRole: actor.role,
    })

    return {
      id: actor.id,
      name: actor.name,
      role: actor.role,
      status: actor.status,
      citizenType: actor.citizenType,
    }
  } catch (error) {
    logAuthLinkError('resolveSessionActorForAuthUser:failed', error, {
      userId: user.id,
    })
    throw error
  }
}

export async function createAuthLink(
  userId: string,
  actorId: string,
): Promise<void> {
  try {
    logAuthLinkDebug('createAuthLink:start', {
      userId,
      actorId,
    })

    await prisma.$executeRaw`
      INSERT INTO "auth_links" ("id", "userId", "actorId", "linkedAt")
      VALUES (${randomUUID()}, ${userId}, ${actorId}, NOW())
    `

    logAuthLinkDebug('createAuthLink:success', {
      userId,
      actorId,
    })
  } catch (error) {
    logAuthLinkError('createAuthLink:failed', error, {
      userId,
      actorId,
    })
    throw error
  }
}

async function findAuthLinkByActorId(
  actorId: string,
): Promise<AuthLinkLookupRow | null> {
  const rows = await prisma.$queryRaw<AuthLinkLookupRow[]>`
    SELECT "userId"
    FROM "auth_links"
    WHERE "actorId" = ${actorId}
    LIMIT 1
  `

  return rows[0] ?? null
}
