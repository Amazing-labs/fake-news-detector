// domain/entities/Investigation.ts
import { DomainError, BusinessRuleError } from '../../shared/errors'
import { MAX_REVISION_ATTEMPTS } from '../../shared/constants'

export type MediaCategory =
  | 'CONTEXT_COLLAPSE'
  | 'MANIPULATED'
  | 'FABRICATED'
  | 'SATIRE'
  | 'MISLEADING'
  | 'IMPOSTOR'
  | 'OTHER'
export type Verdict = 'TRUE' | 'FALSE' | 'MISLEADING' | 'UNVERIFIABLE'

/** Verdicts allowed for a standard official publication after director approval */
export const STANDARD_PUBLICATION_VERDICTS: readonly Verdict[] = [
  'TRUE',
  'FALSE',
  'MISLEADING',
] as const
export type InvestigationStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'PENDING_REVIEW'
  | 'NEEDS_REVISION'
  | 'PUBLISHED'
  | 'ARCHIVED'

export class Investigation {
  constructor(
    public readonly id: string,
    public inboxSubjectId: string,
    public journalistId: string,
    public mediaCategory: MediaCategory | null = null,
    public draftVerdict: Verdict = 'UNVERIFIABLE',
    public investigationNotes: string = '',
    public attemptCount: number = 0,
    public status: InvestigationStatus = 'OPEN',
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}

  isDraft(): boolean {
    return this.status === 'IN_PROGRESS' || this.status === 'NEEDS_REVISION'
  }

  isPendingReview(): boolean {
    return this.status === 'PENDING_REVIEW'
  }

  isPublished(): boolean {
    return this.status === 'PUBLISHED'
  }

  canBeEdited(): boolean {
    return (
      this.status === 'OPEN' ||
      this.status === 'IN_PROGRESS' ||
      this.status === 'NEEDS_REVISION'
    )
  }

  canMarkAsArchived(): boolean {
    return (
      this.draftVerdict === 'UNVERIFIABLE' && this.status === 'PENDING_REVIEW'
    )
  }

  // Journalist actions
  updateDraft(
    mediaCategory: MediaCategory | null,
    draftVerdict: Verdict,
    investigationNotes: string,
  ): void {
    if (!this.canBeEdited()) {
      throw new BusinessRuleError(
        'Investigation cannot be edited in current status',
      )
    }
    this.mediaCategory = mediaCategory
    this.draftVerdict = draftVerdict
    this.investigationNotes = investigationNotes
    this.updatedAt = new Date()
  }

  submitForReview(): void {
    if (!this.canBeEdited()) {
      throw new BusinessRuleError('Cannot submit investigation for review')
    }
    if (!this.mediaCategory) {
      throw new BusinessRuleError(
        'Investigation must have media category before submission',
      )
    }
    this.status = 'PENDING_REVIEW'
    this.updatedAt = new Date()
  }

  // Director rejection
  requestRevision(newStatus: InvestigationStatus): void {
    if (newStatus !== 'NEEDS_REVISION') {
      throw new BusinessRuleError('Invalid status for rejection')
    }
    if (this.status !== 'PENDING_REVIEW') {
      throw new BusinessRuleError(
        'Investigation must be pending director review to be sent back for revision',
      )
    }
    if (this.attemptCount >= MAX_REVISION_ATTEMPTS) {
      throw new DomainError('Maximum rejection attempts reached')
    }
    this.status = newStatus
    this.attemptCount++
    this.updatedAt = new Date()
  }

  // Director approval
  approve(): void {
    if (this.status !== 'PENDING_REVIEW') {
      throw new BusinessRuleError(
        'Investigation must be pending review to be approved',
      )
    }
    if (!STANDARD_PUBLICATION_VERDICTS.includes(this.draftVerdict)) {
      throw new BusinessRuleError(
        'Publication approval requires a standard verdict (TRUE, FALSE, or MISLEADING); use archive flow for UNVERIFIABLE',
      )
    }
    this.status = 'PUBLISHED'
    this.updatedAt = new Date()
  }

  // Mark as archived
  markAsArchived(): void {
    if (!this.canMarkAsArchived()) {
      throw new BusinessRuleError(
        'Investigation must be pending review with draft verdict UNVERIFIABLE to be archived by the director',
      )
    }
    this.status = 'ARCHIVED'
    this.updatedAt = new Date()
  }
}
