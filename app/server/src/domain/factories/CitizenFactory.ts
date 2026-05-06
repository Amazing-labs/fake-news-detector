// domain/factories/CitizenFactory.ts
import {
  Citizen,
  CitizenType,
  CitizenStatus,
  CitizenRole,
} from '../entities/Citizen'
import { randomUUID } from 'crypto'

export interface CreateCitizenParams {
  name: string
  email: string
  role?: CitizenRole
  status?: CitizenStatus
  citizenType?: CitizenType
  engagementScore?: number
  openReportsCount?: number
}

export class CitizenFactory {
  static create(params: CreateCitizenParams): Citizen {
    const id = randomUUID()
    return new Citizen(
      id,
      params.name,
      params.email,
      params.role,
      params.status || 'ACTIVE',
      params.citizenType || 'REGULAR',
      params.engagementScore || 0,
      new Date(),
      params.openReportsCount || 0,
      3,
      null,
      null,
      new Date(),
      new Date(),
    )
  }

  static createWatcher(name: string, email: string): Citizen {
    return this.create({
      name,
      email,
      citizenType: 'WATCHER',
    })
  }

  static createFromRegistration(name: string, email: string): Citizen {
    return this.create({
      name,
      email,
      engagementScore: 0,
      openReportsCount: 0,
    })
  }
}
