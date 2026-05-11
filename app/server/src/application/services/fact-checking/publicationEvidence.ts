import { randomUUID } from 'node:crypto'

import { AuthoritySourceFactory } from '../../../domain/factories/AuthoritySourceFactory'
import {
  VerifiedLinkFactory,
  VerifiedMediaFactory,
} from '../../../domain/factories/MediaFactory'
import type { VerifiedLink, VerifiedMedia } from '../../../domain/value-objects'
import { ValidationError } from '../../../shared/errors'
import type {
  ApproveInvestigationInput,
  PublicationAuthoritySourceInput,
  PublicationVerifiedMediaInput,
} from './types'

export interface PublicationEvidenceBundle {
  authoritySources: ReturnType<typeof AuthoritySourceFactory.create>[]
  verifiedLinks: VerifiedLink[]
  verifiedMedia: VerifiedMedia[]
}

export function createPublicationId(): string {
  return randomUUID()
}

export function buildPublicationEvidence(
  directorId: string,
  input: ApproveInvestigationInput,
  publicationId: string,
): PublicationEvidenceBundle {
  const authoritySources: ReturnType<typeof AuthoritySourceFactory.create>[] =
    []
  let nextTemporaryLinkId = -1
  let nextTemporaryMediaId = -1

  const verifiedLinks = (input.verifiedLinks ?? []).map((link) => {
    const authoritySourceId = link.authoritySource
      ? createPublicationAuthoritySource(authoritySources, link.authoritySource)
      : undefined
    const normalizedUrl = assertPublicationEvidenceUrl(
      link.url,
      'verified link',
    )
    return VerifiedLinkFactory.createForPublication(
      nextTemporaryLinkId--,
      publicationId,
      normalizedUrl,
      directorId,
      authoritySourceId,
    )
  })

  const mediaOrders = resolvePublicationMediaOrders(input.verifiedMedia ?? [])
  const verifiedMedia = (input.verifiedMedia ?? []).map((media, index) => {
    const authoritySourceId = media.authoritySource
      ? createPublicationAuthoritySource(
          authoritySources,
          media.authoritySource,
        )
      : undefined
    const normalizedUrl = assertPublicationEvidenceUrl(
      media.url,
      'verified media',
    )
    return VerifiedMediaFactory.createForPublication(
      nextTemporaryMediaId--,
      mediaOrders[index],
      publicationId,
      normalizedUrl,
      media.type,
      directorId,
      authoritySourceId,
    )
  })

  return {
    authoritySources,
    verifiedLinks,
    verifiedMedia,
  }
}

function createPublicationAuthoritySource(
  authoritySources: ReturnType<typeof AuthoritySourceFactory.create>[],
  input: PublicationAuthoritySourceInput,
): string {
  const normalizedName = input.name.trim()
  if (!normalizedName) {
    throw new ValidationError("Le nom de la source d'autorité est obligatoire")
  }

  const existingAuthoritySource = authoritySources.find(
    (authoritySource) =>
      authoritySource.name === normalizedName &&
      authoritySource.type === input.type,
  )
  if (existingAuthoritySource) {
    return existingAuthoritySource.id
  }

  const authoritySource = AuthoritySourceFactory.create({
    name: normalizedName,
    type: input.type,
  })
  authoritySources.push(authoritySource)
  return authoritySource.id
}

function resolvePublicationMediaOrders(
  media: PublicationVerifiedMediaInput[],
): number[] {
  const usedOrders = new Set<number>()
  const resolvedOrders = new Array<number>(media.length)

  media.forEach((item, index) => {
    if (item.order === undefined) return
    if (!Number.isInteger(item.order) || item.order < 0) {
      throw new ValidationError(
        "L'ordre des médias vérifiés doit être un entier positif ou nul",
      )
    }
    if (usedOrders.has(item.order)) {
      throw new ValidationError("L'ordre des médias vérifiés doit être unique")
    }
    usedOrders.add(item.order)
    resolvedOrders[index] = item.order
  })

  let nextAvailableOrder = 0
  media.forEach((_, index) => {
    if (resolvedOrders[index] !== undefined) return
    while (usedOrders.has(nextAvailableOrder)) {
      nextAvailableOrder++
    }
    resolvedOrders[index] = nextAvailableOrder
    usedOrders.add(nextAvailableOrder)
    nextAvailableOrder++
  })

  return resolvedOrders
}

function assertPublicationEvidenceUrl(url: string, label: string): string {
  const normalizedUrl = url.trim()
  if (!normalizedUrl) {
    throw new ValidationError(`L'URL du ${label} est obligatoire`)
  }
  try {
    new URL(normalizedUrl)
  } catch {
    throw new ValidationError(`L'URL du ${label} doit être valide`)
  }
  return normalizedUrl
}
