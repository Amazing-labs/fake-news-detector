// domain/factories/JournalistFactory.ts
import {
  Journalist,
  JournalistStatus,
  JournalistRole,
} from '../entities/Journalist'
import { randomUUID } from 'crypto'

export interface CreateJournalistParams {
  name: string
  email: string
  role?: JournalistRole
  status?: JournalistStatus
  engagementScore?: number
  activeInvestigationsCount?: number
}

export class JournalistFactory {
  static create(params: CreateJournalistParams): Journalist {
    const id = randomUUID()
    return new Journalist(
      id,
      params.name,
      params.email,
      params.role || 'JOURNALIST',
      params.status || 'ACTIVE',
      params.engagementScore || 0,
      new Date(),
      params.activeInvestigationsCount || 0,
      1,
      null,
      null,
      new Date(),
      new Date(),
    )
  }

  static createFromRegistration(name: string, email: string): Journalist {
    return this.create({
      name,
      email,
      activeInvestigationsCount: 0,
    })
  }

  static createExperienced(
    name: string,
    email: string,
    completedInvestigations: number,
  ): Journalist {
    const journalist = this.create({ name, email })
    // Simulate completed investigations by adjusting score
    for (let i = 0; i < completedInvestigations; i++) {
      journalist.incrementEngagementScore(5)
    }
    return journalist
  }
}
