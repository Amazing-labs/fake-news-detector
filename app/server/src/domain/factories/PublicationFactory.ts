import { Publication } from '../entities/Publication'
import { randomUUID } from 'node:crypto'
import { ValidationError } from '../../shared/errors'
import {
  type Verdict,
  type VerifiedLink,
  type VerifiedMedia,
} from '../value-objects'

export interface CreatePublicationParams {
  id?: string
  investigationId: string
  approvedById: string
  finalVerdict: Verdict
  publicationNotes: string
  publishedAt?: Date
  isCorrection?: boolean
  verifiedLinks?: VerifiedLink[]
  verifiedMedia?: VerifiedMedia[]
}

export class PublicationFactory {
  // Every publication minted here carries a signed statement. Legacy rows may
  // hydrate with `null`, but nothing can be *created* without one.
  static create(params: CreatePublicationParams): Publication {
    const publicationNotes = params.publicationNotes.trim()
    if (!publicationNotes) {
      throw new ValidationError('La note de publication est obligatoire')
    }
    const id = params.id ?? randomUUID()
    return new Publication(
      id,
      params.investigationId,
      params.approvedById,
      params.finalVerdict,
      publicationNotes,
      params.publishedAt ?? new Date(),
      params.isCorrection || false,
      params.verifiedLinks ?? [],
      params.verifiedMedia ?? [],
      new Date(),
      new Date(),
    )
  }
}
