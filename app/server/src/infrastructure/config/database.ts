import { AsyncLocalStorage } from 'node:async_hooks'

import { PrismaClient, type Prisma } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const rootPrisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = rootPrisma
}

export type PrismaDbClient = PrismaClient | Prisma.TransactionClient

const prismaTransactionContext =
  new AsyncLocalStorage<Prisma.TransactionClient>()

function getPrismaClient(): PrismaDbClient {
  return prismaTransactionContext.getStore() ?? rootPrisma
}

export const prisma = new Proxy(rootPrisma, {
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
  return rootPrisma.$transaction((transactionClient) =>
    prismaTransactionContext.run(transactionClient, work),
  )
}

process.on('beforeExit', async () => {
  await prisma.$disconnect()
})
