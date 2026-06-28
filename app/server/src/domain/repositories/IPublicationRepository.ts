// domain/repositories/IPublicationRepository.ts
import { Publication } from '../entities/Publication'

export interface IPublicationRepository {
  save(publication: Publication): Promise<void>
  markAsCorrected(publicationId: string, updatedAt: Date): Promise<void>
  findById(id: string): Promise<Publication | null>
  findByInvestigationId(investigationId: string): Promise<Publication | null>
  findByInvestigationIds(investigationIds: string[]): Promise<Publication[]>
  findAll(options?: {
    skip?: number
    take?: number
    orderBy?: 'asc' | 'desc'
  }): Promise<Publication[]>
  findByApproverId(approvedById: string): Promise<Publication[]>
  findCorrections(): Promise<Publication[]>
  delete(id: string): Promise<void>
  count(): Promise<number>
}
