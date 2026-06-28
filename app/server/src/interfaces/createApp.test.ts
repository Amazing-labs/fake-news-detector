import { describe, expect, test, vi } from 'vitest'
import { createApp } from './createApp'
import { SecurityService } from '../application/services/SecurityService'
import { FactCheckingQueryService } from '../application/services/FactCheckingQueryService'
import { ReportController } from './controllers/ReportController'
import { InboxSubjectController } from './controllers/InboxSubjectController'
import { InvestigationController } from './controllers/InvestigationController'
import { Report } from '../domain/entities/Report'
import type { ActorRole } from '../shared/types'

function buildApp() {
  const reportController = {
    listReports: vi.fn(async (c: any) =>
      c.json({ success: true, data: { items: [], total: 0 } }),
    ),
    createReport: vi.fn(async (c: any) =>
      c.json({ success: true, data: { id: 'r1' } }, 201),
    ),
  }

  const inboxSubjectController = {
    list: vi.fn(async (c: any) =>
      c.json({ success: true, data: { items: [], total: 0 } }),
    ),
    listOpenReports: vi.fn(async (c: any) =>
      c.json({ success: true, data: { items: [], total: 0 } }),
    ),
    createDirectorSubject: vi.fn(),
    pick: vi.fn(),
    delete: vi.fn(),
  }

  const investigationController = {
    list: vi.fn(async (c: any) =>
      c.json({ success: true, data: { items: [], total: 0 } }),
    ),
    submitForReview: vi.fn(),
    updateSourceMedia: vi.fn(),
    updateWatcherEvidenceMedia: vi.fn(),
    addProofMedia: vi.fn(),
    approve: vi.fn(),
    reject: vi.fn(),
    archive: vi.fn(),
    cancel: vi.fn(),
    submitWatcherEvidence: vi.fn(),
  }

  const publicationController = {
    list: vi.fn(async (c: any) =>
      c.json({ success: true, data: { items: [], total: 0 } }),
    ),
    publishCorrection: vi.fn(),
  }

  const watcherApplicationController = {
    submit: vi.fn(async (c: any) =>
      c.json({ success: true, data: { id: 'wa1' } }, 201),
    ),
    list: vi.fn(async (c: any) =>
      c.json({ success: true, data: { items: [], total: 0 } }),
    ),
    approve: vi.fn(),
    reject: vi.fn(),
  }

  const journalistManagementController = {
    create: vi.fn(),
    ban: vi.fn(),
    disable: vi.fn(),
    activate: vi.fn(),
  }

  const directorController = {
    getDashboard: vi.fn(async (c: any) =>
      c.json({ success: true, data: { pendingReviews: [] } }),
    ),
  }

  const notificationController = {
    list: vi.fn(async (c: any) =>
      c.json({ success: true, data: { items: [], total: 0 } }),
    ),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
  }

  const securityService = new SecurityService({
    authenticate: vi.fn(async (headers: Headers) => {
      const rawToken = (headers.get('Authorization') ?? '').replace(
        /^Bearer\s+/i,
        '',
      )
      const [actorId, role] = rawToken.split(':', 2)
      return actorId && role
        ? { isValid: true, actorId, role: role as any }
        : { isValid: false }
    }),
  })

  const app = createApp({
    securityService,
    reportController: reportController as any,
    inboxSubjectController: inboxSubjectController as any,
    investigationController: investigationController as any,
    publicationController: publicationController as any,
    watcherApplicationController: watcherApplicationController as any,
    journalistManagementController: journalistManagementController as any,
    directorController: directorController as any,
    notificationController: notificationController as any,
    meController: { getMe: vi.fn() } as any,
    dashboardController: { metrics: vi.fn() } as any,
  })

  return { app, reportController }
}

