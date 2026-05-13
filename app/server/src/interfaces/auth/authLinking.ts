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
  const normalizedEmail = user.email.trim().toLowerCase()

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
    await createAuthLink(user.id, actor.id)
    return
  }

  const actorLink = await findAuthLinkByActorId(existingActor.id)

  if (existingActor.role === 'CITIZEN' && !actorLink) {
    await createAuthLink(user.id, existingActor.id)
  }
}

export async function resolveSessionActorForAuthUser(
  user: AuthUserCandidate,
): Promise<ActorAccessCandidate | null> {
  const normalizedEmail = user.email.trim().toLowerCase()

  const existingLink = await prisma.$queryRaw<ActorAccessCandidate[]>`
    SELECT a."id", a."name", a."role", a."status", a."citizenType"
    FROM "auth_links" l
    INNER JOIN "actors" a ON a."id" = l."actorId"
    WHERE l."userId" = ${user.id}
    LIMIT 1
  `

  if (existingLink[0]) {
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
    return null
  }

  const actorLink = await findAuthLinkByActorId(actor.id)

  if (actorLink && actorLink.userId !== user.id) {
    return null
  }

  if (
    !canAttachActorToSession(actor, user.emailVerified) &&
    !canClaimPreprovisionedActorWithoutVerification(actor)
  ) {
    return null
  }

  await createAuthLink(user.id, actor.id)

  return {
    id: actor.id,
    name: actor.name,
    role: actor.role,
    status: actor.status,
    citizenType: actor.citizenType,
  }
}

export async function createAuthLink(
  userId: string,
  actorId: string,
): Promise<void> {
  await prisma.$executeRaw`
    INSERT INTO "auth_links" ("id", "userId", "actorId", "linkedAt")
    VALUES (${randomUUID()}, ${userId}, ${actorId}, NOW())
  `
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
