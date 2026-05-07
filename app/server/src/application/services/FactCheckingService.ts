// application/services/FactCheckingService.ts
//
// Orchestrates the fact-checking workflow:
//   citizen report -> journalist investigation -> director review (publish | revise | archive)
// using domain aggregates, factories, and the investigation workflow process.
import { randomUUID } from 'crypto'

import {
  type ICitizenRepository,
  type IDirectorRepository,
  type IEvidenceRepository,
  type IInboxSubjectMediaRepository,
  type IInboxSubjectRepository,
  type IInvestigationMediaRepository,
  type IInvestigationRepository,
  type IJournalistRepository,
  type INotificationRepository,
  type IPublicationRepository,
  type IReportMediaRepository,
  type IReportRepository,
  type IWatcherApplicationRepository,
  type IWorkflowAuditRepository,
  type IAuthoritySourceRepository,
} from '../../domain/repositories'
import type { ReportMediaInsert } from '../../domain/repositories/IReportMediaRepository'
import type { InboxSubjectMediaInsert } from '../../domain/repositories/IInboxSubjectMediaRepository'
import { ReportFactory } from '../../domain/factories/ReportFactory'
import { PublicationFactory } from '../../domain/factories/PublicationFactory'
import { NotificationFactory } from '../../domain/factories/NotificationFactory'
import { WatcherApplicationFactory } from '../../domain/factories/WatcherApplicationFactory'
import { EvidenceFactory } from '../../domain/factories/EvidenceFactory'
import { AuthoritySourceFactory } from '../../domain/factories/AuthoritySourceFactory'
import {
  InvestigationMediaFactory,
  VerifiedLinkFactory,
  VerifiedMediaFactory,
} from '../../domain/factories/MediaFactory'
import { Investigation } from '../../domain/entities/Investigation'
import { Report } from '../../domain/entities/Report'
import type {
  MediaCategory,
  Verdict,
} from '../../domain/entities/Investigation'
import {
  InboxSubjectDeletedEvent,
  InvestigationCanceledEvent,
  NoopDomainEventPublisher,
  type IDomainEventPublisher,
} from '../../domain/events'
import type {
  MediaType,
  InvestigationMedia,
  VerifiedLink,
  VerifiedMedia,
} from '../../domain/value-objects'
import type { SourceType } from '../../domain/entities/AuthoritySource'
import { copySourceMediaToInvestigationMedia } from '../../domain/processes/investigationMediaCopy'
import {
  directorAcceptUnverifiableArchiveWithAudit,
  directorApproveInvestigationWithAudit,
  directorCancelInvestigationWithAudit,
  directorRejectInvestigationWithAudit,
  submitInvestigationForReviewWithAudit,
} from '../../domain/processes/investigationStatusWorkflow'
import {
  BusinessRuleError,
  NotFoundError,
  ValidationError,
} from '../../shared/errors'

export interface SubmitReportInput {
  citizenId: string
  theme: string
  title: string
  content: string
  media?: Array<{ url: string; type: MediaType; order?: number }>
}

export interface SubmitWatcherEvidenceInput {
  citizenId: string
  investigationId: string
  title: string
  content: string
  media: Array<{ url: string; type: MediaType; order?: number }>
}

export interface CreateDirectorInboxSubjectInput {
  theme: string
  description: string
  media?: Array<{ url: string; type: MediaType; order?: number }>
}

export interface PublicationAuthoritySourceInput {
  name: string
  type: SourceType
}

export interface PublicationVerifiedLinkInput {
  url: string
  authoritySource?: PublicationAuthoritySourceInput
}

export interface PublicationVerifiedMediaInput {
  url: string
  type: MediaType
  order?: number
  authoritySource?: PublicationAuthoritySourceInput
}

export interface ApproveInvestigationInput {
  verifiedLinks?: PublicationVerifiedLinkInput[]
  verifiedMedia?: PublicationVerifiedMediaInput[]
}