describe('createApp', () => {
  test('returns health payload', async () => {
    const { app } = buildApp()
    const response = await app.request('/health')
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.data.status).toBe('ok')
  })

  test('protects report submission when authorization header is missing', async () => {
    const { app, reportController } = buildApp()
    const response = await app.request('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        theme: 'Santé',
      }),
    })

    expect(response.status).toBe(401)
    expect(reportController.createReport).not.toHaveBeenCalled()
  })

  test('allows report submission for a citizen token', async () => {
    const { app, reportController } = buildApp()
    const response = await app.request('/api/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer citizen-1:CITIZEN',
      },
      body: JSON.stringify({
        theme: 'Santé',
        title: 'Title',
        content: 'Body',
      }),
    })
    const json = await response.json()

    expect(response.status).toBe(201)
    expect(json.success).toBe(true)
    expect(reportController.createReport).toHaveBeenCalledOnce()
  })

  test('binds report submission to the authenticated actor', async () => {
    const submitReport = vi.fn()
    const securityService = new SecurityService({
      authenticate: vi.fn(async () => ({
        isValid: true,
        actorId: 'citizen-1',
        role: 'CITIZEN' as const,
      })),
    })
    const app = createApp({
      securityService,
      reportController: new ReportController(
        { submitReport } as any,
        {} as any,
      ),
      inboxSubjectController: {
        list: vi.fn(),
        listOpenReports: vi.fn(),
        createDirectorSubject: vi.fn(),
        pick: vi.fn(),
        delete: vi.fn(),
      } as any,
      investigationController: {
        list: vi.fn(),
        submitForReview: vi.fn(),
        updateSourceMedia: vi.fn(),
        updateWatcherEvidenceMedia: vi.fn(),
        addProofMedia: vi.fn(),
        approve: vi.fn(),
        reject: vi.fn(),
        archive: vi.fn(),
        cancel: vi.fn(),
        submitWatcherEvidence: vi.fn(),
      } as any,
      publicationController: {
        list: vi.fn(),
        publishCorrection: vi.fn(),
      } as any,
      watcherApplicationController: {
        submit: vi.fn(),
        list: vi.fn(),
        approve: vi.fn(),
        reject: vi.fn(),
      } as any,
      journalistManagementController: {
        create: vi.fn(),
        ban: vi.fn(),
        disable: vi.fn(),
        activate: vi.fn(),
      } as any,
      directorController: {
        getDashboard: vi.fn(),
      } as any,
      notificationController: {
        list: vi.fn(),
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
      } as any,
      meController: { getMe: vi.fn() } as any,
      dashboardController: { metrics: vi.fn() } as any,
    })

    const response = await app.request('/api/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer citizen-1:CITIZEN',
      },
      body: JSON.stringify({
        theme: 'Santé',
        title: 'Title',
        content: 'Body',
      }),
    })

    expect(response.status).toBe(201)
    expect(submitReport).toHaveBeenCalledWith({
      citizenId: 'citizen-1',
      theme: 'Santé',
      title: 'Title',
      content: 'Body',
    })
  })

  test('rejects report submission with an unsupported theme', async () => {
    const submitReport = vi.fn()
    const securityService = new SecurityService({
      authenticate: vi.fn(async () => ({
        isValid: true,
        actorId: 'citizen-1',
        role: 'CITIZEN' as const,
      })),
    })
    const app = createApp({
      securityService,
      reportController: new ReportController(
        { submitReport } as any,
        {} as any,
      ),
      inboxSubjectController: {
        list: vi.fn(),
        listOpenReports: vi.fn(),
        createDirectorSubject: vi.fn(),
        pick: vi.fn(),
        delete: vi.fn(),
      } as any,
      investigationController: {
        list: vi.fn(),
        submitForReview: vi.fn(),
        updateSourceMedia: vi.fn(),
        updateWatcherEvidenceMedia: vi.fn(),
        addProofMedia: vi.fn(),
        approve: vi.fn(),
        reject: vi.fn(),
        archive: vi.fn(),
        cancel: vi.fn(),
        submitWatcherEvidence: vi.fn(),
      } as any,
      publicationController: {
        list: vi.fn(),
        publishCorrection: vi.fn(),
      } as any,
      watcherApplicationController: {
        submit: vi.fn(),
        list: vi.fn(),
        approve: vi.fn(),
        reject: vi.fn(),
      } as any,
      journalistManagementController: {
        create: vi.fn(),
        ban: vi.fn(),
        disable: vi.fn(),
        activate: vi.fn(),
      } as any,
      directorController: {
        getDashboard: vi.fn(),
      } as any,
      notificationController: {
        list: vi.fn(),
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
      } as any,
      meController: { getMe: vi.fn() } as any,
      dashboardController: { metrics: vi.fn() } as any,
    })

    const response = await app.request('/api/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer citizen-1:CITIZEN',
      },
      body: JSON.stringify({
        theme: 'Rumeur libre',
        title: 'Title',
        content: 'Body',
      }),
    })

    expect(response.status).toBe(400)
    expect(submitReport).not.toHaveBeenCalled()
  })

  test('returns 400 when request JSON is malformed', async () => {
    const submitReport = vi.fn()
    const securityService = new SecurityService({
      authenticate: vi.fn(async () => ({
        isValid: true,
        actorId: 'citizen-1',
        role: 'CITIZEN' as const,
      })),
    })
    const app = createApp({
      securityService,
      reportController: new ReportController(
        { submitReport } as any,
        {} as any,
      ),
      inboxSubjectController: {
        list: vi.fn(),
        listOpenReports: vi.fn(),
        createDirectorSubject: vi.fn(),
        pick: vi.fn(),
        delete: vi.fn(),
      } as any,
      investigationController: {
        list: vi.fn(),
        submitForReview: vi.fn(),
        updateSourceMedia: vi.fn(),
        updateWatcherEvidenceMedia: vi.fn(),
        addProofMedia: vi.fn(),
        approve: vi.fn(),
        reject: vi.fn(),
        archive: vi.fn(),
        cancel: vi.fn(),
        submitWatcherEvidence: vi.fn(),
      } as any,
      publicationController: {
        list: vi.fn(),
        publishCorrection: vi.fn(),
      } as any,
      watcherApplicationController: {
        submit: vi.fn(),
        list: vi.fn(),
        approve: vi.fn(),
        reject: vi.fn(),
      } as any,
      journalistManagementController: {
        create: vi.fn(),
        ban: vi.fn(),
        disable: vi.fn(),
        activate: vi.fn(),
      } as any,
      directorController: {
        getDashboard: vi.fn(),
      } as any,
      notificationController: {
        list: vi.fn(),
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
      } as any,
      meController: { getMe: vi.fn() } as any,
      dashboardController: { metrics: vi.fn() } as any,
    })

    const response = await app.request('/api/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer citizen-1:CITIZEN',
      },
      body: '{',
    })

    expect(response.status).toBe(400)
    expect(submitReport).not.toHaveBeenCalled()
  })

  test('forbids director dashboard to a citizen token', async () => {
    const { app } = buildApp()
    const response = await app.request('/api/director/dashboard', {
      headers: {
        Authorization: 'Bearer citizen-1:CITIZEN',
      },
    })

    expect(response.status).toBe(403)
  })

  test('rejects invalid inbox subject status query', async () => {
    const findByStatus = vi.fn()
    const findAll = vi.fn()
    const securityService = new SecurityService({
      authenticate: vi.fn(async () => ({
        isValid: true,
        actorId: 'journalist-1',
        role: 'JOURNALIST' as const,
      })),
    })
    const app = createApp({
      securityService,
      reportController: {
        listReports: vi.fn(),
        createReport: vi.fn(),
      } as any,
      inboxSubjectController: new InboxSubjectController(
        {} as any,
        {
          listInboxSubjects: vi.fn(async (status?: string) =>
            status ? findByStatus(status) : findAll(),
          ),
        } as any,
      ),
      investigationController: {
        list: vi.fn(),
        submitForReview: vi.fn(),
        updateSourceMedia: vi.fn(),
        updateWatcherEvidenceMedia: vi.fn(),
        addProofMedia: vi.fn(),
        approve: vi.fn(),
        reject: vi.fn(),
        archive: vi.fn(),
        cancel: vi.fn(),
        submitWatcherEvidence: vi.fn(),
      } as any,
      publicationController: {
        list: vi.fn(),
        publishCorrection: vi.fn(),
      } as any,
      watcherApplicationController: {
        submit: vi.fn(),
        list: vi.fn(),
        approve: vi.fn(),
        reject: vi.fn(),
      } as any,
      journalistManagementController: {
        create: vi.fn(),
        ban: vi.fn(),
        disable: vi.fn(),
        activate: vi.fn(),
      } as any,
      directorController: {
        getDashboard: vi.fn(),
      } as any,
      notificationController: {
        list: vi.fn(),
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
      } as any,
      meController: { getMe: vi.fn() } as any,
      dashboardController: { metrics: vi.fn() } as any,
    })

    const response = await app.request('/api/inbox-subjects?status=INVALID', {
      headers: {
        Authorization: 'Bearer journalist-1:JOURNALIST',
      },
    })

    expect(response.status).toBe(400)
    expect(findByStatus).not.toHaveBeenCalled()
    expect(findAll).not.toHaveBeenCalled()
  })

  test('routes correction publishing through publication endpoint', async () => {
    const publicationController = {
      list: vi.fn(async (c: any) =>
        c.json({ success: true, data: { items: [], total: 0 } }),
      ),
      publishCorrection: vi.fn(async (c: any) =>
        c.json({ success: true, data: { correctionId: 'corr-1' } }, 201),
      ),
    }
    const securityService = new SecurityService({
      authenticate: vi.fn(async () => ({
        isValid: true,
        actorId: 'director-1',
        role: 'EDITORIAL_DIRECTOR' as const,
      })),
    })
    const app = createApp({
      securityService,
      reportController: {
        listReports: vi.fn(),
        createReport: vi.fn(),
      } as any,
      inboxSubjectController: {
        list: vi.fn(),
        listOpenReports: vi.fn(),
        createDirectorSubject: vi.fn(),
        pick: vi.fn(),
        delete: vi.fn(),
      } as any,
      investigationController: {
        list: vi.fn(),
        submitForReview: vi.fn(),
        updateSourceMedia: vi.fn(),
        updateWatcherEvidenceMedia: vi.fn(),
        addProofMedia: vi.fn(),
        approve: vi.fn(),
        reject: vi.fn(),
        archive: vi.fn(),
        cancel: vi.fn(),
        submitWatcherEvidence: vi.fn(),
      } as any,
      publicationController: publicationController as any,
      watcherApplicationController: {
        submit: vi.fn(),
        list: vi.fn(),
        approve: vi.fn(),
        reject: vi.fn(),
      } as any,
      journalistManagementController: {
        create: vi.fn(),
        ban: vi.fn(),
        disable: vi.fn(),
        activate: vi.fn(),
      } as any,
      directorController: {
        getDashboard: vi.fn(),
      } as any,
      notificationController: {
        list: vi.fn(),
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
      } as any,
      meController: { getMe: vi.fn() } as any,
      dashboardController: { metrics: vi.fn() } as any,
    })

    const response = await app.request('/api/publications/pub-1/corrections', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer director-1:EDITORIAL_DIRECTOR',
      },
      body: JSON.stringify({
        title: 'Correction',
        content: 'Updated context',
      }),
    })

    expect(response.status).toBe(201)
    expect(publicationController.publishCorrection).toHaveBeenCalledOnce()
  })

  test('allows investigation approval for a director token', async () => {
    const investigationController = {
      list: vi.fn(),
      submitForReview: vi.fn(),
      updateSourceMedia: vi.fn(),
      updateWatcherEvidenceMedia: vi.fn(),
      addProofMedia: vi.fn(),
      approve: vi.fn(async (c: any) =>
        c.json({ success: true, data: { publicationId: 'pub-1' } }, 201),
      ),
      reject: vi.fn(),
      archive: vi.fn(),
      cancel: vi.fn(),
      submitWatcherEvidence: vi.fn(),
    }
    const securityService = new SecurityService({
      authenticate: vi.fn(async () => ({
        isValid: true,
        actorId: 'director-1',
        role: 'EDITORIAL_DIRECTOR' as const,
      })),
    })
    const app = createApp({
      securityService,
      reportController: {
        listReports: vi.fn(),
        createReport: vi.fn(),
      } as any,
      inboxSubjectController: {
        list: vi.fn(),
        listOpenReports: vi.fn(),
        createDirectorSubject: vi.fn(),
        pick: vi.fn(),
        delete: vi.fn(),
      } as any,
      investigationController: investigationController as any,
      publicationController: {
        list: vi.fn(),
        publishCorrection: vi.fn(),
      } as any,
      watcherApplicationController: {
        submit: vi.fn(),
        list: vi.fn(),
        approve: vi.fn(),
        reject: vi.fn(),
      } as any,
      journalistManagementController: {
        create: vi.fn(),
        ban: vi.fn(),
        disable: vi.fn(),
        activate: vi.fn(),
      } as any,
      directorController: {
        getDashboard: vi.fn(),
      } as any,
      notificationController: {
        list: vi.fn(),
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
      } as any,
      meController: { getMe: vi.fn() } as any,
      dashboardController: { metrics: vi.fn() } as any,
    })

    const response = await app.request('/api/investigations/inv-1/approve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer director-1:EDITORIAL_DIRECTOR',
      },
      body: JSON.stringify({}),
    })

    expect(response.status).toBe(201)
    expect(investigationController.approve).toHaveBeenCalledOnce()
  })

  test('rejects invalid numeric mediaId before reaching the investigation service', async () => {
    const updateInvestigationSourceMediaItem = vi.fn()
    const securityService = new SecurityService({
      authenticate: vi.fn(async () => ({
        isValid: true,
        actorId: 'journalist-1',
        role: 'JOURNALIST' as const,
      })),
    })
    const app = createApp({
      securityService,
      reportController: {
        listReports: vi.fn(),
        createReport: vi.fn(),
      } as any,
      inboxSubjectController: {
        list: vi.fn(),
        listOpenReports: vi.fn(),
        createDirectorSubject: vi.fn(),
        pick: vi.fn(),
        delete: vi.fn(),
      } as any,
      investigationController: new InvestigationController(
        { updateInvestigationSourceMediaItem } as any,
        {} as any,
      ),
      publicationController: {
        list: vi.fn(),
        publishCorrection: vi.fn(),
      } as any,
      watcherApplicationController: {
        submit: vi.fn(),
        list: vi.fn(),
        approve: vi.fn(),
        reject: vi.fn(),
      } as any,
      journalistManagementController: {
        create: vi.fn(),
        ban: vi.fn(),
        disable: vi.fn(),
        activate: vi.fn(),
      } as any,
      directorController: {
        getDashboard: vi.fn(),
      } as any,
      notificationController: {
        list: vi.fn(),
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
      } as any,
      meController: { getMe: vi.fn() } as any,
      dashboardController: { metrics: vi.fn() } as any,
    })

    const response = await app.request(
      '/api/investigations/inv-1/source-media/not-a-number',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer journalist-1:JOURNALIST',
        },
        body: JSON.stringify({
          category: 'FABRICATED',
          reliability: 'TRUE',
          justification: 'Checked source',
        }),
      },
    )

    expect(response.status).toBe(400)
    expect(updateInvestigationSourceMediaItem).not.toHaveBeenCalled()
  })
})

