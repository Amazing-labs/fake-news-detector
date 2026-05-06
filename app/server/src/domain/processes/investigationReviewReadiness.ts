// domain/processes/investigationReviewReadiness.ts
// Pure validation: investigation + media ready for director review.

import { Investigation } from '../entities/Investigation'
import type { Evidence } from '../entities/Evidence'
import type { EvidenceMedia, InvestigationMedia } from '../value-objects/Media'
import { BusinessRuleError } from '../../shared/errors'

export function assertInvestigationReadyForDirectorReview(
  investigation: Investigation,
  investigationMedia: InvestigationMedia[],
): void {
  const hasSourceMedia = investigationMedia.some((m) =>
    m.requiresJournalistClassification(),
  )
  if (hasSourceMedia && !investigation.mediaCategory) {
    throw new BusinessRuleError(
      'Investigation mediaCategory is required when citizen or director-inbox source media exist',
    )
  }

  for (const m of investigationMedia) {
    if (m.requiresJournalistClassification()) {
      if (!m.category) {
        throw new BusinessRuleError(
          'Each source investigation medium must have a category before review',
        )
      }
      if (!m.reliability) {
        throw new BusinessRuleError(
          'Each source investigation medium must have a reliability verdict before review',
        )
      }
      if (!m.justification?.trim()) {
        throw new BusinessRuleError(
          'Each source investigation medium must have a justification before review',
        )
      }
    }
    if (m.isFromJournalistProof()) {
      if (!m.authoritySourceId?.trim()) {
        throw new BusinessRuleError(
          'Each journalist proof medium must reference an authority source before review',
        )
      }
      if (m.category || m.reliability || m.justification) {
        throw new BusinessRuleError(
          'Journalist proof media cannot carry category, reliability, or justification',
        )
      }
    }
  }
}

export type EvidenceWithMedia = { evidence: Evidence; media: EvidenceMedia[] }

export function assertWatcherEvidenceMediaCompleteForReview(
  bundles: EvidenceWithMedia[],
): void {
  for (const { evidence, media } of bundles) {
    if (media.length === 0) {
      throw new BusinessRuleError(
        `Evidence ${evidence.id} must include at least one media item before review`,
      )
    }
    for (const row of media) {
      if (!row.category) {
        throw new BusinessRuleError(
          'Watcher evidence media must have category set by the journalist before review',
        )
      }
      if (!row.reliability) {
        throw new BusinessRuleError(
          'Watcher evidence media must have reliability set by the journalist before review',
        )
      }
      if (!row.justification?.trim()) {
        throw new BusinessRuleError(
          'Watcher evidence media must have justification set by the journalist before review',
        )
      }
    }
  }
}
