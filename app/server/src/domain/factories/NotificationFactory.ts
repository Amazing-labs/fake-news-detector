// domain/factories/NotificationFactory.ts
import { Notification, NotificationType } from '../entities/Notification'
import { DomainError } from '../../shared/errors'

export class NotificationFactory {
  static create(params: {
    type?: NotificationType
    theme: string
    message: string
    actorId: string
    publicationId?: string
    investigationId?: string
  }): Notification {
    return Notification.create(
      params.type ?? 'ALERT',
      params.theme,
      params.message,
      params.actorId,
      params.publicationId,
      params.investigationId,
    )
  }

  static createPublicationNotification(
    citizenId: string,
    publicationTheme: string,
    publicationMessage: string,
    publicationId: string,
  ): Notification {
    return Notification.createPublicationNotification(
      citizenId,
      publicationTheme,
      publicationMessage,
      publicationId,
    )
  }

  static createInvestigationNotification(
    journalistId: string,
    theme: string,
    message: string,
  ): Notification {
    return Notification.createAlertNotification(journalistId, theme, message)
  }

  static createAlertNotification(
    actorId: string,
    theme: string,
    message: string,
  ): Notification {
    return Notification.create('ALERT', theme, message, actorId)
  }

  static createCorrectionNotification(
    actorId: string,
    correctionTitle: string,
    correctionMessage: string,
    publicationId: string,
  ): Notification {
    return Notification.createCorrectionNotification(
      actorId,
      correctionTitle,
      correctionMessage,
      publicationId,
    )
  }

  static createArchivedPublicationNotification(
    actorId: string,
    theme: string,
    message: string,
    investigationId: string,
  ): Notification {
    return Notification.createArchivedPublicationNotification(
      actorId,
      theme,
      message,
      investigationId,
    )
  }

  static createPublicationForJournalist(
    journalistId: string,
    theme: string,
    message: string,
    publicationId: string,
  ): Notification {
    return Notification.createPublicationNotification(
      journalistId,
      theme,
      message,
      publicationId,
    )
  }

  static createBatch(
    citizenIds: string[],
    message: string,
    publicationId: string,
    theme: string = 'Publication',
  ): Notification[] {
    if (!publicationId.trim()) {
      throw new DomainError(
        'Batch publication notifications require a publicationId',
      )
    }

    return citizenIds.map((citizenId) =>
      Notification.createPublicationNotification(
        citizenId,
        theme,
        message,
        publicationId,
      ),
    )
  }
}