export class FactCheckingService {
  constructor(
    private readonly reportRepository: IReportRepository,
    private readonly reportMediaRepository: IReportMediaRepository,
    private readonly investigationRepository: IInvestigationRepository,
    private readonly investigationMediaRepository: IInvestigationMediaRepository,
    private readonly publicationRepository: IPublicationRepository,
    private readonly notificationRepository: INotificationRepository,
    private readonly workflowAuditRepository: IWorkflowAuditRepository,
    private readonly citizenRepository: ICitizenRepository,
    private readonly journalistRepository: IJournalistRepository,
    private readonly directorRepository: IDirectorRepository,
    private readonly watcherApplicationRepository: IWatcherApplicationRepository,
    private readonly evidenceRepository: IEvidenceRepository,
    private readonly inboxSubjectRepository: IInboxSubjectRepository,
    private readonly inboxSubjectMediaRepository: IInboxSubjectMediaRepository,
    private readonly authoritySourceRepository: IAuthoritySourceRepository,
    private readonly domainEventPublisher: IDomainEventPublisher = new NoopDomainEventPublisher(),
  ) {}

  // ---------------------------------------------------------------------------
  // Citizen flows
  // ---------------------------------------------------------------------------

  async submitReport(input: SubmitReportInput): Promise<string> {
    const citizen = await this.citizenRepository.findById(input.citizenId)
    if (!citizen) throw new NotFoundError('Citizen', input.citizenId)
    if (!citizen.canSubmitReport()) {
      throw new BusinessRuleError(
        'Citizen cannot submit a new report (inactive or maximum reached)',
      )
    }

    const report = ReportFactory.create({
      citizenId: input.citizenId,
      theme: input.theme,
      title: input.title,
      content: input.content,
    })
    citizen.incrementEngagementScore()
    citizen.openReportsCount++
    await this.reportRepository.save(report)

    if (input.media?.length) {
      const rows: ReportMediaInsert[] = input.media.map((m, idx) => ({
        url: m.url,
        type: m.type,
        order: m.order ?? idx,
        uploadedById: input.citizenId,
      }))
      await this.reportMediaRepository.saveMany(report.id, rows)
    }

    await this.citizenRepository.update(citizen)
    return report.id
  }

  async submitWatcherApplication(
    citizenId: string,
    motivation: string,
  ): Promise<string> {
    if (!motivation.trim()) {
      throw new ValidationError('Motivation is required')
    }
    const citizen = await this.citizenRepository.findById(citizenId)
    if (!citizen) throw new NotFoundError('Citizen', citizenId)
    if (!citizen.canApplyForWatcher()) {
      throw new BusinessRuleError(
        'Citizen cannot apply for watcher: must be ACTIVE and REGULAR type',
      )
    }
    if (citizen.isWatcher()) {
      throw new BusinessRuleError('Citizen is already a watcher')
    }
    const application = WatcherApplicationFactory.create({
      actorId: citizenId,
      motivation,
    })
    await this.watcherApplicationRepository.save(application)
    return application.id
  }

  async submitWatcherEvidence(
    input: SubmitWatcherEvidenceInput,
  ): Promise<string> {
    if (!input.media?.length) {
      throw new ValidationError(
        'Watcher evidence requires at least one media item',
      )
    }
    const citizen = await this.citizenRepository.findById(input.citizenId)
    if (!citizen) throw new NotFoundError('Citizen', input.citizenId)
    if (!citizen.canSubmitEvidence()) {
      throw new BusinessRuleError('Only active watchers can submit evidence')
    }

    const investigation = await this.investigationRepository.findById(
      input.investigationId,
    )
    if (!investigation) {
      throw new NotFoundError('Investigation', input.investigationId)
    }

    const evidence = EvidenceFactory.createWithMedia(
      {
        investigationId: investigation.id,
        watcherId: citizen.id,
        title: input.title,
        content: input.content,
      },
      input.media,
    )
    await this.evidenceRepository.saveWithMedia(evidence)

    citizen.incrementEngagementScore(2)
    await this.citizenRepository.update(citizen)

    const notification = NotificationFactory.createInvestigationNotification(
      investigation.journalistId,
      'Nouvelle preuve',
      `Une nouvelle preuve a été déposée sur l'enquête ${investigation.id}.`,
    )
    await this.notificationRepository.save(notification)
    return evidence.id
  }

  // ---------------------------------------------------------------------------
  // Director inbox (atomic subject + optional media)
  // ---------------------------------------------------------------------------

