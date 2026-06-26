import type { Investigation } from '../../domain/entities/Investigation'
import type { Evidence } from '../../domain/entities/Evidence'
import type {
  InvestigationMedia,
  EvidenceMedia,
} from '../../domain/value-objects/Media'
import type { EnrichedInvestigation } from '../../application/services/FactCheckingQueryService'

export function presentInvestigationMedia(media: InvestigationMedia) {
  return {
    id: media.id,
    url: media.url,
    type: media.type,
    order: media.order,
    origin: media.origin,
    investigationId: media.investigationId,
    uploadedById: media.uploadedById,
    category: media.category ?? null,
    reliability: media.reliability ?? null,
    justification: media.justification ?? null,
    authoritySourceId: media.authoritySourceId ?? null,
    createdAt: media.createdAt.toISOString(),
    updatedAt: media.updatedAt.toISOString(),
  }
}

export function presentEvidenceMedia(media: EvidenceMedia) {
  return {
    id: media.id,
    url: media.url,
    type: media.type,
    order: media.order,
    evidenceId: media.evidenceId,
    uploadedById: media.uploadedById,
    category: media.category ?? null,
    reliability: media.reliability ?? null,
    justification: media.justification ?? null,
    createdAt: media.createdAt.toISOString(),
    updatedAt: media.updatedAt.toISOString(),
  }
}

export function presentEvidence(evidence: Evidence) {
  return {
    id: evidence.id,
    title: evidence.title,
    content: evidence.content,
    investigationId: evidence.investigationId,
    watcherId: evidence.watcherId,
    media: evidence.media.map(presentEvidenceMedia),
    createdAt: evidence.createdAt.toISOString(),
    updatedAt: evidence.updatedAt.toISOString(),
  }
}

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

export function presentEnrichedInvestigation({
  investigation,
  title,
  journalistName,
}: EnrichedInvestigation) {
  return {
    ...presentInvestigation(investigation),
    title,
    journalistName,
  }
}

export function presentEnrichedInvestigationList(
  items: EnrichedInvestigation[],
) {
  return {
    items: items.map(presentEnrichedInvestigation),
    total: items.length,
  }
}
