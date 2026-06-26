import type { Publication } from '../../domain/entities/Publication'
import type { Correction } from '../../domain/entities/Correction'
import type { EnrichedPublication } from '../../application/services/FactCheckingQueryService'

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
}: EnrichedPublication) {
  return {
    ...presentPublication(publication),
    title,
  }
}

export function presentEnrichedPublicationList(items: EnrichedPublication[]) {
  return {
    items: items.map(presentEnrichedPublication),
    total: items.length,
  }
}