  async createDirectorInboxSubject(
    directorId: string,
    input: CreateDirectorInboxSubjectInput,
  ): Promise<string> {
    const director = await this.directorRepository.findById(directorId)
    if (!director) throw new NotFoundError('Director', directorId)

    const subject = director.createInboxSubject(input.theme, input.description)
    await this.inboxSubjectRepository.save(subject)

    if (input.media?.length) {
      const rows: InboxSubjectMediaInsert[] = input.media.map((m, idx) => ({
        url: m.url,
        type: m.type,
        order: m.order ?? idx,
        uploadedById: directorId,
        origin: 'DIRECTOR_INITIATED',
      }))
      await this.inboxSubjectMediaRepository.saveMany(subject.id, rows)
    }

    await this.directorRepository.update(director)
    return subject.id
  }

  // ---------------------------------------------------------------------------
  // Journalist flows
  // ---------------------------------------------------------------------------

  async pickInboxSubject(
    journalistId: string,
    inboxSubjectId: string,
  ): Promise<Investigation> {
    const journalist = await this.journalistRepository.findById(journalistId)
    if (!journalist) throw new NotFoundError('Journalist', journalistId)

    const subject = await this.inboxSubjectRepository.findById(inboxSubjectId)
    if (!subject) throw new NotFoundError('InboxSubject', inboxSubjectId)

    const investigation = journalist.pickInboxSubject(subject)

    // Préparer les médias avant toute persistence pour éviter l'état partiel
    let mediaCopies: InvestigationMedia[] = []
    if (subject.origin === 'REPORT' && subject.reportId) {
      const reportRows = await this.reportMediaRepository.findByReportId(
        subject.reportId,
      )
      mediaCopies = copySourceMediaToInvestigationMedia(investigation.id, {
        type: 'REPORT',
        rows: reportRows,
      })
    } else if (subject.origin === 'DIRECTOR_INITIATED') {
      const inboxRows =
        await this.inboxSubjectMediaRepository.findByInboxSubjectId(
          inboxSubjectId,
        )
      mediaCopies = copySourceMediaToInvestigationMedia(investigation.id, {
        type: 'INBOX_DIRECTOR',
        rows: inboxRows,
      })
    }

    // Persister tout atomiquement (TODO: wrapper dans une transaction)
    await this.inboxSubjectRepository.update(subject)
    await this.journalistRepository.update(journalist)
    await this.investigationRepository.save(investigation)

    if (mediaCopies.length > 0) {
      await this.investigationMediaRepository.saveMany(
        investigation.id,
        mediaCopies,
      )
    }

    return investigation
  }

  async submitInvestigationForReview(
    journalistId: string,
    investigationId: string,
  ): Promise<void> {
    const journalist = await this.journalistRepository.findById(journalistId)
    if (!journalist) throw new NotFoundError('Journalist', journalistId)

    const investigation =
      await this.investigationRepository.findById(investigationId)
    if (!investigation) {
      throw new NotFoundError('Investigation', investigationId)
    }

    const invMedia =
      await this.investigationMediaRepository.findByInvestigationId(
        investigationId,
      )
    const evidenceBundles =
      await this.evidenceRepository.findWithMediaByInvestigationId(
        investigationId,
      )

    const audit = submitInvestigationForReviewWithAudit(
      journalist,
      investigation,
      invMedia,
      evidenceBundles,
    )
    await this.investigationRepository.update(investigation)
    await this.workflowAuditRepository.save(audit)
  }

  async updateInvestigationSourceMediaItem(
    journalistId: string,
    investigationId: string,
    mediaId: number,
    input: {
      category: MediaCategory
      reliability: Verdict
      justification: string
    },
  ): Promise<void> {
    const investigation =
      await this.investigationRepository.findById(investigationId)
    if (!investigation)
      throw new NotFoundError('Investigation', investigationId)
    if (investigation.journalistId !== journalistId) {
      throw new BusinessRuleError('Investigation belongs to another journalist')
    }
    const items =
      await this.investigationMediaRepository.findByInvestigationId(
        investigationId,
      )
    const m = items.find((row) => row.id === mediaId)
    if (!m) throw new NotFoundError('InvestigationMedia', String(mediaId))
    if (!m.requiresJournalistClassification()) {
      throw new BusinessRuleError(
        'Only citizen- or director-inbox-sourced media can be updated here',
      )
    }
    m.submitCategory(input.category)
    m.submitReliabilityVerdict(input.reliability)
    m.submitJustification(input.justification)
    await this.investigationMediaRepository.update(m)
  }

