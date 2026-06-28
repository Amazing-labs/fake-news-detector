// domain/repositories/ICitizenRepository.ts
import type { Citizen, CitizenStatus, CitizenType } from '../entities/Citizen'

export interface ICitizenRepository {
  save(citizen: Citizen): Promise<void>
  findById(id: string): Promise<Citizen | null>
  findByIds(ids: string[]): Promise<Citizen[]>
  findByEmail(email: string): Promise<Citizen | null>
  findAll(): Promise<Citizen[]>
  findAllIds(): Promise<string[]>
  findByStatus(status: CitizenStatus): Promise<Citizen[]>
  findByCitizenType(type: CitizenType): Promise<Citizen[]>
  update(citizen: Citizen): Promise<void>
  delete(id: string): Promise<void>
}
