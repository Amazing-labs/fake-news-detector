// domain/processes/investigationStatusWorkflow.ts
// Orchestrates investigation status transitions and WorkflowAudit records (director ↔ journalist).

import { Director } from '../entities/Director'
import { Journalist } from '../entities/Journalist'
import { Investigation } from '../entities/Investigation'
import { InvestigationMedia } from '../value-objects'
import { WorkflowAudit } from '../entities/WorkflowAudit'
import { WorkflowAuditFactory } from '../factories/WorkflowAuditFactory'

import {
  assertInvestigationReadyForDirectorReview,
  assertWatcherEvidenceMediaCompleteForReview,
  type EvidenceWithMedia,
} from './investigationReviewReadiness'

export function submitInvestigationForReviewWithAudit(
  journalist: Journalist,
  investigation: Investigation,
  investigationMedia: InvestigationMedia[],
  evidenceBundles: EvidenceWithMedia[],
): WorkflowAudit {
  assertInvestigationReadyForDirectorReview(investigation, investigationMedia)
  assertWatcherEvidenceMediaCompleteForReview(evidenceBundles)
  const previousStatus = investigation.status
  journalist.submitForReview(investigation)
  return WorkflowAuditFactory.createSubmissionForReview(
    investigation.id,
    journalist.id,
    previousStatus,
  )
}

export function directorApproveInvestigationWithAudit(
  director: Director,
  investigation: Investigation,
): WorkflowAudit {
  const previousStatus = investigation.status
  director.publishInvestigation(investigation)
  return WorkflowAuditFactory.createApproval(
    investigation.id,
    director.id,
    previousStatus,
  )
}

export function directorRejectInvestigationWithAudit(
  director: Director,
  investigation: Investigation,
  reason: string,
): WorkflowAudit {
  const previousStatus = investigation.status
  director.rejectInvestigation(investigation)
  return WorkflowAuditFactory.createRejection(
    investigation.id,
    director.id,
    previousStatus,
    reason,
  )
}

export function directorAcceptUnverifiableArchiveWithAudit(
  director: Director,
  investigation: Investigation,
  comment?: string | null,
): WorkflowAudit {
  const previousStatus = investigation.status
  director.markAsArchived(investigation)
  return WorkflowAuditFactory.createArchiveUnverifiable(
    investigation.id,
    director.id,
    previousStatus,
    comment,
  )
}
