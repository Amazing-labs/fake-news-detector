import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { AppDependencies } from './createAppDependencies'
import { createDirectorRoutes } from './routes/directorRoutes'
import { createInboxSubjectRoutes } from './routes/inboxSubjectRoutes'
import { createInvestigationRoutes } from './routes/investigationRoutes'
import { createJournalistRoutes } from './routes/journalistRoutes'
import { createNotificationRoutes } from './routes/notificationRoutes'
import { createPublicationRoutes } from './routes/publicationRoutes'
import { createReportRoutes } from './routes/reportRoutes'
import { createWatcherApplicationRoutes } from './routes/watcherApplicationRoutes'
import { toErrorResponse } from './http/responses'
import { runWithPrismaConnectionString } from '../infrastructure/config/database'
import { auth } from './auth/betterAuth'
import { readProcessEnv } from '../shared'

export function createApp(dependencies: AppDependencies) {
  const app = new Hono()

  app.use('*', async (c, next) => {
    const env = c.env as { DATABASE_URL?: string } | undefined
    await runWithPrismaConnectionString(
      env?.DATABASE_URL ?? readProcessEnv('DATABASE_URL'),
      next,
    )
  })

  app.use(
    '/api/auth/*',
    cors({
      origin: (origin) => origin ?? 'http://localhost:5173',
      allowHeaders: ['Content-Type', 'Authorization'],
      allowMethods: ['GET', 'POST', 'OPTIONS'],
      credentials: true,
    }),
  )

  app.on(['GET', 'POST'], '/api/auth/*', (c) => auth.handler(c.req.raw))

  app.route(
    '/api/reports',
    createReportRoutes(
      dependencies.reportController,
      dependencies.securityService,
    ),
  )
  app.route(
    '/api/inbox-subjects',
    createInboxSubjectRoutes(
      dependencies.inboxSubjectController,
      dependencies.securityService,
    ),
  )
  app.route(
    '/api/investigations',
    createInvestigationRoutes(
      dependencies.investigationController,
      dependencies.securityService,
    ),
  )
  app.route(
    '/api/publications',
    createPublicationRoutes(
      dependencies.publicationController,
      dependencies.securityService,
    ),
  )
  app.route(
    '/api/watcher-applications',
    createWatcherApplicationRoutes(
      dependencies.watcherApplicationController,
      dependencies.securityService,
    ),
  )
  app.route(
    '/api/journalists',
    createJournalistRoutes(
      dependencies.journalistManagementController,
      dependencies.securityService,
    ),
  )
  app.route(
    '/api/notifications',
    createNotificationRoutes(
      dependencies.notificationController,
      dependencies.securityService,
    ),
  )
  app.route(
    '/api/director',
    createDirectorRoutes(
      dependencies.directorController,
      dependencies.securityService,
    ),
  )

  app.get('/health', (c) =>
    c.json({
      success: true,
      data: {
        status: 'ok',
        architecture: 'DDD + Hono',
        timestamp: new Date().toISOString(),
      },
    }),
  )

  app.onError((error, c) => toErrorResponse(c, error))

  return app
}
