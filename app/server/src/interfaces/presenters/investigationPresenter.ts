import type { Investigation } from '../../domain/entities/Investigation'
import type { Evidence } from '../../domain/entities/Evidence'
import type {
  InvestigationMedia,
  EvidenceMedia,
} from '../../domain/value-objects/Media'
import type {
  EnrichedEvidence,
  EnrichedInvestigation,
  EnrichedInvestigationMedia,
} from '../../application/services/FactCheckingQueryService'

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

export function presentEnrichedInvestigationMedia({
  media,
  authoritySourceName,
}: EnrichedInvestigationMedia) {
  return {
    ...presentInvestigationMedia(media),
    authoritySourceName,
  }
}

export function presentEnrichedInvestigationMediaList(
  items: EnrichedInvestigationMedia[],
) {
  return {
    items: items.map(presentEnrichedInvestigationMedia),
    total: items.length,
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

export function presentEnrichedEvidence({
  evidence,
  media,
  watcherName,
}: EnrichedEvidence) {
  return {
    ...presentEvidence(evidence),
    media: media.map(presentEvidenceMedia),
    watcherName,
  }
}

export function presentEnrichedEvidenceList(items: EnrichedEvidence[]) {
  return {
    items: items.map(presentEnrichedEvidence),
    total: items.length,
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
  subject,
  journalistName,
}: EnrichedInvestigation) {
  return {
    ...presentInvestigation(investigation),
    title,
    subject,
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
