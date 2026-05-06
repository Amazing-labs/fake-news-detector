// domain/factories/InvestigationFactory.ts
import {
  Investigation,
  MediaCategory,
  Verdict,
} from '../entities/Investigation'
import { randomUUID } from 'crypto'

export interface CreateInvestigationParams {
  inboxSubjectId: string
  journalistId: string
  mediaCategory?: MediaCategory | null
  draftVerdict?: Verdict
  investigationNotes?: string
}

export class InvestigationFactory {
  static create(params: CreateInvestigationParams): Investigation {
    return new Investigation(
      randomUUID(),
      params.inboxSubjectId,
      params.journalistId,
      params.mediaCategory || null,
      params.draftVerdict || 'UNVERIFIABLE',
      params.investigationNotes || '',
      0,
      'OPEN',
    )
  }

  static createDraftFromInboxSubject(
    inboxSubjectId: string,
    journalistId: string,
  ): Investigation {
    return this.create({
      inboxSubjectId,
      journalistId,
    })
  }
}
