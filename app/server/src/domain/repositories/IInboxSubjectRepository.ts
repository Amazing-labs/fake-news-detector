// domain/repositories/IInboxSubjectRepository.ts
import {
  InboxSubject,
  type InboxSubjectOrigin,
  type InboxSubjectStatus,
} from '../entities/InboxSubject'

export interface IInboxSubjectRepository {
  save(subject: InboxSubject): Promise<void>
  update(subject: InboxSubject): Promise<void>
  findById(id: string): Promise<InboxSubject | null>
  findByIds(ids: string[]): Promise<InboxSubject[]>
  findByReportIds(reportIds: string[]): Promise<InboxSubject[]>
  findAll(): Promise<InboxSubject[]>
  findByStatus(status: InboxSubjectStatus): Promise<InboxSubject[]>
  findByOrigin(origin: InboxSubjectOrigin): Promise<InboxSubject[]>
  findByCreatedBy(createdById: string): Promise<InboxSubject[]>
  findByReportId(reportId: string): Promise<InboxSubject | null>
  delete(id: string): Promise<void>
}
