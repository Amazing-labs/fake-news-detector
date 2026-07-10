import type { Director } from '../entities/Director'

export interface IDirectorRepository {
  save(director: Director): Promise<void>
  findById(id: string): Promise<Director | null>
  findByEmail(email: string): Promise<Director | null>
  findActive(): Promise<Director | null>
  findAll(): Promise<Director[]>
  update(director: Director): Promise<void>
  delete(id: string): Promise<void>
}