  async updateWatcherEvidenceMediaItem(
    journalistId: string,
    investigationId: string,
    evidenceId: string,
    mediaId: number,
    input: {
      category: MediaCategory
      reliability: Verdict
      justification: string
    },
  ): Promise<void> {
    const investigation =
      await this.investigationRepository.findById(investigationId)
    if (!investigation)
      throw new NotFoundError('Investigation', investigationId)
    if (investigation.journalistId !== journalistId) {
      throw new BusinessRuleError('Investigation belongs to another journalist')
    }
    const bundles =
      await this.evidenceRepository.findWithMediaByInvestigationId(
        investigationId,
      )
    const bundle = bundles.find((b) => b.evidence.id === evidenceId)
    if (!bundle) throw new NotFoundError('Evidence', evidenceId)
    const row = bundle.media.find((x) => x.id === mediaId)
    if (!row) throw new NotFoundError('EvidenceMedia', String(mediaId))
    row.changeCategory(input.category)
    row.changeReliability(input.reliability)
    row.changeJustification(input.justification)
    await this.evidenceRepository.updateEvidenceMedia(row)
  }

  async addJournalistProofMedia(
    journalistId: string,
    investigationId: string,
    input: {
      url: string
      type: MediaType
      order?: number
      authoritySourceName: string
      authoritySourceType: SourceType
    },
  ): Promise<void> {
    const investigation =
      await this.investigationRepository.findById(investigationId)
    if (!investigation)
      throw new NotFoundError('Investigation', investigationId)
    if (investigation.journalistId !== journalistId) {
      throw new BusinessRuleError('Investigation belongs to another journalist')
    }

    const authority = AuthoritySourceFactory.create({
      name: input.authoritySourceName,
      type: input.authoritySourceType,
    })
    await this.authoritySourceRepository.save(authority)

    const existing =
      await this.investigationMediaRepository.findByInvestigationId(
        investigationId,
      )
    const order =
      input.order ??
      (existing.length > 0 ? Math.max(...existing.map((e) => e.order)) + 1 : 0)

    const media = InvestigationMediaFactory.createFromJournalistProof(
      0,
      order,
      input.url,
      input.type,
      investigationId,
      journalistId,
      authority.id,
    )
    await this.investigationMediaRepository.saveMany(investigationId, [media])
  }

  // ---------------------------------------------------------------------------
  // Director flows
  // ---------------------------------------------------------------------------

  async approveInvestigation(
    directorId: string,
    investigationId: string,
    input: ApproveInvestigationInput = {},
  ): Promise<string> {
    const director = await this.directorRepository.findById(directorId)
    if (!director) throw new NotFoundError('Director', directorId)

    const investigation =
      await this.investigationRepository.findById(investigationId)
    if (!investigation) {
      throw new NotFoundError('Investigation', investigationId)
    }

    const audit = directorApproveInvestigationWithAudit(director, investigation)
    const publicationId = randomUUID()
    const evidenceBundle = this.buildPublicationEvidence(
      director.id,
      input,
      publicationId,
    )
    const publication = PublicationFactory.createPublication(
      publicationId,
      investigation.id,
      director.id,
      investigation.draftVerdict,
      {
        verifiedLinks: evidenceBundle.verifiedLinks,
        verifiedMedia: evidenceBundle.verifiedMedia,
      },
    )

    await this.investigationRepository.update(investigation)
    await this.directorRepository.update(director)
    for (const authoritySource of evidenceBundle.authoritySources) {
      await this.authoritySourceRepository.save(authoritySource)
    }
    await this.publicationRepository.save(publication)
    await this.workflowAuditRepository.save(audit)

    await this.closeReportAndLinkedInboxAfterInvestigation(investigation)
    await this.finalizeJournalistInvestigationSlot(investigation)

    await this.notifyJournalistAboutPublication(
      investigation.journalistId,
      publication.id,
    )
    await this.broadcastPublicationToCitizens(publication.id)
    return publication.id
  }

