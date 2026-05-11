// domain/factories/DirectorFactory.ts
import { Director, DirectorStatus } from '../entities/Director'
import { randomUUID } from 'node:crypto'
import { DirectorRole } from '../entities/Director'

export interface CreateDirectorParams {
  name: string
  email: string
  role?: DirectorRole
  status?: DirectorStatus
}

export class DirectorFactory {
  static create(params: CreateDirectorParams): Director {
    const id = randomUUID()
    return new Director(
      id,
      params.name,
      params.email,
      params.status || 'ACTIVE',
      params.role || 'EDITORIAL_DIRECTOR',
      new Date(),
      0,
      new Date(),
      new Date(),
    )
  }

  static createFromRegistration(name: string, email: string): Director {
    return this.create({
      name,
      email,
    })
  }
}
