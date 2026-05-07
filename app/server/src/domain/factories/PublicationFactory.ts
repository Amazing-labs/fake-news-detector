// domain/factories/PublicationFactory.ts
import { Publication } from '../entities/Publication'
import { randomUUID } from 'crypto'
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
  publishedAt?: Date
  isCorrection?: boolean
  verifiedLinks?: VerifiedLink[]
  verifiedMedia?: VerifiedMedia[]
}

export class PublicationFactory {
  static create(params: CreatePublicationParams): Publication {
    const id = params.id ?? randomUUID()
    return new Publication(
      id,
      params.investigationId,
      params.approvedById,
      params.finalVerdict,
      params.publishedAt ?? new Date(),
      params.isCorrection || false,
      params.verifiedLinks ?? [],
      params.verifiedMedia ?? [],
      new Date(),
      new Date(),
    )
  }

  static createPublication(
    id: string,
    investigationId: string,
    approvedById: string,
    finalVerdict: Verdict,
    evidence?: {
      verifiedLinks?: VerifiedLink[]
      verifiedMedia?: VerifiedMedia[]
    },
  ): Publication {
    return this.create({
      id,
      investigationId,
      approvedById,
      finalVerdict,
      verifiedLinks: evidence?.verifiedLinks,
      verifiedMedia: evidence?.verifiedMedia,
    })
  }
}
