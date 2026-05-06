// domain/entities/Director.ts
// Bounded Context: Editorial Management

import { Investigation, InvestigationStatus } from './Investigation'
import { InboxSubject } from './InboxSubject'
import { Citizen, CitizenStatusReason } from './Citizen'
import { Journalist, JournalistStatusReason } from './Journalist'
import { WatcherApplication } from './WatcherApplication'
import { DomainError, BusinessRuleError } from '../../shared/errors'
import { ActorStatus, ActorRole } from '../../shared/types'

export type DirectorStatus = ActorStatus
export type DirectorRole = ActorRole

export class Director {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public status: DirectorStatus = 'ACTIVE',
    public role: DirectorRole = 'EDITORIAL_DIRECTOR',
    public lastInboxRead: Date = new Date(),
    public scoreInvestigation: number = 0,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}

  // Status checks
  isActive(): boolean {
    return this.status === 'ACTIVE'
  }

  // Incremente score of investigation
  incrementScoreInvestigation(point: number = 1): void {
    this.scoreInvestigation += point
  }

  // Investigation validation
  validateInvestigation(investigation: Investigation): void {
    if (!this.isActive()) {
      throw new BusinessRuleError('Director account is not active')
    }
    if (!investigation.isPendingReview()) {
      throw new DomainError(
        'Investigation must be pending review to be validated',
      )
    }
  }

  rejectInvestigation(
    investigation: Investigation,
    newStatus: InvestigationStatus = 'NEEDS_REVISION',
  ): void {
    if (!this.isActive()) {
      throw new BusinessRuleError('Director account is not active')
    }
    this.validateInvestigation(investigation)
    investigation.requestRevision(newStatus)
  }

  publishInvestigation(investigation: Investigation): void {
    if (!this.isActive()) {
      throw new BusinessRuleError('Director account is not active')
    }
    this.validateInvestigation(investigation)
    this.incrementScoreInvestigation()
    investigation.approve()
  }

  markAsArchived(investigation: Investigation): void {
    if (!this.isActive()) {
      throw new BusinessRuleError('Director account is not active')
    }
    this.validateInvestigation(investigation)
    investigation.markAsArchived()
  }

  // Watcher applications
  approveWatcherApplication(application: WatcherApplication): void {
    if (!this.isActive()) {
      throw new BusinessRuleError('Director account is not active')
    }
    application.approve()
  }

  rejectWatcherApplication(application: WatcherApplication): void {
    if (!this.isActive()) {
      throw new BusinessRuleError('Director account is not active')
    }
    application.reject()
  }

  // User management
  banCitizen(
    citizen: Citizen,
    reason: CitizenStatusReason,
    details?: string,
  ): void {
    if (!this.isActive()) {
      throw new BusinessRuleError('Director account is not active')
    }
    citizen.ban(reason, details)
  }

  disableCitizen(
    citizen: Citizen,
    reason: CitizenStatusReason,
    details?: string,
  ): void {
    if (!this.isActive()) {
      throw new BusinessRuleError('Director account is not active')
    }
    citizen.disable(reason, details)
  }

  activateCitizen(citizen: Citizen): void {
    if (!this.isActive()) {
      throw new BusinessRuleError('Director account is not active')
    }
    citizen.activate()
  }

  banJournalist(
    journalist: Journalist,
    reason: JournalistStatusReason,
    details?: string,
  ): void {
    if (!this.isActive()) {
      throw new BusinessRuleError('Director account is not active')
    }
    journalist.ban(reason, details)
  }

  disableJournalist(
    journalist: Journalist,
    reason: JournalistStatusReason,
    details?: string,
  ): void {
    if (!this.isActive()) {
      throw new BusinessRuleError('Director account is not active')
    }
    journalist.disable(reason, details)
  }

  activateJournalist(journalist: Journalist): void {
    if (!this.isActive()) {
      throw new BusinessRuleError('Director account is not active')
    }
    journalist.activate()
  }

  // Inbox management
  createInboxSubject(theme: string, description: string): InboxSubject {
    if (!this.isActive()) {
      throw new BusinessRuleError('Director account is not active')
    }
    this.incrementScoreInvestigation()
    this.updatedAt = new Date()
    return new InboxSubject(
      crypto.randomUUID(),
      theme,
      description,
      this.id,
      null,
      'OPEN',
      'DIRECTOR_INITIATED',
    )
  }

  archiveInboxSubject(subject: InboxSubject): void {
    if (!this.isActive()) {
      throw new BusinessRuleError('Director account is not active')
    }
    this.incrementScoreInvestigation()
    subject.archive()
    this.updatedAt = new Date()
  }

  markInboxAsRead(): void {
    this.lastInboxRead = new Date()
    this.updatedAt = new Date()
  }

  // Admin actions on self
  disable(): void {
    this.status = 'DISABLED'
    this.updatedAt = new Date()
  }

  activate(): void {
    this.status = 'ACTIVE'
    this.updatedAt = new Date()
  }
}
