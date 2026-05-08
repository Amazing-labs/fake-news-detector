import type {
  ICitizenRepository,
  IEvidenceRepository,
  IInvestigationRepository,
  INotificationRepository,
  IReportMediaRepository,
  IReportRepository,
  IWatcherApplicationRepository,
} from '../../../domain/repositories'
import type { ReportMediaInsert } from '../../../domain/repositories/IReportMediaRepository'
import { EvidenceFactory } from '../../../domain/factories/EvidenceFactory'
import { NotificationFactory } from '../../../domain/factories/NotificationFactory'
import { ReportFactory } from '../../../domain/factories/ReportFactory'
import { WatcherApplicationFactory } from '../../../domain/factories/WatcherApplicationFactory'
import {
  BusinessRuleError,
  NotFoundError,
  ValidationError,
} from '../../../shared/errors'
import type { SubmitReportInput, SubmitWatcherEvidenceInput } from './types'

export class CitizenWorkflowService {
  constructor(
    private readonly citizenRepository: ICitizenRepository,
    private readonly reportRepository: IReportRepository,
    private readonly reportMediaRepository: IReportMediaRepository,
    private readonly investigationRepository: IInvestigationRepository,
    private readonly evidenceRepository: IEvidenceRepository,
    private readonly notificationRepository: INotificationRepository,
    private readonly watcherApplicationRepository: IWatcherApplicationRepository,
  ) {}

  async submitReport(input: SubmitReportInput): Promise<string> {
    const citizen = await this.getCitizenOrThrow(input.citizenId)
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
      const rows: ReportMediaInsert[] = input.media.map((media, index) => ({
        url: media.url,
        type: media.type,
        order: media.order ?? index,
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
    this.assertRequiredText(motivation, 'Motivation is required')

    const citizen = await this.getCitizenOrThrow(citizenId)
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

    const citizen = await this.getCitizenOrThrow(input.citizenId)
    if (!citizen.canSubmitEvidence()) {
      throw new BusinessRuleError('Only active watchers can submit evidence')
    }

    const investigation = await this.getInvestigationOrThrow(
      input.investigationId,
    )
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

  private assertRequiredText(value: string, message: string): void {
    if (!value.trim()) {
      throw new ValidationError(message)
    }
  }
}