  async rejectInvestigation(
    directorId: string,
    investigationId: string,
    reason: string,
  ): Promise<void> {
    if (!reason.trim()) {
      throw new ValidationError('Rejection reason is required')
    }
    const director = await this.directorRepository.findById(directorId)
    if (!director) throw new NotFoundError('Director', directorId)

    const investigation =
      await this.investigationRepository.findById(investigationId)
    if (!investigation) {
      throw new NotFoundError('Investigation', investigationId)
    }

    const audit = directorRejectInvestigationWithAudit(
      director,
      investigation,
      reason,
    )

    await this.investigationRepository.update(investigation)
    await this.workflowAuditRepository.save(audit)
    if (investigation.status === 'CANCELED') {
      await this._handleCancellationSideEffects(
        investigation,
        director.id,
        'MAX_REVISION_ATTEMPTS_REACHED',
        'Investigation annulée en raison d’un nombre excessif de tentatives de révision (risque d’attaque DoS)',
        true,
      )
      return
    }

    const notification = NotificationFactory.createInvestigationNotification(
      investigation.journalistId,
      'Enquête à corriger',
      `Votre enquête a été rejetée: ${reason}`,
    )
    await this.notificationRepository.save(notification)
  }

  async cancelInvestigation(
    directorId: string,
    investigationId: string,
    reason: string,
  ): Promise<void> {
    if (!reason.trim()) {
      throw new ValidationError('Cancellation reason is required')
    }
    const director = await this.directorRepository.findById(directorId)
    if (!director) throw new NotFoundError('Director', directorId)

    const investigation =
      await this.investigationRepository.findById(investigationId)
    if (!investigation) {
      throw new NotFoundError('Investigation', investigationId)
    }

    const audit = directorCancelInvestigationWithAudit(
      director,
      investigation,
      reason,
    )
    await this.investigationRepository.update(investigation)
    await this.workflowAuditRepository.save(audit)

    await this._handleCancellationSideEffects(
      investigation,
      director.id,
      'MANUAL_DIRECTOR_CANCELLATION',
      reason,
      false,
    )
  }

  async deleteInboxSubjectByDirector(
    directorId: string,
    inboxSubjectId: string,
    reason: string,
  ): Promise<void> {
    if (!reason.trim()) {
      throw new ValidationError('Deletion reason is required')
    }
    const director = await this.directorRepository.findById(directorId)
    if (!director) throw new NotFoundError('Director', directorId)

    const subject = await this.inboxSubjectRepository.findById(inboxSubjectId)
    if (!subject) throw new NotFoundError('InboxSubject', inboxSubjectId)

    const linkedInvestigation =
      await this.investigationRepository.findByInboxSubjectId(inboxSubjectId)
    if (linkedInvestigation) {
      throw new BusinessRuleError(
        'InboxSubject cannot be deleted after an investigation has started',
      )
    }

    let reportCitizenId: string | null = null
    if (subject.origin === 'REPORT' && subject.reportId) {
      const report = await this.reportRepository.findById(subject.reportId)
      if (!report) throw new NotFoundError('Report', subject.reportId)
      reportCitizenId = report.citizenId
      const citizen = await this.citizenRepository.findById(report.citizenId)
      if (citizen) {
        citizen.reportResolved()
        await this.citizenRepository.update(citizen)
      }
      await this.reportRepository.delete(report.id)
    }
    await this.inboxSubjectRepository.delete(subject.id)

    if (subject.origin === 'REPORT' && reportCitizenId) {
      const notification = NotificationFactory.createAlertNotification(
        reportCitizenId,
        'Signalement supprimé',
        `Votre signalement a été supprimé définitivement: ${reason}`,
      )
      await this.notificationRepository.save(notification)
    }

    await this.domainEventPublisher.publish(
      new InboxSubjectDeletedEvent(
        subject.id,
        director.id,
        subject.origin,
        reason,
        subject.reportId,
      ),
    )
  }

