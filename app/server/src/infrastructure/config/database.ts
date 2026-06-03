import { AsyncLocalStorage } from 'node:async_hooks'

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, type Prisma } from '@prisma/client'
import { readProcessEnv } from '../../shared'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  prismaConnectionString: string | undefined
  defaultDatabaseUrl: string | undefined
}

const prismaConnectionStringContext = new AsyncLocalStorage<
  string | undefined
>()

function resolveConnectionString(): string {
  return (
    prismaConnectionStringContext.getStore() ??
    globalForPrisma.defaultDatabaseUrl ??
    readProcessEnv('DATABASE_URL') ??
    (() => {
      throw new Error('DATABASE_URL is not configured')
    })()
  )
}

function createPrismaClient(connectionString: string): PrismaClient {
  const adapter = new PrismaPg({
    connectionString,
  })

  return new PrismaClient({
    adapter,
    log: ['query', 'info', 'warn', 'error'],
  })
}

function getRootPrisma(): PrismaClient {
  const connectionString = resolveConnectionString()

  if (
    !globalForPrisma.prisma ||
    globalForPrisma.prismaConnectionString !== connectionString
  ) {
    globalForPrisma.prisma = createPrismaClient(connectionString)
    globalForPrisma.prismaConnectionString = connectionString
  }

  return globalForPrisma.prisma
}

export type PrismaDbClient = PrismaClient | Prisma.TransactionClient

const prismaTransactionContext =
  new AsyncLocalStorage<Prisma.TransactionClient>()

function getPrismaClient(): PrismaDbClient {
  return prismaTransactionContext.getStore() ?? getRootPrisma()
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient() as Record<PropertyKey, unknown>
    const value = client[prop]
    return typeof value === 'function'
      ? (value as (...args: unknown[]) => unknown).bind(client)
      : value
  },
}) as PrismaClient

export async function runInPrismaTransaction<T>(
  work: () => Promise<T>,
): Promise<T> {
  return getRootPrisma().$transaction((transactionClient) =>
    prismaTransactionContext.run(transactionClient, work),
  )
}

export function setPrismaConnectionString(connectionString?: string): void {
  globalForPrisma.defaultDatabaseUrl = connectionString
}

export function runWithPrismaConnectionString<T>(
  connectionString: string | undefined,
  work: () => Promise<T>,
): Promise<T> {
  return prismaConnectionStringContext.run(connectionString, work)
}

if (typeof process !== 'undefined' && typeof process.on === 'function') {
  process.on('beforeExit', async () => {
    if (globalForPrisma.prisma) {
      await globalForPrisma.prisma.$disconnect()
    }
  })
}
