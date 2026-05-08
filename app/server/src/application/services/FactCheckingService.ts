// application/services/FactCheckingService.ts
//
// Public application facade for the fact-checking workflow.
// The detailed orchestration is delegated to smaller workflow services so this
// entrypoint stays readable and focused on use-case boundaries.

import {
  CitizenWorkflowService,
  DirectorWorkflowService,
  JournalistWorkflowService,
  type ApproveInvestigationInput,
  type CreateDirectorInboxSubjectInput,
  type SubmitReportInput,
  type SubmitWatcherEvidenceInput,
} from './fact-checking'
import {
  type MediaCategory,
  type Verdict,
} from '../../domain/entities/Investigation'
import type { SourceType } from '../../domain/entities/AuthoritySource'
import type { MediaType } from '../../domain/value-objects'

export type FactCheckingServiceTransactionRunner = <T>(
  work: () => Promise<T>,
) => Promise<T>

export class FactCheckingService {
  constructor(
    private readonly citizenWorkflowService: CitizenWorkflowService,
    private readonly journalistWorkflowService: JournalistWorkflowService,
    private readonly directorWorkflowService: DirectorWorkflowService,
    private readonly transactionRunner?: FactCheckingServiceTransactionRunner,
  ) {}

  async submitReport(input: SubmitReportInput): Promise<string> {
    return this.runInTransaction(() =>
      this.citizenWorkflowService.submitReport(input),
    )
  }

  async submitWatcherApplication(
    citizenId: string,
    motivation: string,
  ): Promise<string> {
    return this.runInTransaction(() =>
      this.citizenWorkflowService.submitWatcherApplication(
        citizenId,
        motivation,
      ),
    )
  }

  async submitWatcherEvidence(
    input: SubmitWatcherEvidenceInput,
  ): Promise<string> {
    return this.runInTransaction(() =>
      this.citizenWorkflowService.submitWatcherEvidence(input),
    )
  }

  async createDirectorInboxSubject(
    directorId: string,
    input: CreateDirectorInboxSubjectInput,
  ): Promise<string> {
    return this.runInTransaction(() =>
      this.directorWorkflowService.createDirectorInboxSubject(
        directorId,
        input,
      ),
    )
  }

  async pickInboxSubject(journalistId: string, inboxSubjectId: string) {
    return this.runInTransaction(() =>
      this.journalistWorkflowService.pickInboxSubject(
        journalistId,
        inboxSubjectId,
      ),
    )
  }

  async submitInvestigationForReview(
    journalistId: string,
    investigationId: string,
  ): Promise<void> {
    return this.runInTransaction(() =>
      this.journalistWorkflowService.submitInvestigationForReview(
        journalistId,
        investigationId,
      ),
    )
  }

  async updateInvestigationSourceMediaItem(
    journalistId: string,
    investigationId: string,
    mediaId: number,
    input: {
      category: MediaCategory
      reliability: Verdict
      justification: string
    },
  ): Promise<void> {
    return this.runInTransaction(() =>
      this.journalistWorkflowService.updateInvestigationSourceMediaItem(
        journalistId,
        investigationId,
        mediaId,
        input,
      ),
    )
  }

  async updateWatcherEvidenceMediaItem(
    journalistId: string,
    investigationId: string,
    evidenceId: string,
    mediaId: number,
    input: {
      category: MediaCategory
      reliability: Verdict
      justification: string
    },
  ): Promise<void> {
    return this.runInTransaction(() =>
      this.journalistWorkflowService.updateWatcherEvidenceMediaItem(
        journalistId,
        investigationId,
        evidenceId,
        mediaId,
        input,
      ),
    )
  }

  async addJournalistProofMedia(
    journalistId: string,
    investigationId: string,
    input: {
      url: string
      type: MediaType
      order?: number
      authoritySourceName: string
      authoritySourceType: SourceType
    },
  ): Promise<void> {
    return this.runInTransaction(() =>
      this.journalistWorkflowService.addJournalistProofMedia(
        journalistId,
        investigationId,
        input,
      ),
    )
  }

  async approveInvestigation(
    directorId: string,
    investigationId: string,
    input: ApproveInvestigationInput = {},
  ): Promise<string> {
    return this.runInTransaction(() =>
      this.directorWorkflowService.approveInvestigation(
        directorId,
        investigationId,
        input,
      ),
    )
  }

  async rejectInvestigation(
    directorId: string,
    investigationId: string,
    reason: string,
  ): Promise<void> {
    return this.runInTransaction(() =>
      this.directorWorkflowService.rejectInvestigation(
        directorId,
        investigationId,
        reason,
      ),
    )
  }

  async cancelInvestigation(
    directorId: string,
    investigationId: string,
    reason: string,
  ): Promise<void> {
    return this.runInTransaction(() =>
      this.directorWorkflowService.cancelInvestigation(
        directorId,
        investigationId,
        reason,
      ),
    )
  }

  async deleteInboxSubjectByDirector(
    directorId: string,
    inboxSubjectId: string,
    reason: string,
  ): Promise<void> {
    return this.runInTransaction(() =>
      this.directorWorkflowService.deleteInboxSubjectByDirector(
        directorId,
        inboxSubjectId,
        reason,
      ),
    )
  }

  async archiveUnverifiableInvestigation(
    directorId: string,
    investigationId: string,
    comment?: string,
  ): Promise<void> {
    return this.runInTransaction(() =>
      this.directorWorkflowService.archiveUnverifiableInvestigation(
        directorId,
        investigationId,
        comment,
      ),
    )
  }

  async approveWatcherApplication(
    directorId: string,
    applicationId: string,
  ): Promise<void> {
    return this.runInTransaction(() =>
      this.directorWorkflowService.approveWatcherApplication(
        directorId,
        applicationId,
      ),
    )
  }

  async rejectWatcherApplication(
    directorId: string,
    applicationId: string,
  ): Promise<void> {
    return this.runInTransaction(() =>
      this.directorWorkflowService.rejectWatcherApplication(
        directorId,
        applicationId,
      ),
    )
  }

  private runInTransaction<T>(work: () => Promise<T>): Promise<T> {
    if (!this.transactionRunner) {
      return work()
    }
    return this.transactionRunner(work)
  }
}