describe('report access authorization', () => {
  // Any controller whose routes are registered must expose its handler methods;
  // routes other than /api/reports are never hit here, so a Proxy of vi.fn()s is
  // enough to satisfy route registration.
  const stubController = () =>
    new Proxy(
      {},
      {
        get: () => vi.fn(async (c: any) => c.json({ success: true, data: {} })),
      },
    ) as any

  function buildReportApp(params: {
    actorId: string
    role: ActorRole
    reportRepository: {
      findById?: ReturnType<typeof vi.fn>
      findByCitizenId?: ReturnType<typeof vi.fn>
      findAll?: ReturnType<typeof vi.fn>
    }
  }) {
    const securityService = new SecurityService({
      authenticate: vi.fn(async () => ({
        isValid: true,
        actorId: params.actorId,
        role: params.role,
      })),
    })

    // Citizen repo is consulted to resolve reporter names on the enriched read
    // path; an empty map is enough for these authorization-focused assertions.
    const citizenRepository = {
      findAll: vi.fn(async () => []),
      findByIds: vi.fn(async () => []),
      findById: vi.fn(async () => null),
    }

    const queryService = new FactCheckingQueryService(
      params.reportRepository as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      citizenRepository as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    )

    const reportController = new ReportController({} as any, queryService)

    return createApp({
      securityService,
      reportController: reportController as any,
      inboxSubjectController: stubController(),
      investigationController: stubController(),
      publicationController: stubController(),
      watcherApplicationController: stubController(),
      journalistManagementController: stubController(),
      directorController: stubController(),
      notificationController: stubController(),
      meController: stubController(),
      dashboardController: stubController(),
    })
  }

  const makeReport = (id: string, citizenId: string) =>
    new Report(id, citizenId, 'Santé', 'Title', 'Body')

  test('scopes a citizen list to their own reports, ignoring the citizenId filter', async () => {
    const findByCitizenId = vi.fn(async () => [makeReport('r1', 'citizen-1')])
    const findAll = vi.fn(async () => [])
    const app = buildReportApp({
      actorId: 'citizen-1',
      role: 'CITIZEN',
      reportRepository: { findByCitizenId, findAll },
    })

    const response = await app.request('/api/reports?citizenId=citizen-2', {
      headers: { Authorization: 'Bearer citizen-1:CITIZEN' },
    })
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(findByCitizenId).toHaveBeenCalledWith('citizen-1')
    expect(findAll).not.toHaveBeenCalled()
    expect(json.data.items).toHaveLength(1)
    expect(json.data.items[0].citizenId).toBe('citizen-1')
  })

  test('lets a director list every report when no citizenId is given', async () => {
    const findByCitizenId = vi.fn(async () => [])
    const findAll = vi.fn(async () => [
      makeReport('r1', 'citizen-1'),
      makeReport('r2', 'citizen-2'),
    ])
    const app = buildReportApp({
      actorId: 'director-1',
      role: 'EDITORIAL_DIRECTOR',
      reportRepository: { findByCitizenId, findAll },
    })

    const response = await app.request('/api/reports', {
      headers: { Authorization: 'Bearer director-1:EDITORIAL_DIRECTOR' },
    })
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(findAll).toHaveBeenCalledOnce()
    expect(findByCitizenId).not.toHaveBeenCalled()
    expect(json.data.items).toHaveLength(2)
  })

  test('lets a director filter reports by citizenId', async () => {
    const findByCitizenId = vi.fn(async () => [makeReport('r1', 'citizen-2')])
    const findAll = vi.fn(async () => [])
    const app = buildReportApp({
      actorId: 'director-1',
      role: 'EDITORIAL_DIRECTOR',
      reportRepository: { findByCitizenId, findAll },
    })

    const response = await app.request('/api/reports?citizenId=citizen-2', {
      headers: { Authorization: 'Bearer director-1:EDITORIAL_DIRECTOR' },
    })

    expect(response.status).toBe(200)
    expect(findByCitizenId).toHaveBeenCalledWith('citizen-2')
    expect(findAll).not.toHaveBeenCalled()
  })

  test('lets a citizen read their own report by id', async () => {
    const findById = vi.fn(async () => makeReport('r1', 'citizen-1'))
    const app = buildReportApp({
      actorId: 'citizen-1',
      role: 'CITIZEN',
      reportRepository: { findById },
    })

    const response = await app.request('/api/reports/r1', {
      headers: { Authorization: 'Bearer citizen-1:CITIZEN' },
    })
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.data.id).toBe('r1')
  })

  test("returns 404 when a citizen reads another citizen's report by id", async () => {
    const findById = vi.fn(async () => makeReport('r1', 'citizen-2'))
    const app = buildReportApp({
      actorId: 'citizen-1',
      role: 'CITIZEN',
      reportRepository: { findById },
    })

    const response = await app.request('/api/reports/r1', {
      headers: { Authorization: 'Bearer citizen-1:CITIZEN' },
    })

    expect(response.status).toBe(404)
  })

  test('lets a director read any report by id', async () => {
    const findById = vi.fn(async () => makeReport('r1', 'citizen-2'))
    const app = buildReportApp({
      actorId: 'director-1',
      role: 'EDITORIAL_DIRECTOR',
      reportRepository: { findById },
    })

    const response = await app.request('/api/reports/r1', {
      headers: { Authorization: 'Bearer director-1:EDITORIAL_DIRECTOR' },
    })
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.data.id).toBe('r1')
  })
})
