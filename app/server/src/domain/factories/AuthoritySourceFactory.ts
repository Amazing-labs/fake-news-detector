// domain/factories/AuthoritySourceFactory.ts
import { AuthoritySource, SourceType } from '../entities/AuthoritySource'
import { randomUUID } from 'crypto'

export interface CreateAuthoritySourceParams {
  name: string
  type: SourceType
}

export class AuthoritySourceFactory {
  static create(params: CreateAuthoritySourceParams): AuthoritySource {
    return new AuthoritySource(randomUUID(), params.name, params.type)
  }

  static createOfficialDecree(name: string): AuthoritySource {
    return this.create({
      name,
      type: 'OFFICIAL_DECREE',
    })
  }

  static createMediaCrosscheck(name: string): AuthoritySource {
    return this.create({
      name,
      type: 'MEDIA_CROSSCHECK',
    })
  }

  static createAuthorityStatement(name: string): AuthoritySource {
    return this.create({
      name,
      type: 'AUTHORITY_STATEMENT',
    })
  }
}
