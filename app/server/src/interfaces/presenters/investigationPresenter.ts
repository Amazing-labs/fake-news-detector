import type { Investigation } from '../../domain/entities/Investigation'

export function presentInvestigation(investigation: Investigation) {
  return {
    id: investigation.id,
    inboxSubjectId: investigation.inboxSubjectId,
    journalistId: investigation.journalistId,
    mediaCategory: investigation.mediaCategory,
    draftVerdict: investigation.draftVerdict,
    investigationNotes: investigation.investigationNotes,
    attemptCount: investigation.attemptCount,
    status: investigation.status,
    createdAt: investigation.createdAt.toISOString(),
    updatedAt: investigation.updatedAt.toISOString(),
  }
}

export function presentInvestigationList(investigations: Investigation[]) {
  return {
    items: investigations.map(presentInvestigation),
    total: investigations.length,
  }
}
