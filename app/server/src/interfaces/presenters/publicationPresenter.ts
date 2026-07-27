import type { Publication } from '../../domain/entities/Publication'
import type { Correction } from '../../domain/entities/Correction'
import type {
  EnrichedEvidence,
  EnrichedInvestigationMedia,
  EnrichedPublication,
  PublicationDossier,
} from '../../application/services/FactCheckingQueryService'

export function presentCorrection(correction: Correction) {
  return {
    id: correction.id,
    publicationId: correction.publicationId,
    notificationId: correction.notificationId,
    title: correction.title,
    content: correction.content,
    correctedById: correction.correctedById,
    createdAt: correction.createdAt.toISOString(),
    updatedAt: correction.updatedAt.toISOString(),
  }
}

export function presentCorrectionList(corrections: Correction[]) {
  return {
    items: corrections.map(presentCorrection),
    total: corrections.length,
  }
}

export function presentPublication(publication: Publication) {
  return {
    id: publication.id,
    investigationId: publication.investigationId,
    approvedById: publication.approvedById,
    finalVerdict: publication.finalVerdict,
    publicationNotes: publication.publicationNotes,
    publishedAt: publication.publishedAt.toISOString(),
    isCorrection: publication.isCorrection,
    verifiedLinks: publication.verifiedLinks.map((link) => ({
      id: link.id,
      url: link.url,
      publicationId: link.publicationId,
      addedById: link.addedById,
      authoritySourceId: link.authoritySourceId ?? null,
      createdAt: link.createdAt.toISOString(),
      updatedAt: link.updatedAt.toISOString(),
    })),
    verifiedMedia: publication.verifiedMedia.map((media) => ({
      id: media.id,
      url: media.url,
      type: media.type,
      order: media.order,
      publicationId: media.publicationId,
      addedById: media.addedById,
      authoritySourceId: media.authoritySourceId ?? null,
      createdAt: media.createdAt.toISOString(),
      updatedAt: media.updatedAt.toISOString(),
    })),
    createdAt: publication.createdAt.toISOString(),
    updatedAt: publication.updatedAt.toISOString(),
  }
}

export function presentPublicationList(publications: Publication[]) {
  return {
    items: publications.map(presentPublication),
    total: publications.length,
  }
}

export function presentEnrichedPublication({
  publication,
  title,
  authoritySourceNames,
}: EnrichedPublication) {
  const resolveName = (authoritySourceId: string | null) =>
    authoritySourceId
      ? (authoritySourceNames.get(authoritySourceId) ?? null)
      : null
  return {
    ...presentPublication(publication),
    title,
    verifiedLinks: publication.verifiedLinks.map((link) => ({
      id: link.id,
      url: link.url,
      publicationId: link.publicationId,
      addedById: link.addedById,
      authoritySourceId: link.authoritySourceId ?? null,
      authoritySourceName: resolveName(link.authoritySourceId ?? null),
      createdAt: link.createdAt.toISOString(),
      updatedAt: link.updatedAt.toISOString(),
    })),
    verifiedMedia: publication.verifiedMedia.map((media) => ({
      id: media.id,
      url: media.url,
      type: media.type,
      order: media.order,
      publicationId: media.publicationId,
      addedById: media.addedById,
      authoritySourceId: media.authoritySourceId ?? null,
      authoritySourceName: resolveName(media.authoritySourceId ?? null),
      createdAt: media.createdAt.toISOString(),
      updatedAt: media.updatedAt.toISOString(),
    })),
  }
}

export function presentEnrichedPublicationList(items: EnrichedPublication[]) {
  return {
    items: items.map(presentEnrichedPublication),
    total: items.length,
  }
}

// ── Public dossier ───────────────────────────────────────────────────────────
// The publication page is readable by citizens, so the dossier drops every id
// that could identify a contributor: the `uploadedById` on source media (the
// citizen who filed the report) and the `watcherId` on evidence never leave the
// server. Contributions are attributed by display name through `credits`
// instead. The director's `approvedById` does ride along on the publication
// itself — they sign the publication publicly, so that is not a disclosure.

function presentDossierMedia({
  media,
  authoritySourceName,
  authoritySourceType,
}: EnrichedInvestigationMedia) {
  return {
    id: media.id,
    url: media.url,
    type: media.type,
    order: media.order,
    origin: media.origin,
    category: media.category ?? null,
    reliability: media.reliability ?? null,
    justification: media.justification ?? null,
    authoritySourceName,
    authoritySourceType,
  }
}

function presentDossierEvidence({
  evidence,
  media,
  watcherName,
}: EnrichedEvidence) {
  return {
    id: evidence.id,
    title: evidence.title,
    content: evidence.content,
    watcherName,
    media: media.map((item) => ({
      id: item.id,
      url: item.url,
      type: item.type,
      order: item.order,
      category: item.category ?? null,
      reliability: item.reliability ?? null,
      justification: item.justification ?? null,
    })),
  }
}

export function presentPublicationDossier(dossier: PublicationDossier) {
  return {
    ...presentEnrichedPublication(dossier.publication),
    subject: dossier.subject,
    investigationNotes: dossier.investigationNotes,
    media: dossier.media.map(presentDossierMedia),
    evidence: dossier.evidence.map(presentDossierEvidence),
    credits: dossier.credits,
  }
}
