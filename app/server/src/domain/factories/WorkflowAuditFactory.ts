// domain/factories/WorkflowAuditFactory.ts
import { WorkflowAudit } from '../entities/WorkflowAudit'
import type { InvestigationStatus } from '../entities/Investigation'
import { randomUUID } from 'crypto'

export interface CreateWorkflowAuditParams {
  investigationId: string
  actorId: string
  newStatus: InvestigationStatus
  previousStatus?: InvestigationStatus | null
  comment?: string | null
}

export class WorkflowAuditFactory {
  static create(params: CreateWorkflowAuditParams): WorkflowAudit {
    return new WorkflowAudit(
      randomUUID(),
      params.investigationId,
      params.actorId,
      params.newStatus,
      params.previousStatus ?? null,
      params.comment ?? null,
    )
  }

  static createRejection(
    investigationId: string,
    directorId: string,
    previousStatus: InvestigationStatus,
    reason: string,
    newStatus: InvestigationStatus = 'NEEDS_REVISION',
  ): WorkflowAudit {
    return this.create({
      investigationId,
      actorId: directorId,
      newStatus,
      previousStatus,
      comment: reason,
    })
  }

  static createApproval(
    investigationId: string,
    directorId: string,
    previousStatus: InvestigationStatus,
  ): WorkflowAudit {
    return this.create({
      investigationId,
      actorId: directorId,
      newStatus: 'PUBLISHED',
      previousStatus,
    })
  }

  /** Journalist submits the investigation for director review */
  static createSubmissionForReview(
    investigationId: string,
    journalistId: string,
    previousStatus: InvestigationStatus,
  ): WorkflowAudit {
    return this.create({
      investigationId,
      actorId: journalistId,
      newStatus: 'PENDING_REVIEW',
      previousStatus,
    })
  }

  /** Director accepts UNVERIFIABLE: investigation archived, no official Publication */
  static createArchiveUnverifiable(
    investigationId: string,
    directorId: string,
    previousStatus: InvestigationStatus,
    comment?: string | null,
  ): WorkflowAudit {
    return this.create({
      investigationId,
      actorId: directorId,
      newStatus: 'ARCHIVED',
      previousStatus,
      comment: comment ?? null,
    })
  }

  static createCancellation(
    investigationId: string,
    directorId: string,
    previousStatus: InvestigationStatus,
    comment?: string | null,
  ): WorkflowAudit {
    return this.create({
      investigationId,
      actorId: directorId,
      newStatus: 'CANCELED',
      previousStatus,
      comment: comment ?? null,
    })
  }

  static createStatusChange(
    investigationId: string,
    actorId: string,
    newStatus: InvestigationStatus,
    previousStatus: InvestigationStatus,
  ): WorkflowAudit {
    return this.create({
      investigationId,
      actorId,
      newStatus,
      previousStatus,
    })
  }
}
