import 'dotenv/config'

import { randomUUID } from 'node:crypto'
import {
  prisma,
  setPrismaConnectionString,
} from '../infrastructure/config/database'
import { hashWorkerPassword } from '../interfaces/auth/passwordHashing'
import { readProcessEnv } from '../shared'

const MIN_PASSWORD_LENGTH = 8
const CREDENTIAL_PROVIDER_ID = 'credential'

type CliArgs = {
  email: string
  password: string
}

function readArg(flag: string): string | undefined {
  const index = process.argv.indexOf(flag)
  if (index === -1) {
    return undefined
  }

  return process.argv[index + 1]
}

function readArgs(): CliArgs {
  const email = readArg('--email')
  const password = readArg('--password')

  if (!email || !password) {
    throw new Error(
      'Usage: bun run reset:password --email "director@example.com" --password "a-new-password"',
    )
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `The password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
    )
  }

  return {
    email: email.trim().toLowerCase(),
    password,
  }
}

async function main() {
  const databaseUrl = readProcessEnv('DATABASE_URL')
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set')
  }

  setPrismaConnectionString(databaseUrl)

  const input = readArgs()

  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  })

  if (!user) {
    throw new Error(
      `No Better Auth user exists for ${input.email}. Sign up first, then rerun this script.`,
    )
  }

  const hash = await hashWorkerPassword(input.password)

  const credentialAccount = await prisma.account.findFirst({
    where: {
      userId: user.id,
      providerId: CREDENTIAL_PROVIDER_ID,
    },
    select: { id: true },
  })

  if (credentialAccount) {
    await prisma.account.update({
      where: { id: credentialAccount.id },
      data: { password: hash },
    })

    console.log(`Password rehashed for ${input.email}.`)
    return
  }

  await prisma.account.create({
    data: {
      id: randomUUID(),
      accountId: user.id,
      providerId: CREDENTIAL_PROVIDER_ID,
      userId: user.id,
      password: hash,
    },
  })

  console.log(
    `No credential account existed for ${input.email}; one was created with the new password.`,
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
