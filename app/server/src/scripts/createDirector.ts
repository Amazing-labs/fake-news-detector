import 'dotenv/config'

import { createAuthLink } from '../interfaces/auth/authLinking'
import {
  prisma,
  setPrismaConnectionString,
} from '../infrastructure/config/database'

type CliArgs = {
  name: string
  email: string
}

function readArg(flag: string): string | undefined {
  const index = process.argv.indexOf(flag)
  if (index === -1) {
    return undefined
  }

  return process.argv[index + 1]
}

function readArgs(): CliArgs {
  const name = readArg('--name')
  const email = readArg('--email')

  if (!name || !email) {
    throw new Error(
      'Usage: bun run create:director --name "Editorial Director" --email "director@example.com"',
    )
  }

  return {
    name,
    email: email.trim().toLowerCase(),
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set')
  }

  setPrismaConnectionString(process.env.DATABASE_URL)

  const input = readArgs()

  const existingActor = await prisma.actor.findUnique({
    where: { email: input.email },
    select: {
      id: true,
      role: true,
      status: true,
    },
  })

  if (existingActor && existingActor.role !== 'EDITORIAL_DIRECTOR') {
    throw new Error(
      `An actor already exists for ${input.email} with role ${existingActor.role}. Refusing to promote implicitly.`,
    )
  }

  const actor =
    existingActor ??
    (await prisma.actor.create({
      data: {
        name: input.name,
        email: input.email,
        role: 'EDITORIAL_DIRECTOR',
        status: 'ACTIVE',
      },
      select: {
        id: true,
        role: true,
        status: true,
      },
    }))

  const existingLink = await prisma.$queryRaw<Array<{ userId: string }>>`
    SELECT "userId"
    FROM "auth_links"
    WHERE "actorId" = ${actor.id}
    LIMIT 1
  `

  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: {
      id: true,
    },
  })

  if (user && !existingLink[0]) {
    await createAuthLink(user.id, actor.id)

    console.log(
      `Director provisioned and linked to Better Auth user ${input.email}.`,
    )
    return
  }

  console.log(
    `Director provisioned for ${input.email}. No Better Auth user exists yet; AuthLink will be created after sign-up.`,
  )
}

void main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
