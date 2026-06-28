// domain/repositories/IPublicationRepository.ts
import { Publication } from '../entities/Publication'

// Lightweight projection for read paths that only need to know which
// investigations have a publication (and its id), without loading the
// publication's verified media/links fan-out.
export interface PublicationRef {
  id: string
  investigationId: string
}

export interface IPublicationRepository {
  save(publication: Publication): Promise<void>
  markAsCorrected(publicationId: string, updatedAt: Date): Promise<void>
  findById(id: string): Promise<Publication | null>
  findByInvestigationId(investigationId: string): Promise<Publication | null>
  findRefsByInvestigationIds(
    investigationIds: string[],
  ): Promise<PublicationRef[]>
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
