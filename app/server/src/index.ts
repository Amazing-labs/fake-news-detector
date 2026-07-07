import { createApp } from './interfaces/createApp'
import { createAppDependencies } from './interfaces/createAppDependencies'
import { runWithPrismaConnectionString } from './infrastructure/config/database'
import { readProcessEnv } from './shared'

const dependencies = createAppDependencies()
const app = createApp(dependencies)

export default {
  fetch: app.fetch,
  // Cloudflare Cron Trigger: reconciliation sweep that deletes orphaned bucket
  // uploads (abandoned forms, files removed before submit, failed cleanups).
  scheduled: async (
    _event: unknown,
    env: { DATABASE_URL?: string } | undefined,
    ctx: { waitUntil: (promise: Promise<unknown>) => void },
  ) => {
    ctx.waitUntil(
      runWithPrismaConnectionString(
        env?.DATABASE_URL ?? readProcessEnv('DATABASE_URL'),
        () => dependencies.storageMaintenanceService.sweepOrphans(),
      ),
    )
  },
}
