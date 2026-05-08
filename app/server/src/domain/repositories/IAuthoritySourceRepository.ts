// domain/repositories/IAuthoritySourceRepository.ts
import { AuthoritySource, type SourceType } from '../entities/AuthoritySource'

export interface IAuthoritySourceRepository {
  save(authoritySource: AuthoritySource): Promise<void>
  saveMany(authoritySources: AuthoritySource[]): Promise<void>
  findById(id: string): Promise<AuthoritySource | null>
  findAll(): Promise<AuthoritySource[]>
  findByType(type: SourceType): Promise<AuthoritySource[]>
  delete(id: string): Promise<void>
}
