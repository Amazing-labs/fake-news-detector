// domain/factories/EvidenceFactory.ts
import { Evidence } from '../entities/Evidence'
import { randomUUID } from 'crypto'
import type { MediaType } from '../value-objects/Media'
import { EvidenceMediaFactory } from './MediaFactory'
import { DomainError } from '../../shared/errors'

export interface CreateEvidenceParams {
  investigationId: string
  watcherId: string
  title: string
  content: string
}

export interface EvidenceMediaInput {
  url: string
  type: MediaType
  order?: number
}

export class EvidenceFactory {
  static create(params: CreateEvidenceParams): Evidence {
    return new Evidence(
      randomUUID(),
      params.content,
      params.title,
      params.investigationId,
      params.watcherId,
      [],
    )
  }

  static createWithMedia(
    params: CreateEvidenceParams,
    mediaItems: EvidenceMediaInput[],
  ): Evidence {
    if (!mediaItems.length) {
      throw new DomainError('Evidence requires at least one media item')
    }
    const id = randomUUID()
    const media = mediaItems.map((mi, idx) =>
      EvidenceMediaFactory.create({
        id: 0,
        order: mi.order ?? idx,
        evidenceId: id,
        url: mi.url,
        type: mi.type,
        uploadedById: params.watcherId,
      }),
    )
    return new Evidence(
      id,
      params.content,
      params.title,
      params.investigationId,
      params.watcherId,
      media,
    )
  }

  static createFromWatcher(
    investigationId: string,
    watcherId: string,
    title: string,
    content: string,
  ): Evidence {
    return this.create({
      investigationId,
      watcherId,
      title,
      content,
    })
  }
}
