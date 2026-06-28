import type {
  IAuthoritySourceRepository,
  IEvidenceRepository,
  IInboxSubjectMediaRepository,
  IInboxSubjectRepository,
  IInvestigationMediaRepository,
  IInvestigationRepository,
  IJournalistRepository,
  IReportMediaRepository,
  IWorkflowAuditRepository,
} from '../../../domain/repositories'
import { AuthoritySourceFactory } from '../../../domain/factories/AuthoritySourceFactory'
import { InvestigationMediaFactory } from '../../../domain/factories/MediaFactory'
import { Investigation } from '../../../domain/entities/Investigation'
import type {
  MediaCategory,
  Verdict,
} from '../../../domain/entities/Investigation'
import { submitInvestigationForReviewWithAudit } from '../../../domain/processes/investigationStatusWorkflow'
import { copySourceMediaToInvestigationMedia } from '../../../domain/processes/investigationMediaCopy'
import type { SourceType } from '../../../domain/entities/AuthoritySource'
import type {
  InvestigationMedia,
  MediaType,
} from '../../../domain/value-objects'
import { BusinessRuleError, NotFoundError } from '../../../shared/errors'

export class JournalistWorkflowService {
  constructor(
    private readonly journalistRepository: IJournalistRepository,
    private readonly investigationRepository: IInvestigationRepository,
    private readonly investigationMediaRepository: IInvestigationMediaRepository,
    private readonly inboxSubjectRepository: IInboxSubjectRepository,
    private readonly inboxSubjectMediaRepository: IInboxSubjectMediaRepository,
    private readonly reportMediaRepository: IReportMediaRepository,
    private readonly evidenceRepository: IEvidenceRepository,
    private readonly authoritySourceRepository: IAuthoritySourceRepository,
    private readonly workflowAuditRepository: IWorkflowAuditRepository,
  ) {}

  async pickInboxSubject(
    journalistId: string,
    inboxSubjectId: string,
  ): Promise<Investigation> {
    const journalist = await this.getJournalistOrThrow(journalistId)
    const subject = await this.getInboxSubjectOrThrow(inboxSubjectId)

    const investigation = journalist.pickInboxSubject(subject)
    const mediaCopies = await this.prepareSourceMediaCopies(
      investigation,
      subject,
      inboxSubjectId,
    )

    await this.inboxSubjectRepository.update(subject)
    await this.journalistRepository.update(journalist)
    await this.investigationRepository.save(investigation)

    if (mediaCopies.length > 0) {
      await this.investigationMediaRepository.saveMany(
        investigation.id,
        mediaCopies,
      )
    }

    return investigation
  }

  async submitInvestigationForReview(
    journalistId: string,
    investigationId: string,
  ): Promise<void> {
    const journalist = await this.getJournalistOrThrow(journalistId)
    const investigation = await this.getInvestigationOrThrow(investigationId)
    const investigationMedia =
      await this.investigationMediaRepository.findByInvestigationId(
        investigationId,
      )
    const evidenceBundles =
      await this.evidenceRepository.findWithMediaByInvestigationId(
        investigationId,
      )

    const audit = submitInvestigationForReviewWithAudit(
      journalist,
      investigation,
      investigationMedia,
      evidenceBundles,
    )
    await this.investigationRepository.update(investigation)
    await this.workflowAuditRepository.save(audit)
  }

