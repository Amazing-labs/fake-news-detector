import { AsyncLocalStorage } from 'node:async_hooks'

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, type Prisma } from '@prisma/client'
import { readProcessEnv } from '../../shared'

const globalForPrisma = globalThis as unknown as {
  prismaClients: Map<string, PrismaClient> | undefined
  defaultDatabaseUrl: string | undefined
}

globalForPrisma.prismaClients ??= new Map()

// Cloudflare Workers forbid sharing I/O objects (sockets, streams) between
// requests: a `pg` connection opened while serving request A cannot be awaited
// from request B, and the runtime cancels B as "hung". The process-wide client
// cache below is therefore only safe for long-lived processes (scripts, local
// Bun). Every HTTP request and cron run gets its own client through this scope,
// created lazily and disconnected once the work is done.
interface PrismaRequestScope {
  connectionString: string | undefined
  client?: PrismaClient
}

const prismaRequestScope = new AsyncLocalStorage<PrismaRequestScope>()

// A Worker invocation may hold at most six simultaneous outbound connections
// (database sockets and fetches alike), and pg keeps idle sockets open until
// the request-scoped client is disconnected. Capping the pool keeps room for
// the Supabase fetches and lets parallel queries queue instead of stalling.
const REQUEST_SCOPED_POOL_MAX_CONNECTIONS = 3

function resolveConnectionString(scopedConnectionString?: string): string {
  return (
    scopedConnectionString ??
    globalForPrisma.defaultDatabaseUrl ??
    readProcessEnv('DATABASE_URL') ??
    (() => {
      throw new Error('DATABASE_URL is not configured')
    })()
  )
}

function createPrismaClient(
  connectionString: string,
  maxConnections?: number,
): PrismaClient {
  const adapter = new PrismaPg({
    connectionString,
    ...(maxConnections === undefined ? {} : { max: maxConnections }),
  })

  return new PrismaClient({
    adapter,
    log: ['query', 'info', 'warn', 'error'],
  })
}

function getRootPrisma(): PrismaClient {
  const scope = prismaRequestScope.getStore()

  if (scope) {
    scope.client ??= createPrismaClient(
      resolveConnectionString(scope.connectionString),
      REQUEST_SCOPED_POOL_MAX_CONNECTIONS,
    )
    return scope.client
  }

  const connectionString = resolveConnectionString()
  const cachedClient = globalForPrisma.prismaClients?.get(connectionString)

  if (cachedClient) {
    return cachedClient
  }

  const client = createPrismaClient(connectionString)
  globalForPrisma.prismaClients?.set(connectionString, client)

  return client
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

/**
 * Runs `work` with a Prisma client private to this request (or cron run), so no
 * database connection outlives the request that opened it.
 *
 * `deferDisconnect` lets the caller hand the teardown to `ctx.waitUntil` so the
 * response is not held back by it; without it the teardown is awaited inline.
 */
export async function runWithRequestScopedPrisma<T>(
  connectionString: string | undefined,
  work: () => Promise<T>,
  deferDisconnect?: (teardown: Promise<unknown>) => void,
): Promise<T> {
  const scope: PrismaRequestScope = { connectionString }

  try {
    return await prismaRequestScope.run(scope, work)
  } finally {
    if (scope.client) {
      const teardown = scope.client.$disconnect().catch((error: unknown) => {
        console.error(
          '[database] failed to disconnect the request-scoped Prisma client:',
          error instanceof Error ? error.message : String(error),
        )
      })

      if (deferDisconnect) {
        deferDisconnect(teardown)
      } else {
        await teardown
      }
    }
  }
}

if (typeof process !== 'undefined' && typeof process.on === 'function') {
  process.on('beforeExit', async () => {
    if (globalForPrisma.prismaClients) {
      await Promise.all(
        [...globalForPrisma.prismaClients.values()].map((client) =>
          client.$disconnect(),
        ),
      )
    }
  })
}
