import {
  InboxSubject,
  type InboxSubjectOrigin,
  type InboxSubjectStatus,
} from '../entities/InboxSubject'
import { randomUUID } from 'crypto'

type CreateInboxSubjectParams = {
  theme: string
  description: string
  createdById: string
  reportId?: string | null
  status?: InboxSubjectStatus
  origin?: InboxSubjectOrigin
  createdAt?: Date
  updatedAt?: Date
}

export class InboxSubjectFactory {
  static create(params: CreateInboxSubjectParams): InboxSubject {
    const {
      theme,
      description,
      createdById,
      reportId = null,
      status = 'OPEN',
      origin = 'REPORT',
      createdAt = new Date(),
      updatedAt = new Date(),
    } = params
    const id = randomUUID()
    return new InboxSubject(
      id,
      theme,
      description,
      createdById,
      reportId,
      status,
      origin,
      createdAt,
      updatedAt,
    )
  }

  static createFromDirector(
    directorId: string,
    theme: string,
    description: string,
  ): InboxSubject {
    return this.create({
      theme,
      description,
      createdById: directorId,
      status: 'OPEN',
      origin: 'DIRECTOR_INITIATED',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  static createFromExistingReport(
    citizenId: string,
    theme: string,
    description: string,
    reportId: string,
  ): InboxSubject {
    return this.create({
      theme,
      description,
      createdById: citizenId,
      reportId,
      status: 'OPEN',
      origin: 'REPORT',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }
}
