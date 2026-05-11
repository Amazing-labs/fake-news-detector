import type { Publication } from '../../domain/entities/Publication'

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
