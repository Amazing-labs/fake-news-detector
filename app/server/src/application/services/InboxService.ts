// application/services/InboxService.ts
//
// Inbox subjects management: build subjects from existing reports, list and archive.

import {
  InboxSubject,
  type InboxSubjectStatus,
} from '../../domain/entities/InboxSubject'
import { InboxSubjectFactory } from '../../domain/factories/InboxSubjectFactory'
import {
  type IInboxSubjectRepository,
  type IReportRepository,
} from '../../domain/repositories'
import { NotFoundError, ValidationError } from '../../shared/errors'

export class InboxService {
  constructor(
    private readonly inboxSubjectRepository: IInboxSubjectRepository,
    private readonly reportRepository: IReportRepository,
  ) {}

  async buildInboxSubjectFromReport(reportId: string): Promise<InboxSubject> {
    const report = await this.reportRepository.findById(reportId)
    if (!report) throw new NotFoundError('Report', reportId)

    const description = report.content ?? report.title ?? report.theme
    if (!description.trim()) {
      throw new ValidationError(
        'Report does not contain enough information to build an inbox subject',
      )
    }

    const subject = InboxSubjectFactory.createFromExistingReport(
      report.citizenId,
      report.theme,
      description,
      report.id,
    )
    await this.inboxSubjectRepository.save(subject)
    return subject
  }

  async listInboxSubjectsByStatus(
    status: InboxSubjectStatus,
  ): Promise<InboxSubject[]> {
    return this.inboxSubjectRepository.findByStatus(status)
  }

  async archiveInboxSubject(subjectId: string): Promise<void> {
    const subject = await this.inboxSubjectRepository.findById(subjectId)
    if (!subject) throw new NotFoundError('InboxSubject', subjectId)
    subject.archive()
    await this.inboxSubjectRepository.update(subject)
  }
}
