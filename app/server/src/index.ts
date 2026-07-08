import { createApp } from './interfaces/createApp'
import { createAppDependencies } from './interfaces/createAppDependencies'
import { runWithPrismaConnectionString } from './infrastructure/config/database'
import { readProcessEnv } from './shared'

const dependencies = createAppDependencies()
const app = createApp(dependencies)

export default {
  fetch: app.fetch,
  // Cron: reconciliation sweep for orphaned bucket uploads.
  scheduled: async (
    _event: unknown,
    env: { DATABASE_URL?: string } | undefined,
    ctx: { waitUntil: (promise: Promise<unknown>) => void },
  ) => {
    ctx.waitUntil(
      runWithPrismaConnectionString(
        env?.DATABASE_URL ?? readProcessEnv('DATABASE_URL'),
        () => dependencies.storageMaintenanceService.sweepOrphans(),
      ).catch((error) => {
        console.error(
          '[sweep] ERROR: scheduled reconciliation sweep failed:',
          error instanceof Error ? error.message : String(error),
        )
      }),
    )
  },
}
