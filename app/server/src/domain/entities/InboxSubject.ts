// domain/entities/InboxSubject.ts

import { BusinessRuleError } from '../../shared/errors'

export type InboxSubjectStatus = 'OPEN' | 'IN_PROGRESS' | 'ARCHIVED'
export type InboxSubjectOrigin = 'REPORT' | 'DIRECTOR_INITIATED'

export class InboxSubject {
  constructor(
    public readonly id: string,
    public theme: string,
    public description: string,
    public createdById: string,
    public reportId: string | null = null,
    public status: InboxSubjectStatus = 'OPEN',
    public origin: InboxSubjectOrigin = 'REPORT',
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}

  isOpen(): boolean {
    return this.status === 'OPEN'
  }

  isArchived(): boolean {
    return this.status === 'ARCHIVED'
  }

  // Actions
  changeStatus(newStatus: InboxSubjectStatus): void {
    this.status = newStatus
    this.updatedAt = new Date()
  }

  archive(): void {
    this.status = 'ARCHIVED'
    this.updatedAt = new Date()
  }

  startProgress(): void {
    if (this.status === 'ARCHIVED') {
      throw new BusinessRuleError('Cannot start progress on archived subject')
    }
    this.status = 'IN_PROGRESS'
    this.updatedAt = new Date()
  }

  updateContent(theme: string, description: string): void {
    this.theme = theme
    this.description = description
    this.updatedAt = new Date()
  }
}
