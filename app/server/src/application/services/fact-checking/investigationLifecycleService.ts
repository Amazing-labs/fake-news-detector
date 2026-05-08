import type {
  ICitizenRepository,
  IEvidenceRepository,
  IInboxSubjectRepository,
  IJournalistRepository,
  INotificationRepository,
  IReportRepository,
} from '../../../domain/repositories'
import { NotificationFactory } from '../../../domain/factories/NotificationFactory'
import {
  InvestigationCanceledEvent,
  type IDomainEventPublisher,
} from '../../../domain/events'
import { Investigation } from '../../../domain/entities/Investigation'
import { Report } from '../../../domain/entities/Report'
import { NotFoundError } from '../../../shared/errors'
import {
  archivedUnverifiableMessageForStakeholder,
  canceledMessageForStakeholder,
} from './stakeholderMessages'

type CancellationReasonCode =
  | 'MANUAL_DIRECTOR_CANCELLATION'
  | 'MAX_REVISION_ATTEMPTS_REACHED'

export class InvestigationLifecycleService {
  constructor(
    private readonly reportRepository: IReportRepository,
    private readonly inboxSubjectRepository: IInboxSubjectRepository,
    private readonly citizenRepository: ICitizenRepository,
    private readonly journalistRepository: IJournalistRepository,
    private readonly evidenceRepository: IEvidenceRepository,
    private readonly notificationRepository: INotificationRepository,
    private readonly domainEventPublisher: IDomainEventPublisher,
  ) {}

  async closeReportAndLinkedInboxAfterInvestigation(
    investigation: Investigation,
  ): Promise<Report | null> {
    const subject = await this.inboxSubjectRepository.findById(
      investigation.inboxSubjectId,
    )
    if (!subject) {
      throw new NotFoundError('InboxSubject', investigation.inboxSubjectId)
    }

    if (!subject.isArchived()) {
      subject.archive()
      await this.inboxSubjectRepository.update(subject)
    }

    if (subject.origin !== 'REPORT' || !subject.reportId) {
      return null
    }

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

  async finalizeJournalistInvestigationSlot(
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

  async notifyJournalistAboutPublication(
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

  async broadcastPublicationToCitizens(publicationId: string): Promise<void> {
    const citizens = await this.citizenRepository.findAll()
    if (citizens.length === 0) return

    const notifications = NotificationFactory.createBatch(
      citizens.map((citizen) => citizen.id),
      'Une nouvelle publication officielle est disponible.',
      publicationId,
    )
    await this.notificationRepository.saveMany(notifications)
  }

  async notifyArchiveAccepted(
    investigation: Investigation,
    report: Report | null,
  ): Promise<void> {
    const stakeholderIds = await this.collectInvestigationStakeholders(
      investigation,
      report,
    )
    const notifications = Array.from(stakeholderIds).map((actorId) =>
      NotificationFactory.createArchivedPublicationNotification(
        actorId,
        'Enquête archivée',
        archivedUnverifiableMessageForStakeholder(
          actorId,
          investigation.journalistId,
          report?.citizenId ?? null,
        ),
        investigation.id,
      ),
    )

    if (notifications.length > 0) {
      await this.notificationRepository.saveMany(notifications)
    }
  }

  async handleCancellationSideEffects(
    investigation: Investigation,
    actorId: string,
    reasonCode: CancellationReasonCode,
    reasonMessage: string,
    includeActor: boolean,
  ): Promise<void> {
    const report =
      await this.closeReportAndLinkedInboxAfterInvestigation(investigation)
    await this.finalizeJournalistInvestigationSlot(investigation)

    const stakeholderIds = await this.collectInvestigationStakeholders(
      investigation,
      report,
    )
    if (includeActor) {
      stakeholderIds.add(actorId)
    }

    const automatic = reasonCode === 'MAX_REVISION_ATTEMPTS_REACHED'
    const notifications = Array.from(stakeholderIds).map((stakeholderId) =>
      NotificationFactory.createArchivedPublicationNotification(
        stakeholderId,
        'Enquête annulée',
        canceledMessageForStakeholder(
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

  private async collectInvestigationStakeholders(
    investigation: Investigation,
    report: Report | null,
  ): Promise<Set<string>> {
    const evidenceList = await this.evidenceRepository.findByInvestigationId(
      investigation.id,
    )
    const contributingWatcherIds = Array.from(
      new Set(evidenceList.map((evidence) => evidence.watcherId)),
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
}
