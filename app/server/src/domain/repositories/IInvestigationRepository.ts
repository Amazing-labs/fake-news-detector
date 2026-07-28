import { Investigation, InvestigationStatus } from '../entities/Investigation'
import { Evidence } from '../entities/Evidence'

/**
 * Filter for the single investigation collection read. Every criterion is
 * optional and criteria combine with AND, so ownership scoping (`journalistId`)
 * composes with any lifecycle slice (`statuses`) instead of needing a dedicated
 * finder per combination.
 */
export interface InvestigationQuery {
  /**
   * Omit to skip the status filter entirely. An **empty array matches nothing**
   * — the read side relies on that to deny a reader a lifecycle slice outside
   * their visibility envelope, so an implementation must not treat `[]` as
   * "no filter" or it would silently widen visibility.
   */
  statuses?: readonly InvestigationStatus[]
  journalistId?: string
}

export interface IInvestigationRepository {
  save(investigation: Investigation): Promise<void>
  findById(id: string): Promise<Investigation | null>
  findByIds(ids: string[]): Promise<Investigation[]>
  findByReportId(reportId: string): Promise<Investigation | null>
  findByInboxSubjectId(inboxSubjectId: string): Promise<Investigation | null>
  findByInboxSubjectIds(inboxSubjectIds: string[]): Promise<Investigation[]>
  /** Newest first. An empty/absent query returns every investigation. */
  findMany(query?: InvestigationQuery): Promise<Investigation[]>
  update(investigation: Investigation): Promise<void>
  addEvidence(investigationId: string, evidence: Evidence): Promise<void>
}
