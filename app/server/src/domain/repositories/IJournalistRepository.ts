// domain/repositories/IJournalistRepository.ts
import type { Journalist } from '../entities/Journalist'

export interface IJournalistRepository {
  save(journalist: Journalist): Promise<void>
  findById(id: string): Promise<Journalist | null>
  findByIds(ids: string[]): Promise<Journalist[]>
  findByEmail(email: string): Promise<Journalist | null>
  findAll(): Promise<Journalist[]>
  findByStatus(status: string): Promise<Journalist[]>
  findAvailable(): Promise<Journalist[]>
  update(journalist: Journalist): Promise<void>
  delete(id: string): Promise<void>
}
