// domain/entities/Notification.ts

import { randomUUID } from 'crypto'
import { DomainError } from '../../shared'

export type NotificationType =
  | 'PUBLICATION'
  | 'CORRECTION'
  | 'ALERT'
  | 'ARCHIVED_PUBLICATION'

export class Notification {
  constructor(
    public readonly id: string,
    public type: NotificationType = 'ALERT',
    public theme: string,
    public message: string,
    public actorId: string,
    public isRead: boolean = false,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public publicationId?: string,
    public investigationId?: string,
  ) {}

  markAsRead(): void {
    this.isRead = true
    this.updatedAt = new Date()
  }

  markAsUnread(): void {
    this.isRead = false
    this.updatedAt = new Date()
  }

  isPublicationNotification(): boolean {
    return this.type === 'PUBLICATION'
  }

  isCorrectionNotification(): boolean {
    return this.type === 'CORRECTION'
  }

  isAlertNotification(): boolean {
    return this.type === 'ALERT'
  }

  isArchivedPublicationNotification(): boolean {
    return this.type === 'ARCHIVED_PUBLICATION'
  }

  static create(
    type: NotificationType,
    theme: string,
    message: string,
    actorId: string,
    publicationId?: string,
    investigationId?: string,
  ): Notification {
    const normalizedPublicationId = publicationId?.trim() || undefined
    const normalizedInvestigationId = investigationId?.trim() || undefined

    if (
      (type === 'PUBLICATION' || type === 'CORRECTION') &&
      !normalizedPublicationId
    ) {
      throw new DomainError(`${type} notification requires a publicationId`)
    }

    if (type === 'ARCHIVED_PUBLICATION') {
      if (!normalizedInvestigationId) {
        throw new DomainError(
          'ARCHIVED_PUBLICATION notification requires investigationId',
        )
      }
      if (normalizedPublicationId) {
        throw new DomainError(
          'ARCHIVED_PUBLICATION notification cannot have a publicationId',
        )
      }
    } else if (normalizedInvestigationId) {
      throw new DomainError(
        `investigationId is only allowed when type is ARCHIVED_PUBLICATION, not ${type}`,
      )
    }

    switch (type) {
      case 'PUBLICATION':
        return new Notification(
          randomUUID(),
          type,
          theme,
          message,
          actorId,
          false,
          new Date(),
          new Date(),
          normalizedPublicationId,
          undefined,
        )
      case 'CORRECTION':
        return new Notification(
          randomUUID(),
          type,
          theme,
          message,
          actorId,
          false,
          new Date(),
          new Date(),
          normalizedPublicationId,
          undefined,
        )
      case 'ALERT':
        return new Notification(
          randomUUID(),
          type,
          theme,
          message,
          actorId,
          false,
          new Date(),
          new Date(),
          normalizedPublicationId,
          undefined,
        )
      case 'ARCHIVED_PUBLICATION':
        return new Notification(
          randomUUID(),
          type,
          theme,
          message,
          actorId,
          false,
          new Date(),
          new Date(),
          undefined,
          normalizedInvestigationId,
        )
      default:
        throw new DomainError('Invalid notification type')
    }
  }

  static createPublicationNotification(
    citizenId: string,
    publicationTheme: string,
    publicationMessage: string,
    publicationId: string,
  ): Notification {
    return this.create(
      'PUBLICATION',
      publicationTheme,
      publicationMessage,
      citizenId,
      publicationId,
    )
  }

  static createCorrectionNotification(
    actorId: string,
    correctionTitle: string,
    correctionMessage: string,
    publicationId: string,
  ): Notification {
    return this.create(
      'CORRECTION',
      correctionTitle,
      correctionMessage,
      actorId,
      publicationId,
    )
  }

  static createAlertNotification(
    journalistId: string,
    theme: string,
    message: string,
  ): Notification {
    return this.create('ALERT', theme, message, journalistId)
  }

  static createArchivedPublicationNotification(
    actorId: string,
    theme: string,
    message: string,
    investigationId: string,
  ): Notification {
    return this.create(
      'ARCHIVED_PUBLICATION',
      theme,
      message,
      actorId,
      undefined,
      investigationId,
    )
  }
}
