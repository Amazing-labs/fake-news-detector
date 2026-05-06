// domain/repositories/IInvestigationMediaRepository.ts
import type { InvestigationMedia } from '../value-objects/Media'

export interface IInvestigationMediaRepository {
  saveMany(investigationId: string, items: InvestigationMedia[]): Promise<void>
  findByInvestigationId(investigationId: string): Promise<InvestigationMedia[]>
  update(media: InvestigationMedia): Promise<void>
}
