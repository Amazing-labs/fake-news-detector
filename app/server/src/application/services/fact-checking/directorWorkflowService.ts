import type {
  IAuthoritySourceRepository,
  ICitizenRepository,
  IDirectorRepository,
  IInboxSubjectMediaRepository,
  IInboxSubjectRepository,
  IInvestigationRepository,
  INotificationRepository,
  IPublicationRepository,
  IReportRepository,
  IWatcherApplicationRepository,
  IWorkflowAuditRepository,
} from '../../../domain/repositories'
import type { InboxSubjectMediaInsert } from '../../../domain/repositories/IInboxSubjectMediaRepository'
import { PublicationFactory } from '../../../domain/factories/PublicationFactory'
import { NotificationFactory } from '../../../domain/factories/NotificationFactory'
import { AuthoritySourceFactory } from '../../../domain/factories/AuthoritySourceFactory'
import {
  InboxSubjectDeletedEvent,
  type IDomainEventPublisher,
} from '../../../domain/events'
import {
  directorAcceptUnverifiableArchiveWithAudit,
  directorApproveInvestigationWithAudit,
  directorCancelInvestigationWithAudit,
  directorRejectInvestigationWithAudit,
} from '../../../domain/processes/investigationStatusWorkflow'
import {
  BusinessRuleError,
  NotFoundError,
  ValidationError,
} from '../../../shared/errors'
import type {
  ApproveInvestigationInput,
  CreateDirectorInboxSubjectInput,
} from './types'
import {
  buildPublicationEvidence,
  createPublicationId,
} from './publicationEvidence'
import { InvestigationLifecycleService } from './investigationLifecycleService'

export class DirectorWorkflowService {
  constructor(
    private readonly directorRepository: IDirectorRepository,
    private readonly investigationRepository: IInvestigationRepository,
    private readonly publicationRepository: IPublicationRepository,
    private readonly notificationRepository: INotificationRepository,
    private readonly workflowAuditRepository: IWorkflowAuditRepository,
    private readonly watcherApplicationRepository: IWatcherApplicationRepository,
    private readonly citizenRepository: ICitizenRepository,
    private readonly inboxSubjectRepository: IInboxSubjectRepository,
    private readonly inboxSubjectMediaRepository: IInboxSubjectMediaRepository,
    private readonly reportRepository: IReportRepository,
    private readonly authoritySourceRepository: IAuthoritySourceRepository,
    private readonly domainEventPublisher: IDomainEventPublisher,
    private readonly investigationLifecycleService: InvestigationLifecycleService,
  ) {}

  async createDirectorInboxSubject(
    directorId: string,
    input: CreateDirectorInboxSubjectInput,
  ): Promise<string> {
    const director = await this.getDirectorOrThrow(directorId)
    const subject = director.createInboxSubject(input.theme, input.description)

    await this.inboxSubjectRepository.save(subject)

    if (input.media?.length) {
      const rows: InboxSubjectMediaInsert[] = input.media.map(
        (media, index) => ({
          url: media.url,
          type: media.type,
          order: media.order ?? index,
          uploadedById: directorId,
          origin: 'DIRECTOR_INITIATED',
        }),
      )
      await this.inboxSubjectMediaRepository.saveMany(subject.id, rows)
    }

    await this.directorRepository.update(director)
    return subject.id
  }

