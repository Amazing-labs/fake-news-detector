import { describe, expect, test, vi } from 'vitest'
import { createApp } from './createApp'
import { SecurityService } from '../application/services/SecurityService'
import { ReportController } from './controllers/ReportController'
import { InboxSubjectController } from './controllers/InboxSubjectController'
import { InvestigationController } from './controllers/InvestigationController'

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

  const securityService = new SecurityService({
    verify: vi.fn(async (token: string) => {
      const rawToken = token.replace(/^Bearer\s+/i, '')
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
        citizenId: 'c1',
        theme: 'theme',
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
        citizenId: 'citizen-1',
        theme: 'health',
        title: 'Title',
        content: 'Body',
      }),
    })
    const json = await response.json()

    expect(response.status).toBe(201)
    expect(json.success).toBe(true)
    expect(reportController.createReport).toHaveBeenCalledOnce()
  })

  test('rejects report submission when body citizenId does not match authenticated actor', async () => {
    const submitReport = vi.fn()
    const securityService = new SecurityService({
      verify: vi.fn(async () => ({
        isValid: true,
        actorId: 'citizen-1',
        role: 'CITIZEN' as const,
      })),
    })
    const app = createApp({
      securityService,
      reportController: new ReportController(
        { submitReport } as any,
        { findByCitizenId: vi.fn(), findAll: vi.fn() } as any,
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
    })

    const response = await app.request('/api/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer citizen-1:CITIZEN',
      },
      body: JSON.stringify({
        citizenId: 'citizen-2',
        theme: 'health',
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
      verify: vi.fn(async () => ({
        isValid: true,
        actorId: 'citizen-1',
        role: 'CITIZEN' as const,
      })),
    })
    const app = createApp({
      securityService,
      reportController: new ReportController(
        { submitReport } as any,
        { findByCitizenId: vi.fn(), findAll: vi.fn() } as any,
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
      verify: vi.fn(async () => ({
        isValid: true,
        actorId: 'citizen-1',
        role: 'CITIZEN' as const,
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
        { findByStatus, findAll } as any,
        { listInbox: vi.fn() } as any,
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
    })

    const response = await app.request('/api/inbox-subjects?status=INVALID', {
      headers: {
        Authorization: 'Bearer citizen-1:CITIZEN',
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
      verify: vi.fn(async () => ({
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
    })

    const response = await app.request('/api/publications/pub-1/corrections', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer director-1:EDITORIAL_DIRECTOR',
      },
      body: JSON.stringify({
        directorId: 'director-1',
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
      verify: vi.fn(async () => ({
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
    })

    const response = await app.request('/api/investigations/inv-1/approve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer director-1:EDITORIAL_DIRECTOR',
      },
      body: JSON.stringify({
        directorId: 'director-1',
      }),
    })

    expect(response.status).toBe(201)
    expect(investigationController.approve).toHaveBeenCalledOnce()
  })

  test('rejects invalid numeric mediaId before reaching the investigation service', async () => {
    const updateInvestigationSourceMediaItem = vi.fn()
    const securityService = new SecurityService({
      verify: vi.fn(async () => ({
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
          journalistId: 'journalist-1',
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
