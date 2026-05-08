import { describe, expect, test, vi } from 'vitest'
import { createFactCheckingService } from './createFactCheckingService'
import { Director } from '../../domain/entities/Director'
import { Investigation } from '../../domain/entities/Investigation'
import { InboxSubject } from '../../domain/entities/InboxSubject'
import { Publication } from '../../domain/entities/Publication'
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
    update: vi.fn(),
    findById: vi.fn(),
    findByInvestigationId: vi.fn(),
    findAll: vi.fn(),
    findCorrections: vi.fn(),
    delete: vi.fn(),
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
    saveMany: vi.fn(),
    ...deps.authoritySourceRepository,
  }
  const correctionRepository = {
    save: vi.fn(),
    findById: vi.fn(),
    findByPublicationId: vi.fn(),
    findByNotificationId: vi.fn(),
    findByCorrectedBy: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    ...deps.correctionRepository,
  }
  const domainEventPublisher = {
    publish: vi.fn(),
    ...deps.domainEventPublisher,
  }

  const service = createFactCheckingService(
    {
      reportRepository: reportRepository as any,
      reportMediaRepository: reportMediaRepository as any,
      investigationRepository: investigationRepository as any,
      investigationMediaRepository: investigationMediaRepository as any,
      publicationRepository: publicationRepository as any,
      correctionRepository: correctionRepository as any,
      notificationRepository: notificationRepository as any,
      workflowAuditRepository: workflowAuditRepository as any,
      citizenRepository: citizenRepository as any,
      journalistRepository: journalistRepository as any,
      directorRepository: directorRepository as any,
      watcherApplicationRepository: watcherApplicationRepository as any,
      evidenceRepository: evidenceRepository as any,
      inboxSubjectRepository: inboxSubjectRepository as any,
      inboxSubjectMediaRepository: inboxSubjectMediaRepository as any,
      authoritySourceRepository: authoritySourceRepository as any,
    },
    domainEventPublisher as any,
  )

  return {
    service,
    reportRepository,
    investigationRepository,
    publicationRepository,
    notificationRepository,
    workflowAuditRepository,
    journalistRepository,
    directorRepository,
    evidenceRepository,
    inboxSubjectRepository,
    citizenRepository,
    authoritySourceRepository,
    correctionRepository,
    domainEventPublisher,
  }
}

describe('FactCheckingService new workflows', () => {
  test('approveInvestigation keeps current flow when no publication evidence is provided', async () => {
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
      0,
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
    ctx.citizenRepository.findAll.mockResolvedValue([citizen])

    const publicationId = await ctx.service.approveInvestigation(
      director.id,
      investigation.id,
    )

    expect(publicationId).toBeTruthy()
    expect(investigation.status).toBe('PUBLISHED')
    expect(ctx.authoritySourceRepository.saveMany).toHaveBeenCalledWith([])
    expect(ctx.publicationRepository.save).toHaveBeenCalledOnce()
    const publication = ctx.publicationRepository.save.mock.calls[0][0]
    expect(publication.verifiedLinks).toEqual([])
    expect(publication.verifiedMedia).toEqual([])
    expect(ctx.notificationRepository.save).toHaveBeenCalledOnce()
    expect(ctx.notificationRepository.saveMany).toHaveBeenCalledOnce()
  })

  test('approveInvestigation attaches optional verified evidence to the publication', async () => {
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
      0,
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
    ctx.citizenRepository.findAll.mockResolvedValue([citizen])

    await ctx.service.approveInvestigation(director.id, investigation.id, {
      verifiedLinks: [
        {
          url: 'https://example.com/source',
          authoritySource: {
            name: 'Ministere',
            type: 'OFFICIAL_DECREE',
          },
        },
      ],
      verifiedMedia: [
        {
          url: 'https://example.com/evidence.jpg',
          type: 'IMAGE',
          authoritySource: {
            name: 'AFP Factuel',
            type: 'MEDIA_CROSSCHECK',
          },
        },
      ],
    })

    expect(ctx.authoritySourceRepository.saveMany).toHaveBeenCalledTimes(1)
    expect(ctx.authoritySourceRepository.saveMany).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Ministere', type: 'OFFICIAL_DECREE' }),
        expect.objectContaining({
          name: 'AFP Factuel',
          type: 'MEDIA_CROSSCHECK',
        }),
      ]),
    )
    expect(ctx.publicationRepository.save).toHaveBeenCalledOnce()
    const publication = ctx.publicationRepository.save.mock.calls[0][0]
    expect(publication.verifiedLinks).toHaveLength(1)
    expect(publication.verifiedMedia).toHaveLength(1)
    expect(publication.verifiedLinks[0].publicationId).toBe(publication.id)
    expect(publication.verifiedLinks[0].addedById).toBe(director.id)
    expect(publication.verifiedMedia[0].publicationId).toBe(publication.id)
    expect(publication.verifiedMedia[0].addedById).toBe(director.id)
    expect(publication.hasVerifiedEvidence()).toBe(true)
  })

  test('publishCorrection marks the publication, stores the correction, and notifies journalist plus citizens', async () => {
    const director = new Director('d1', 'Director', 'd@test')
    const journalist = new Journalist(
      'j1',
      'Journalist',
      'j@test',
      'JOURNALIST',
      'ACTIVE',
    )
    const investigation = new Investigation(
      'i1',
      's1',
      journalist.id,
      'FABRICATED',
      'TRUE',
      'notes',
      0,
      'PUBLISHED',
    )
    const publication = new Publication(
      'p1',
      investigation.id,
      director.id,
      'TRUE',
    )
    const citizenA = new Citizen(
      'c1',
      'Citizen A',
      'c1@test',
      'CITIZEN',
      'ACTIVE',
    )
    const citizenB = new Citizen(
      'c2',
      'Citizen B',
      'c2@test',
      'CITIZEN',
      'ACTIVE',
    )

    const ctx = buildService()
    ctx.directorRepository.findById.mockResolvedValue(director)
    ctx.publicationRepository.findById.mockResolvedValue(publication)
    ctx.investigationRepository.findById.mockResolvedValue(investigation)
    ctx.citizenRepository.findAll.mockResolvedValue([citizenA, citizenB])

    const correctionId = await ctx.service.publishCorrection(
      director.id,
      publication.id,
      {
        title: 'Correction officielle',
        content: 'Un point de contexte a ete precise.',
      },
    )

    expect(correctionId).toBeTruthy()
    expect(publication.isCorrection).toBe(true)
    expect(ctx.publicationRepository.update).toHaveBeenCalledWith(publication)
    expect(ctx.notificationRepository.save).toHaveBeenCalledOnce()
    expect(ctx.correctionRepository.save).toHaveBeenCalledOnce()
    const savedCorrection = ctx.correctionRepository.save.mock.calls[0][0]
    const journalistNotification =
      ctx.notificationRepository.save.mock.calls[0][0]
    expect(savedCorrection.publicationId).toBe(publication.id)
    expect(savedCorrection.correctedById).toBe(director.id)
    expect(savedCorrection.notificationId).toBe(journalistNotification.id)
    expect(ctx.notificationRepository.saveMany).toHaveBeenCalledOnce()
    const citizenNotifications =
      ctx.notificationRepository.saveMany.mock.calls[0][0]
    expect(citizenNotifications).toHaveLength(2)
    expect(citizenNotifications.map((n: any) => n.actorId)).toEqual([
      'c1',
      'c2',
    ])
    expect(
      citizenNotifications.every((n: any) => n.type === 'CORRECTION'),
    ).toBe(true)
  })

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
