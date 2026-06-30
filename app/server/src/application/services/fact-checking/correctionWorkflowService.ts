import {
  CorrectionFactory,
  NotificationFactory,
} from '../../../domain/factories'
import type {
  ICitizenRepository,
  ICorrectionRepository,
  IDirectorRepository,
  IInvestigationRepository,
  INotificationRepository,
  IPublicationRepository,
} from '../../../domain/repositories'
import {
  BusinessRuleError,
  NotFoundError,
  ValidationError,
} from '../../../shared/errors'
import { CITIZEN_NOTIFICATION_BATCH_SIZE } from '../../../shared/constants'
import type { PublishCorrectionInput } from './types'

export class CorrectionWorkflowService {
  constructor(
    private readonly directorRepository: IDirectorRepository,
    private readonly publicationRepository: IPublicationRepository,
    private readonly correctionRepository: ICorrectionRepository,
    private readonly notificationRepository: INotificationRepository,
    private readonly citizenRepository: ICitizenRepository,
    private readonly investigationRepository: IInvestigationRepository,
  ) {}

  async publishCorrection(
    directorId: string,
    publicationId: string,
    input: PublishCorrectionInput,
  ): Promise<string> {
    const title = this.assertRequiredText(
      input.title,
      'Correction title is required',
    )
    const content = this.assertRequiredText(
      input.content,
      'Correction content is required',
    )

    const director = await this.getActiveDirectorOrThrow(directorId)
    const publication = await this.getPublicationOrThrow(publicationId)
    const investigation = await this.getInvestigationOrThrow(
      publication.investigationId,
    )

    if (!investigation.isPublished()) {
      throw new BusinessRuleError(
        'Corrections can only be published for published investigations',
      )
    }

    publication.markAsCorrection()

    const journalistNotification =
      NotificationFactory.createCorrectionNotification(
        investigation.journalistId,
        title,
        content,
        publication.id,
      )

    const correction = CorrectionFactory.createForPublication(
      publication.id,
      director.id,
      title,
      content,
      journalistNotification.id,
    )

    const citizenIds = await this.citizenRepository.findAllIds()

    await this.publicationRepository.markAsCorrected(
      publication.id,
      publication.updatedAt,
    )
    await this.notificationRepository.save(journalistNotification)
    await this.correctionRepository.save(correction)
    await this.notifyCitizensAboutCorrection(
      citizenIds,
      title,
      content,
      publication.id,
    )

    return correction.id
  }

  private async getActiveDirectorOrThrow(directorId: string) {
    const director = await this.directorRepository.findById(directorId)
    if (!director) {
      throw new NotFoundError('Director', directorId)
    }
    if (!director.isActive()) {
      throw new BusinessRuleError('Director account is not active')
    }
    return director
  }

  private async getPublicationOrThrow(publicationId: string) {
    const publication = await this.publicationRepository.findById(publicationId)
    if (!publication) {
      throw new NotFoundError('Publication', publicationId)
    }
    return publication
  }

  private async getInvestigationOrThrow(investigationId: string) {
    const investigation =
      await this.investigationRepository.findById(investigationId)
    if (!investigation) {
      throw new NotFoundError('Investigation', investigationId)
    }
    return investigation
  }

  private async notifyCitizensAboutCorrection(
    citizenIds: string[],
    title: string,
    content: string,
    publicationId: string,
  ): Promise<void> {
    for (
      let index = 0;
      index < citizenIds.length;
      index += CITIZEN_NOTIFICATION_BATCH_SIZE
    ) {
      const batch = citizenIds.slice(
        index,
        index + CITIZEN_NOTIFICATION_BATCH_SIZE,
      )
      const notifications = batch.map((citizenId) =>
        NotificationFactory.createCorrectionNotification(
          citizenId,
          title,
          content,
          publicationId,
        ),
      )
      await this.notificationRepository.saveMany(notifications)
    }
  }

  private assertRequiredText(
    value: string | null | undefined,
    message: string,
  ): string {
    const normalized = (value ?? '').trim()
    if (!normalized) {
      throw new ValidationError(message)
    }
    return normalized
  }
}
