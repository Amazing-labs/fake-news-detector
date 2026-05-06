// domain/repositories/IInvestigationRepository.ts
import { Investigation } from '../entities/Investigation'
import { Evidence } from '../entities/Evidence'

export interface IInvestigationRepository {
  save(investigation: Investigation): Promise<void>
  findById(id: string): Promise<Investigation | null>
  findByReportId(reportId: string): Promise<Investigation | null>
  findByInboxSubjectId(inboxSubjectId: string): Promise<Investigation | null>
  findByJournalistId(journalistId: string): Promise<Investigation[]>
  findPendingReviews(): Promise<Investigation[]>
  findPublished(): Promise<Investigation[]>
  update(investigation: Investigation): Promise<void>
  addEvidence(investigationId: string, evidence: Evidence): Promise<void>
}
