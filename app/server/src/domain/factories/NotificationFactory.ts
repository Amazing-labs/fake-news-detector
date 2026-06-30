// domain/factories/NotificationFactory.ts
import {
  Notification,
  NotificationLevel,
  NotificationType,
} from '../entities/Notification'
import { DomainError } from '../../shared/errors'

export class NotificationFactory {
  static create(params: {
    type?: NotificationType
    theme: string
    message: string
    actorId: string
    publicationId?: string
    investigationId?: string
    level?: NotificationLevel
  }): Notification {
    return Notification.create(
      params.type ?? 'ALERT',
      params.theme,
      params.message,
      params.actorId,
      params.publicationId,
      params.investigationId,
      params.level ?? 'INFO',
    )
  }

  static createPublicationNotification(
    citizenId: string,
    publicationTheme: string,
    publicationMessage: string,
    publicationId: string,
    level: NotificationLevel = 'INFO',
  ): Notification {
    return Notification.createPublicationNotification(
      citizenId,
      publicationTheme,
      publicationMessage,
      publicationId,
      level,
    )
  }

  static createInvestigationNotification(
    journalistId: string,
    theme: string,
    message: string,
    level: NotificationLevel = 'INFO',
  ): Notification {
    return Notification.createAlertNotification(
      journalistId,
      theme,
      message,
      level,
    )
  }

  static createAlertNotification(
    actorId: string,
    theme: string,
    message: string,
    level: NotificationLevel = 'WARNING',
  ): Notification {
    return Notification.createAlertNotification(actorId, theme, message, level)
  }

  static createCorrectionNotification(
    actorId: string,
    correctionTitle: string,
    correctionMessage: string,
    publicationId: string,
    level: NotificationLevel = 'INFO',
  ): Notification {
    return Notification.createCorrectionNotification(
      actorId,
      correctionTitle,
      correctionMessage,
      publicationId,
      level,
    )
  }

  static createArchivedPublicationNotification(
    actorId: string,
    theme: string,
    message: string,
    investigationId: string,
    level: NotificationLevel = 'INFO',
  ): Notification {
    return Notification.createArchivedPublicationNotification(
      actorId,
      theme,
      message,
      investigationId,
      level,
    )
  }

  static createPublicationForJournalist(
    journalistId: string,
    theme: string,
    message: string,
    publicationId: string,
    level: NotificationLevel = 'SUCCESS',
  ): Notification {
    return Notification.createPublicationNotification(
      journalistId,
      theme,
      message,
      publicationId,
      level,
    )
  }

  static createBatch(
    citizenIds: string[],
    message: string,
    publicationId: string,
    theme: string = 'Publication',
    level: NotificationLevel = 'INFO',
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
        level,
      ),
    )
  }
}