  async archiveUnverifiableInvestigation(
    directorId: string,
    investigationId: string,
    comment?: string,
  ): Promise<void> {
    const director = await this.directorRepository.findById(directorId)
    if (!director) throw new NotFoundError('Director', directorId)

    const investigation =
      await this.investigationRepository.findById(investigationId)
    if (!investigation) {
      throw new NotFoundError('Investigation', investigationId)
    }

    const audit = directorAcceptUnverifiableArchiveWithAudit(
      director,
      investigation,
      comment,
    )

    await this.investigationRepository.update(investigation)
    await this.workflowAuditRepository.save(audit)

    const report =
      await this.closeReportAndLinkedInboxAfterInvestigation(investigation)
    await this.finalizeJournalistInvestigationSlot(investigation)

    const evidenceList = await this.evidenceRepository.findByInvestigationId(
      investigation.id,
    )
    const contributingWatcherIds = Array.from(
      new Set(evidenceList.map((e) => e.watcherId)),
    )

    const stakeholderIds = new Set<string>([
      investigation.journalistId,
      ...contributingWatcherIds,
    ])
    if (report) {
      stakeholderIds.add(report.citizenId)
    }

    const notifications = Array.from(stakeholderIds).map((actorId) => {
      const message = this.archivedUnverifiableMessageForStakeholder(
        actorId,
        investigation.journalistId,
        report?.citizenId ?? null,
      )
      return NotificationFactory.createArchivedPublicationNotification(
        actorId,
        'Enquête archivée',
        message,
        investigation.id,
      )
    })
    if (notifications.length > 0) {
      await this.notificationRepository.saveMany(notifications)
    }
  }

  // ---------------------------------------------------------------------------
  // Watcher application decisions
  // ---------------------------------------------------------------------------

  async approveWatcherApplication(
    directorId: string,
    applicationId: string,
  ): Promise<void> {
    const director = await this.directorRepository.findById(directorId)
    if (!director) throw new NotFoundError('Director', directorId)

    const application =
      await this.watcherApplicationRepository.findWatcherApplicationById(
        applicationId,
      )
    if (!application) {
      throw new NotFoundError('WatcherApplication', applicationId)
    }

    const citizen = await this.citizenRepository.findById(application.actorId)
    if (!citizen) throw new NotFoundError('Citizen', application.actorId)

    director.approveWatcherApplication(application)
    citizen.promoteToWatcher()

    await this.watcherApplicationRepository.updateWatcherApplicationStatus(
      director.id,
      application.id,
      application.status,
    )
    await this.citizenRepository.update(citizen)

    const notification = NotificationFactory.createAlertNotification(
      citizen.id,
      'Watcher',
      'Votre candidature watcher a été approuvée.',
    )
    await this.notificationRepository.save(notification)
  }

