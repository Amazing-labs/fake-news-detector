// domain/repositories/IEvidenceRepository.ts
import { Evidence } from '../entities/Evidence'
import type { EvidenceWithMedia } from '../processes/investigationReviewReadiness'
import type { EvidenceMedia } from '../value-objects/Media'

export interface IEvidenceRepository {
  save(evidence: Evidence): Promise<void>
  saveWithMedia(evidence: Evidence): Promise<void>
  findById(id: string): Promise<Evidence | null>
  findByInvestigationId(investigationId: string): Promise<Evidence[]>
  findWithMediaByInvestigationId(
    investigationId: string,
  ): Promise<EvidenceWithMedia[]>
  findByWatcherId(watcherId: string): Promise<Evidence[]>
  update(evidence: Evidence): Promise<void>
  updateEvidenceMedia(media: EvidenceMedia): Promise<void>
  delete(id: string): Promise<void>
}
