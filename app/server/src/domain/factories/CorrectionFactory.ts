// domain/factories/CorrectionFactory.ts
import { Correction } from '../entities/Correction'
import { randomUUID } from 'node:crypto'

export interface CreateCorrectionParams {
  notificationId: string
  publicationId: string
  title: string
  content: string
  correctedById: string
}

export class CorrectionFactory {
  static create(params: CreateCorrectionParams): Correction {
    return new Correction(
      randomUUID(),
      params.notificationId,
      params.publicationId,
      params.title,
      params.content,
      params.correctedById,
    )
  }

  static createForPublication(
    publicationId: string,
    directorId: string,
    title: string,
    content: string,
    notificationId: string,
  ): Correction {
    return this.create({
      notificationId,
      publicationId,
      title,
      content,
      correctedById: directorId,
    })
  }
}