  async rejectWatcherApplication(
    directorId: string,
    applicationId: string,
  ): Promise<void> {
    const director = await this.directorRepository.findById(directorId)
    if (!director) throw new NotFoundError('Director', directorId)

    const application =
      await this.watcherApplicationRepository.findWatcherApplicationById(
        applicationId,
      )
    if (!application) {
      throw new NotFoundError('WatcherApplication', applicationId)
    }

    director.rejectWatcherApplication(application)

    await this.watcherApplicationRepository.updateWatcherApplicationStatus(
      director.id,
      application.id,
      application.status,
    )

    const notification = NotificationFactory.createAlertNotification(
      application.actorId,
      'Watcher',
      'Votre candidature watcher a été rejetée.',
    )
    await this.notificationRepository.save(notification)
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  private archivedUnverifiableMessageForStakeholder(
    actorId: string,
    journalistId: string,
    reportingCitizenId: string | null,
  ): string {
    if (actorId === journalistId) {
      return 'Votre enquête a été archivée (verdict invérifiable accepté).'
    }
    if (reportingCitizenId && actorId === reportingCitizenId) {
      return 'Votre signalement associé a été archivé (verdict invérifiable).'
    }
    return 'Une enquête à laquelle vous avez contribué en tant que vigie a été archivée (verdict invérifiable).'
  }

  private canceledMessageForStakeholder(
    actorId: string,
    journalistId: string,
    reportingCitizenId: string | null,
    automatic: boolean,
  ): string {
    let subject: string
    let pastParticiple: string
    if (actorId === journalistId) {
      subject = 'Votre enquête'
      pastParticiple = 'annulée'
    } else if (reportingCitizenId && actorId === reportingCitizenId) {
      subject = 'Votre signalement associé'
      pastParticiple = 'annulé'
    } else {
      subject = 'Une enquête à laquelle vous avez contribué en tant que vigie'
      pastParticiple = 'annulée'
    }
    const reason = automatic
      ? 'automatiquement en raison d’un nombre excessif de tentatives de révision (risque d’attaque DoS)'
      : 'par le directeur de publication'
    return `${subject} a été ${pastParticiple} ${reason}.`
  }

  private async collectInvestigationStakeholders(
    investigation: Investigation,
    report: Report | null,
  ): Promise<Set<string>> {
    const evidenceList = await this.evidenceRepository.findByInvestigationId(
      investigation.id,
    )
    const contributingWatcherIds = Array.from(
      new Set(evidenceList.map((e) => e.watcherId)),
    )
    const stakeholderIds = new Set<string>([
      investigation.journalistId,
      ...contributingWatcherIds,
    ])
    if (report) {
      stakeholderIds.add(report.citizenId)
    }
    return stakeholderIds
  }

  private async notifyInvestigationCanceled(
    investigation: Investigation,
    report: Report | null,
    actorId: string,
    reasonCode:
      | 'MANUAL_DIRECTOR_CANCELLATION'
      | 'MAX_REVISION_ATTEMPTS_REACHED',
    reasonMessage: string,
    includeDirector: boolean,
  ): Promise<void> {
    const stakeholderIds = await this.collectInvestigationStakeholders(
      investigation,
      report,
    )
    if (includeDirector) {
      stakeholderIds.add(actorId)
    }
    const automatic = reasonCode === 'MAX_REVISION_ATTEMPTS_REACHED'
    const notifications = Array.from(stakeholderIds).map((stakeholderId) =>
      NotificationFactory.createArchivedPublicationNotification(
        stakeholderId,
        'Enquête annulée',
        this.canceledMessageForStakeholder(
          stakeholderId,
          investigation.journalistId,
          report?.citizenId ?? null,
          automatic,
        ),
        investigation.id,
      ),
    )
    if (notifications.length > 0) {
      await this.notificationRepository.saveMany(notifications)
    }
    await this.domainEventPublisher.publish(
      new InvestigationCanceledEvent(
        investigation.id,
        actorId,
        reasonCode,
        reasonMessage,
      ),
    )
  }

  private async _handleCancellationSideEffects(
    investigation: Investigation,
    directorId: string,
    reasonCode:
      | 'MANUAL_DIRECTOR_CANCELLATION'
      | 'MAX_REVISION_ATTEMPTS_REACHED',
    reasonMessage: string,
    includeDirector: boolean,
  ): Promise<void> {
    const report =
      await this.closeReportAndLinkedInboxAfterInvestigation(investigation)
    await this.finalizeJournalistInvestigationSlot(investigation)
    await this.notifyInvestigationCanceled(
      investigation,
      report,
      directorId,
      reasonCode,
      reasonMessage,
      includeDirector,
    )
  }

  private async closeReportAndLinkedInboxAfterInvestigation(
    investigation: Investigation,
  ): Promise<Report | null> {
    const subject = await this.inboxSubjectRepository.findById(
      investigation.inboxSubjectId,
    )
    if (!subject) {
      throw new NotFoundError('InboxSubject', investigation.inboxSubjectId)
    }

    // Archive the inbox subject
    if (!subject.isArchived()) {
      subject.archive()
      await this.inboxSubjectRepository.update(subject)
    }

    // If the subject comes from a report, archive the report and update the citizen
    if (subject.origin === 'REPORT' && subject.reportId) {
      const report = await this.reportRepository.findById(subject.reportId)
      if (!report) {
        throw new NotFoundError('Report', subject.reportId)
      }
      report.changeStatus('ARCHIVED')
      await this.reportRepository.save(report)

      const citizen = await this.citizenRepository.findById(report.citizenId)
      if (citizen) {
        citizen.reportResolved()
        await this.citizenRepository.update(citizen)
      }
      return report
    }

    return null
  }

  private async finalizeJournalistInvestigationSlot(
    investigation: Investigation,
  ): Promise<void> {
    const journalist = await this.journalistRepository.findById(
      investigation.journalistId,
    )
    if (!journalist) {
      throw new NotFoundError('Journalist', investigation.journalistId)
    }
    journalist.onInvestigationFinalized(investigation)
    await this.journalistRepository.update(journalist)
  }

  private async notifyJournalistAboutPublication(
    journalistId: string,
    publicationId: string,
  ): Promise<void> {
    const notification = NotificationFactory.createPublicationForJournalist(
      journalistId,
      'Publication officielle',
      'Votre enquête a été publiée.',
      publicationId,
    )
    await this.notificationRepository.save(notification)
  }

  private async broadcastPublicationToCitizens(
    publicationId: string,
  ): Promise<void> {
    const citizens = await this.citizenRepository.findAll()
    if (citizens.length === 0) return
    const notifications = NotificationFactory.createBatch(
      citizens.map((c) => c.id),
      'Une nouvelle publication officielle est disponible.',
      publicationId,
    )
    await this.notificationRepository.saveMany(notifications)
  }

  private buildPublicationEvidence(
    directorId: string,
    input: ApproveInvestigationInput,
    publicationId: string,
  ): {
    authoritySources: ReturnType<typeof AuthoritySourceFactory.create>[]
    verifiedLinks: VerifiedLink[]
    verifiedMedia: VerifiedMedia[]
  } {
    const authoritySources: ReturnType<typeof AuthoritySourceFactory.create>[] =
      []
    let nextTemporaryLinkId = -1
    let nextTemporaryMediaId = -1
    const verifiedLinks = (input.verifiedLinks ?? []).map((link) => {
      const authoritySourceId = link.authoritySource
        ? this.createPublicationAuthoritySource(
            authoritySources,
            link.authoritySource,
          )
        : undefined
      this.assertPublicationEvidenceUrl(link.url, 'verified link')
      return VerifiedLinkFactory.createForPublication(
        nextTemporaryLinkId--,
        publicationId,
        link.url,
        directorId,
        authoritySourceId,
      )
    })
    const mediaOrders = this.resolvePublicationMediaOrders(
      input.verifiedMedia ?? [],
    )
    const verifiedMedia = (input.verifiedMedia ?? []).map((media, index) => {
      const authoritySourceId = media.authoritySource
        ? this.createPublicationAuthoritySource(
            authoritySources,
            media.authoritySource,
          )
        : undefined
      this.assertPublicationEvidenceUrl(media.url, 'verified media')
      return VerifiedMediaFactory.createForPublication(
        nextTemporaryMediaId--,
        mediaOrders[index],
        publicationId,
        media.url,
        media.type,
        directorId,
        authoritySourceId,
      )
    })

    return {
      authoritySources,
      verifiedLinks,
      verifiedMedia,
    }
  }

  private createPublicationAuthoritySource(
    authoritySources: ReturnType<typeof AuthoritySourceFactory.create>[],
    input: PublicationAuthoritySourceInput,
  ): string {
    if (!input.name.trim()) {
      throw new ValidationError('Authority source name is required')
    }
    const authoritySource = AuthoritySourceFactory.create({
      name: input.name.trim(),
      type: input.type,
    })
    authoritySources.push(authoritySource)
    return authoritySource.id
  }

  private resolvePublicationMediaOrders(
    media: PublicationVerifiedMediaInput[],
  ): number[] {
    const usedOrders = new Set<number>()
    const resolvedOrders = new Array<number>(media.length)

    media.forEach((item, index) => {
      if (item.order === undefined) return
      if (!Number.isInteger(item.order) || item.order < 0) {
        throw new ValidationError(
          'Verified media order must be a non-negative integer',
        )
      }
      if (usedOrders.has(item.order)) {
        throw new ValidationError('Verified media order must be unique')
      }
      usedOrders.add(item.order)
      resolvedOrders[index] = item.order
    })

    let nextAvailableOrder = 0
    media.forEach((_, index) => {
      if (resolvedOrders[index] !== undefined) return
      while (usedOrders.has(nextAvailableOrder)) {
        nextAvailableOrder++
      }
      resolvedOrders[index] = nextAvailableOrder
      usedOrders.add(nextAvailableOrder)
      nextAvailableOrder++
    })

    return resolvedOrders
  }

  private assertPublicationEvidenceUrl(url: string, label: string): void {
    if (!url.trim()) {
      throw new ValidationError(`${label} url is required`)
    }
  }
}
