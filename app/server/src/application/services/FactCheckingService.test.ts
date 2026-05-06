import { describe, expect, test, vi } from 'vitest'
import { FactCheckingService } from './FactCheckingService'
import { Director } from '../../domain/entities/Director'
import { Investigation } from '../../domain/entities/Investigation'
import { InboxSubject } from '../../domain/entities/InboxSubject'
import { Report } from '../../domain/entities/Report'
import { Journalist } from '../../domain/entities/Journalist'
import { Citizen } from '../../domain/entities/Citizen'
import { MAX_REVISION_ATTEMPTS } from '../../shared/constants'
import { BusinessRuleError } from '../../shared/errors'

function buildService(deps: any = {}) {
  const reportRepository = {
    save: vi.fn(),
    findById: vi.fn(),
    findByStatus: vi.fn(),
    findAll: vi.fn(),
    findByTheme: vi.fn(),
    listInbox: vi.fn(),
    findByCitizenId: vi.fn(),
    delete: vi.fn(),
    ...deps.reportRepository,
  }
  const reportMediaRepository = {
    saveMany: vi.fn(),
    findByReportId: vi.fn(),
    ...deps.reportMediaRepository,
  }
  const investigationRepository = {
    save: vi.fn(),
    findById: vi.fn(),
    findByReportId: vi.fn(),
    findByInboxSubjectId: vi.fn(),
    findByJournalistId: vi.fn(),
    findPendingReviews: vi.fn(),
    findPublished: vi.fn(),
    update: vi.fn(),
    addEvidence: vi.fn(),
    ...deps.investigationRepository,
  }
  const investigationMediaRepository = {
    findByInvestigationId: vi.fn(),
    saveMany: vi.fn(),
    update: vi.fn(),
    ...deps.investigationMediaRepository,
  }
  const publicationRepository = {
    save: vi.fn(),
    findAll: vi.fn(),
    count: vi.fn(),
    ...deps.publicationRepository,
  }
  const notificationRepository = {
    save: vi.fn(),
    saveMany: vi.fn(),
    findById: vi.fn(),
    findByActorId: vi.fn(),
    findActiveByActorId: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    deleteOlderThan: vi.fn(),
    countActiveByActorId: vi.fn(),
    count: vi.fn(),
    ...deps.notificationRepository,
  }
  const workflowAuditRepository = {
    save: vi.fn(),
    ...deps.workflowAuditRepository,
  }
  const citizenRepository = {
    findById: vi.fn(),
    update: vi.fn(),
    findAll: vi.fn(),
    ...deps.citizenRepository,
  }
  const journalistRepository = {
    findById: vi.fn(),
    update: vi.fn(),
    ...deps.journalistRepository,
  }
  const directorRepository = {
    findById: vi.fn(),
    update: vi.fn(),
    ...deps.directorRepository,
  }
  const watcherApplicationRepository = {
    save: vi.fn(),
    findWatcherApplicationById: vi.fn(),
    updateWatcherApplicationStatus: vi.fn(),
    ...deps.watcherApplicationRepository,
  }
  const evidenceRepository = {
    saveWithMedia: vi.fn(),
    findByInvestigationId: vi.fn(),
    findWithMediaByInvestigationId: vi.fn(),
    updateEvidenceMedia: vi.fn(),
    ...deps.evidenceRepository,
  }
  const inboxSubjectRepository = {
    save: vi.fn(),
    update: vi.fn(),
    findById: vi.fn(),
    findAll: vi.fn(),
    findByStatus: vi.fn(),
    findByOrigin: vi.fn(),
    findByCreatedBy: vi.fn(),
    findByReportId: vi.fn(),
    delete: vi.fn(),
    ...deps.inboxSubjectRepository,
  }
  const inboxSubjectMediaRepository = {
    saveMany: vi.fn(),
    findByInboxSubjectId: vi.fn(),
    ...deps.inboxSubjectMediaRepository,
  }
  const authoritySourceRepository = {
    save: vi.fn(),
    ...deps.authoritySourceRepository,
  }
  const domainEventPublisher = {
    publish: vi.fn(),
    ...deps.domainEventPublisher,
  }

  const service = new FactCheckingService(
    reportRepository as any,
    reportMediaRepository as any,
    investigationRepository as any,
    investigationMediaRepository as any,
    publicationRepository as any,
    notificationRepository as any,
    workflowAuditRepository as any,
    citizenRepository as any,
    journalistRepository as any,
    directorRepository as any,
    watcherApplicationRepository as any,
    evidenceRepository as any,
    inboxSubjectRepository as any,
    inboxSubjectMediaRepository as any,
    authoritySourceRepository as any,
    domainEventPublisher as any,
  )

  return {
    service,
    reportRepository,
    investigationRepository,
    notificationRepository,
    workflowAuditRepository,
    journalistRepository,
    directorRepository,
    evidenceRepository,
    inboxSubjectRepository,
    citizenRepository,
    domainEventPublisher,
  }
}