  async updateInvestigationDraft(
    journalistId: string,
    investigationId: string,
    input: {
      mediaCategory: MediaCategory | null
      draftVerdict: Verdict
      investigationNotes: string
    },
  ): Promise<void> {
    const journalist = await this.getJournalistOrThrow(journalistId)
    const investigation = await this.getInvestigationOrThrow(investigationId)
    this.assertJournalistOwnsInvestigation(investigation, journalistId)

    journalist.submitInvestigationDraft(
      investigation,
      input.mediaCategory,
      input.draftVerdict,
      input.investigationNotes,
    )
    await this.investigationRepository.update(investigation)
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
    const investigation = await this.getInvestigationOrThrow(investigationId)
    this.assertJournalistOwnsInvestigation(investigation, journalistId)

    const items =
      await this.investigationMediaRepository.findByInvestigationId(
        investigationId,
      )
    const media = items.find((item) => item.id === mediaId)
    if (!media) throw new NotFoundError('InvestigationMedia', String(mediaId))
    if (!media.requiresJournalistClassification()) {
      throw new BusinessRuleError(
        'Only citizen- or director-inbox-sourced media can be updated here',
      )
    }

    media.submitCategory(input.category)
    media.submitReliabilityVerdict(input.reliability)
    media.submitJustification(input.justification)
    await this.investigationMediaRepository.update(media)
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
    const investigation = await this.getInvestigationOrThrow(investigationId)
    this.assertJournalistOwnsInvestigation(investigation, journalistId)

    const bundles =
      await this.evidenceRepository.findWithMediaByInvestigationId(
        investigationId,
      )
    const bundle = bundles.find(
      (candidate) => candidate.evidence.id === evidenceId,
    )
    if (!bundle) throw new NotFoundError('Evidence', evidenceId)

    const media = bundle.media.find((item) => item.id === mediaId)
    if (!media) throw new NotFoundError('EvidenceMedia', String(mediaId))

    media.changeCategory(input.category)
    media.changeReliability(input.reliability)
    media.changeJustification(input.justification)
    await this.evidenceRepository.updateEvidenceMedia(media)
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
    const investigation = await this.getInvestigationOrThrow(investigationId)
    this.assertJournalistOwnsInvestigation(investigation, journalistId)

    const authoritySource = AuthoritySourceFactory.create({
      name: input.authoritySourceName,
      type: input.authoritySourceType,
    })
    await this.authoritySourceRepository.save(authoritySource)

    const existingMedia =
      await this.investigationMediaRepository.findByInvestigationId(
        investigationId,
      )
    const order =
      input.order ??
      (existingMedia.length > 0
        ? Math.max(...existingMedia.map((media) => media.order)) + 1
        : 0)

    const media = InvestigationMediaFactory.createFromJournalistProof(
      0,
      order,
      input.url,
      input.type,
      investigationId,
      journalistId,
      authoritySource.id,
    )
    await this.investigationMediaRepository.saveMany(investigationId, [media])
  }

  private async prepareSourceMediaCopies(
    investigation: Investigation,
    subject: {
      origin: 'REPORT' | 'DIRECTOR_INITIATED'
      reportId: string | null
    },
    inboxSubjectId: string,
  ): Promise<InvestigationMedia[]> {
    if (subject.origin === 'REPORT' && subject.reportId) {
      const reportRows = await this.reportMediaRepository.findByReportId(
        subject.reportId,
      )
      return copySourceMediaToInvestigationMedia(investigation.id, {
        type: 'REPORT',
        rows: reportRows,
      })
    }

    if (subject.origin === 'DIRECTOR_INITIATED') {
      const inboxRows =
        await this.inboxSubjectMediaRepository.findByInboxSubjectId(
          inboxSubjectId,
        )
      return copySourceMediaToInvestigationMedia(investigation.id, {
        type: 'INBOX_DIRECTOR',
        rows: inboxRows,
      })
    }

    return []
  }

  private assertJournalistOwnsInvestigation(
    investigation: Investigation,
    journalistId: string,
  ): void {
    if (investigation.journalistId !== journalistId) {
      throw new BusinessRuleError('Investigation belongs to another journalist')
    }
  }

  private async getJournalistOrThrow(journalistId: string) {
    const journalist = await this.journalistRepository.findById(journalistId)
    if (!journalist) throw new NotFoundError('Journalist', journalistId)
    return journalist
  }

  private async getInvestigationOrThrow(investigationId: string) {
    const investigation =
      await this.investigationRepository.findById(investigationId)
    if (!investigation) {
      throw new NotFoundError('Investigation', investigationId)
    }
    return investigation
  }

  private async getInboxSubjectOrThrow(inboxSubjectId: string) {
    const subject = await this.inboxSubjectRepository.findById(inboxSubjectId)
    if (!subject) throw new NotFoundError('InboxSubject', inboxSubjectId)
    return subject
  }
}
