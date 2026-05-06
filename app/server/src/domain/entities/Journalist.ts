// domain/entities/Journalist.ts
// Bounded Context: Investigation Management

import { Investigation, MediaCategory, Verdict } from './Investigation'
import { InboxSubject } from './InboxSubject'
import { BusinessRuleError, DomainError } from '../../shared/errors'
import {
  MAX_CORRECTION_ATTEMPTS,
  MAX_INVESTIGATIONS_PER_JOURNALIST_AT_A_TIME,
} from '../../shared'
import { StatusReason, ActorStatus, ActorRole } from '../../shared/types'

export type JournalistRole = ActorRole
export type JournalistStatus = ActorStatus
export type JournalistStatusReason = StatusReason

export class Journalist {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public role: JournalistRole = 'JOURNALIST',
    public status: JournalistStatus = 'ACTIVE',
    public engagementScore: number = 0,
    public lastInboxRead: Date = new Date(),
    public activeInvestigationsCount: number = 0,
    public readonly maxActiveInvestigations: number = MAX_INVESTIGATIONS_PER_JOURNALIST_AT_A_TIME,
    public statusReason: JournalistStatusReason | null = null,
    public statusReasonDetails: string | null = null,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}

  // Status checks
  isActive(): boolean {
    return this.status === 'ACTIVE'
  }

  canLogin(): boolean {
    return this.status !== 'BANNED'
  }

  // Capabilities
  canAnalyze(): boolean {
    return (
      this.isActive() &&
      this.activeInvestigationsCount < this.maxActiveInvestigations
    )
  }

  canPickReport(): boolean {
    return this.canAnalyze()
  }

  // Business actions
  pickInboxSubject(subject: InboxSubject): Investigation {
    if (!this.canPickReport()) {
      throw new BusinessRuleError(
        'Cannot pick inbox subject: maximum active investigations reached',
      )
    }
    if (!subject.isOpen()) {
      throw new BusinessRuleError('Inbox subject is not available for picking')
    }
    if (subject.isArchived()) {
      throw new BusinessRuleError('Inbox subject is archived')
    }

    this.activeInvestigationsCount++
    this.incrementEngagementScore()
    this.updatedAt = new Date()

    subject.startProgress()

    return new Investigation(
      crypto.randomUUID(),
      subject.id,
      this.id,
      null,
      'UNVERIFIABLE',
      '',
      0,
      'OPEN',
    )
  }

  submitInvestigationDraft(
    investigation: Investigation,
    mediaCategory: MediaCategory | null,
    draftVerdict: Verdict,
    investigationNotes: string,
  ): void {
    if (investigation.journalistId !== this.id) {
      throw new BusinessRuleError(
        'Cannot submit: investigation belongs to another journalist',
      )
    }
    investigation.updateDraft(mediaCategory, draftVerdict, investigationNotes)
  }

  submitForReview(investigation: Investigation): void {
    if (investigation.journalistId !== this.id) {
      throw new BusinessRuleError(
        'Cannot submit: investigation belongs to another journalist',
      )
    }
    investigation.submitForReview()
  }

  correctInvestigation(investigation: Investigation, notes: string): void {
    if (investigation.journalistId !== this.id) {
      throw new BusinessRuleError(
        'Cannot correct: investigation belongs to another journalist',
      )
    }
    if (investigation.attemptCount >= MAX_CORRECTION_ATTEMPTS) {
      throw new DomainError('Maximum correction attempts reached')
    }
    investigation.updateDraft(
      investigation.mediaCategory,
      investigation.draftVerdict,
      notes,
    )
  }

  onInvestigationPublished(investigation: Investigation): void {
    if (
      investigation.journalistId === this.id &&
      this.activeInvestigationsCount > 0 &&
      (investigation.status === 'PUBLISHED' ||
        investigation.status === 'ARCHIVED')
    ) {
      this.activeInvestigationsCount--
      this.incrementEngagementScore(2)
      this.updatedAt = new Date()
    }
  }

  incrementEngagementScore(points: number = 1): void {
    this.engagementScore += points
    this.updatedAt = new Date()
  }

  markInboxAsRead(): void {
    this.lastInboxRead = new Date()
    this.updatedAt = new Date()
  }

  // Admin actions
  ban(reason: StatusReason, details?: string): void {
    this.status = 'BANNED'
    this.statusReason = reason
    this.statusReasonDetails = details ?? null
    this.updatedAt = new Date()
  }

  disable(reason: StatusReason, details?: string): void {
    this.status = 'DISABLED'
    this.statusReason = reason
    this.statusReasonDetails = details ?? null
    this.updatedAt = new Date()
  }

  activate(): void {
    this.status = 'ACTIVE'
    this.statusReason = null
    this.statusReasonDetails = null
    this.updatedAt = new Date()
  }

  getStatusHistory() {
    return {
      status: this.status,
      reason: this.statusReason,
      details: this.statusReasonDetails,
      updatedAt: this.updatedAt,
    }
  }

  // Getters
  getProfile() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      lastInboxRead: this.lastInboxRead,
      role: this.role,
      activeInvestigations: this.activeInvestigationsCount,
      engagementScore: this.engagementScore,
    }
  }
}