  async approveInvestigation(
    directorId: string,
    investigationId: string,
    input: ApproveInvestigationInput = {},
  ): Promise<string> {
    const director = await this.getDirectorOrThrow(directorId)
    const investigation = await this.getInvestigationOrThrow(investigationId)

    const audit = directorApproveInvestigationWithAudit(director, investigation)
    const publicationId = createPublicationId()
    const evidenceBundle = buildPublicationEvidence(
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

    await this.persistApprovedPublicationArtifacts(
      investigation,
      director,
      publication,
      audit,
      evidenceBundle.authoritySources,
    )

    await this.investigationLifecycleService.closeReportAndLinkedInboxAfterInvestigation(
      investigation,
    )
    await this.investigationLifecycleService.finalizeJournalistInvestigationSlot(
      investigation,
    )
    await this.investigationLifecycleService.notifyJournalistAboutPublication(
      investigation.journalistId,
      publication.id,
    )
    await this.investigationLifecycleService.broadcastPublicationToCitizens(
      publication.id,
    )

    return publication.id
  }

  async rejectInvestigation(
    directorId: string,
    investigationId: string,
    reason: string,
  ): Promise<void> {
    this.assertRequiredText(reason, 'Rejection reason is required')

    const director = await this.getDirectorOrThrow(directorId)
    const investigation = await this.getInvestigationOrThrow(investigationId)
    const audit = directorRejectInvestigationWithAudit(
      director,
      investigation,
      reason,
    )

    await this.investigationRepository.update(investigation)
    await this.workflowAuditRepository.save(audit)

    if (investigation.status === 'CANCELED') {
      await this.investigationLifecycleService.handleCancellationSideEffects(
        investigation,
        director.id,
        'MAX_REVISION_ATTEMPTS_REACHED',
        "Investigation annulée en raison d'un nombre excessif de tentatives de révision (risque d'attaque DoS)",
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
    this.assertRequiredText(reason, 'Cancellation reason is required')

    const director = await this.getDirectorOrThrow(directorId)
    const investigation = await this.getInvestigationOrThrow(investigationId)
    const audit = directorCancelInvestigationWithAudit(
      director,
      investigation,
      reason,
    )

    await this.investigationRepository.update(investigation)
    await this.workflowAuditRepository.save(audit)
    await this.investigationLifecycleService.handleCancellationSideEffects(
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
    this.assertRequiredText(reason, 'Deletion reason is required')

    const director = await this.getDirectorOrThrow(directorId)
    const subject = await this.getInboxSubjectOrThrow(inboxSubjectId)
    const linkedInvestigation =
      await this.investigationRepository.findByInboxSubjectId(inboxSubjectId)
    if (linkedInvestigation) {
      throw new BusinessRuleError(
        'InboxSubject cannot be deleted after an investigation has started',
      )
    }

    const subjectOrigin = subject.origin
    let reportCitizenId: string | null = null
    if (subjectOrigin === 'REPORT' && subject.reportId) {
      const subjectReportId = subject.reportId
      const report = await this.reportRepository.findById(subjectReportId)
      if (!report) throw new NotFoundError('Report', subjectReportId)

      const reportId = report.id
      const citizenId = report.citizenId
      const citizen = await this.citizenRepository.findById(citizenId)
      if (citizen) {
        citizen.reportResolved()
        await this.citizenRepository.update(citizen)
        reportCitizenId = citizenId
      }

      await this.reportRepository.delete(reportId)
    }

    await this.inboxSubjectRepository.delete(subject.id)

    if (subjectOrigin === 'REPORT' && reportCitizenId) {
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
    const director = await this.getDirectorOrThrow(directorId)
    const investigation = await this.getInvestigationOrThrow(investigationId)
    const audit = directorAcceptUnverifiableArchiveWithAudit(
      director,
      investigation,
      comment,
    )

    await this.investigationRepository.update(investigation)
    await this.workflowAuditRepository.save(audit)

    const report =
      await this.investigationLifecycleService.closeReportAndLinkedInboxAfterInvestigation(
        investigation,
      )
    await this.investigationLifecycleService.finalizeJournalistInvestigationSlot(
      investigation,
    )
    await this.investigationLifecycleService.notifyArchiveAccepted(
      investigation,
      report,
    )
  }

  async approveWatcherApplication(
    directorId: string,
    applicationId: string,
  ): Promise<void> {
    const director = await this.getDirectorOrThrow(directorId)
    const application = await this.getWatcherApplicationOrThrow(applicationId)
    const citizen = await this.getCitizenOrThrow(application.actorId)

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
    const director = await this.getDirectorOrThrow(directorId)
    const application = await this.getWatcherApplicationOrThrow(applicationId)

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

  private async persistApprovedPublicationArtifacts(
    investigation: Awaited<ReturnType<IInvestigationRepository['findById']>>,
    director: Awaited<ReturnType<IDirectorRepository['findById']>>,
    publication: ReturnType<typeof PublicationFactory.createPublication>,
    audit: ReturnType<typeof directorApproveInvestigationWithAudit>,
    authoritySources: ReturnType<typeof AuthoritySourceFactory.create>[],
  ): Promise<void> {
    if (!investigation) {
      throw new ValidationError(
        'Investigation is required before publication persistence',
      )
    }
    await this.investigationRepository.update(investigation)
    if (director) {
      await this.directorRepository.update(director)
    }
    await this.authoritySourceRepository.saveMany(authoritySources)
    await this.publicationRepository.save(publication)
    await this.workflowAuditRepository.save(audit)
  }

  private async getDirectorOrThrow(directorId: string) {
    const director = await this.directorRepository.findById(directorId)
    if (!director) throw new NotFoundError('Director', directorId)
    return director
  }

  private async getCitizenOrThrow(citizenId: string) {
    const citizen = await this.citizenRepository.findById(citizenId)
    if (!citizen) throw new NotFoundError('Citizen', citizenId)
    return citizen
  }

  private async getInvestigationOrThrow(investigationId: string) {
    const investigation =
      await this.investigationRepository.findById(investigationId)
    if (!investigation) {
      throw new NotFoundError('Investigation', investigationId)
    }
    return investigation
  }

  private async getInboxSubjectOrThrow(inboxSubjectId: string) {
    const subject = await this.inboxSubjectRepository.findById(inboxSubjectId)
    if (!subject) throw new NotFoundError('InboxSubject', inboxSubjectId)
    return subject
  }

  private async getWatcherApplicationOrThrow(applicationId: string) {
    const application =
      await this.watcherApplicationRepository.findWatcherApplicationById(
        applicationId,
      )
    if (!application) {
      throw new NotFoundError('WatcherApplication', applicationId)
    }
    return application
  }

  private assertRequiredText(value: string, message: string): void {
    if (!value.trim()) {
      throw new ValidationError(message)
    }
  }
}
