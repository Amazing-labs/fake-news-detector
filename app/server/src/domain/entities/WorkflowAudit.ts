// domain/entities/WorkflowAudit.ts

import { InvestigationStatus } from './Investigation'

export class WorkflowAudit {
  constructor(
    public readonly id: string,
    public investigationId: string,
    public actorId: string,
    public newStatus: InvestigationStatus,
    public previousStatus: InvestigationStatus | null = null,
    public comment: string | null = null,
    public readonly createdAt: Date = new Date(),
  ) {}

  isRejection(): boolean {
    return this.newStatus === 'NEEDS_REVISION'
  }

  isApproval(): boolean {
    return this.newStatus === 'PUBLISHED'
  }

  isArchived(): boolean {
    return this.newStatus === 'ARCHIVED'
  }

  isCanceled(): boolean {
    return this.newStatus === 'CANCELED'
  }

  getDescription(): string {
    if (this.comment) {
      return `Status changed from ${this.previousStatus} to ${this.newStatus}: ${this.comment}`
    }
    return `Status changed from ${this.previousStatus} to ${this.newStatus}`
  }
}