describe('FactCheckingService new workflows', () => {
  test('rejectInvestigation auto-cancels and notifies stakeholders + director', async () => {
    const director = new Director('d1', 'Director', 'd@test')
    const journalist = new Journalist(
      'j1',
      'Journalist',
      'j@test',
      'JOURNALIST',
      'ACTIVE',
      0,
      new Date(),
      1,
    )
    const investigation = new Investigation(
      'i1',
      's1',
      journalist.id,
      'FABRICATED',
      'TRUE',
      'notes',
      MAX_REVISION_ATTEMPTS,
      'PENDING_REVIEW',
    )
    const subject = new InboxSubject(
      's1',
      'theme',
      'description',
      director.id,
      'r1',
      'IN_PROGRESS',
      'REPORT',
    )
    const report = new Report('r1', 'c1', 'theme', 'title', 'content', 'OPEN')
    const citizen = new Citizen('c1', 'Citizen', 'c@test', 'CITIZEN', 'ACTIVE')

    const ctx = buildService()
    ctx.directorRepository.findById.mockResolvedValue(director)
    ctx.investigationRepository.findById.mockResolvedValue(investigation)
    ctx.inboxSubjectRepository.findById.mockResolvedValue(subject)
    ctx.reportRepository.findById.mockResolvedValue(report)
    ctx.citizenRepository.findById.mockResolvedValue(citizen)
    ctx.journalistRepository.findById.mockResolvedValue(journalist)
    ctx.evidenceRepository.findByInvestigationId.mockResolvedValue([
      { watcherId: 'w1' },
    ])

    await ctx.service.rejectInvestigation(
      director.id,
      investigation.id,
      'reason',
    )

    expect(investigation.status).toBe('CANCELED')
    expect(ctx.workflowAuditRepository.save).toHaveBeenCalledOnce()
    expect(ctx.notificationRepository.saveMany).toHaveBeenCalledOnce()
    const notifications = ctx.notificationRepository.saveMany.mock.calls[0][0]
    const actorIds = notifications.map((n: any) => n.actorId)
    expect(actorIds).toEqual(expect.arrayContaining(['d1', 'j1', 'w1', 'c1']))
    expect(ctx.domainEventPublisher.publish).toHaveBeenCalledOnce()
  })

  test('deleteInboxSubjectByDirector deletes report-origin and notifies citizen', async () => {
    const director = new Director('d1', 'Director', 'd@test')
    const subject = new InboxSubject(
      's1',
      'theme',
      'description',
      director.id,
      'r1',
      'OPEN',
      'REPORT',
    )
    const report = new Report('r1', 'c1', 'theme', 'title', 'content', 'OPEN')
    const citizen = new Citizen('c1', 'Citizen', 'c@test', 'CITIZEN', 'ACTIVE')

    const ctx = buildService()
    ctx.directorRepository.findById.mockResolvedValue(director)
    ctx.inboxSubjectRepository.findById.mockResolvedValue(subject)
    ctx.investigationRepository.findByInboxSubjectId.mockResolvedValue(null)
    ctx.reportRepository.findById.mockResolvedValue(report)
    ctx.citizenRepository.findById.mockResolvedValue(citizen)

    await ctx.service.deleteInboxSubjectByDirector(
      director.id,
      subject.id,
      'spam',
    )

    expect(ctx.reportRepository.delete).toHaveBeenCalledWith('r1')
    expect(ctx.inboxSubjectRepository.delete).toHaveBeenCalledWith('s1')
    expect(ctx.citizenRepository.update).toHaveBeenCalledOnce()
    expect(ctx.notificationRepository.save).toHaveBeenCalledOnce()
    expect(ctx.domainEventPublisher.publish).toHaveBeenCalledOnce()
  })

  test('deleteInboxSubjectByDirector blocks deletion when already investigated', async () => {
    const director = new Director('d1', 'Director', 'd@test')
    const subject = new InboxSubject(
      's1',
      'theme',
      'description',
      director.id,
      null,
      'IN_PROGRESS',
      'DIRECTOR_INITIATED',
    )

    const ctx = buildService()
    ctx.directorRepository.findById.mockResolvedValue(director)
    ctx.inboxSubjectRepository.findById.mockResolvedValue(subject)
    ctx.investigationRepository.findByInboxSubjectId.mockResolvedValue(
      new Investigation('i1', subject.id, 'j1'),
    )

    await expect(
      ctx.service.deleteInboxSubjectByDirector(
        director.id,
        subject.id,
        'cleanup',
      ),
    ).rejects.toThrow(BusinessRuleError)
  })
})
