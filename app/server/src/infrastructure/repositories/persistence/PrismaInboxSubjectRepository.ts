import {
  InboxSubject,
  type InboxSubjectOrigin,
  type InboxSubjectStatus,
} from '../../../domain/entities/InboxSubject'
import type { IInboxSubjectRepository } from '../../../domain/repositories/IInboxSubjectRepository'
import { prisma } from '../../config/database'

type PrismaInboxSubjectRow = NonNullable<
  Awaited<ReturnType<typeof prisma.inboxSubject.findUnique>>
>

export class PrismaInboxSubjectRepository implements IInboxSubjectRepository {
  async save(subject: InboxSubject): Promise<void> {
    await prisma.inboxSubject.create({
      data: {
        id: subject.id,
        theme: subject.theme,
        description: subject.description,
        createdById: subject.createdById,
        reportId: subject.reportId,
        status: subject.status,
        origin: subject.origin,
        createdAt: subject.createdAt,
        updatedAt: subject.updatedAt,
      },
    })
  }

  async update(subject: InboxSubject): Promise<void> {
    await prisma.inboxSubject.update({
      where: { id: subject.id },
      data: {
        theme: subject.theme,
        description: subject.description,
        createdById: subject.createdById,
        reportId: subject.reportId,
        status: subject.status,
        origin: subject.origin,
        updatedAt: subject.updatedAt,
      },
    })
  }

  async findById(id: string): Promise<InboxSubject | null> {
    const row = await prisma.inboxSubject.findUnique({ where: { id } })
    return row ? this.toDomain(row) : null
  }

  async findByIds(ids: string[]): Promise<InboxSubject[]> {
    if (ids.length === 0) return []
    const rows = await prisma.inboxSubject.findMany({
      where: { id: { in: ids } },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async findByReportIds(reportIds: string[]): Promise<InboxSubject[]> {
    if (reportIds.length === 0) return []
    const rows = await prisma.inboxSubject.findMany({
      where: { reportId: { in: reportIds } },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async findAll(): Promise<InboxSubject[]> {
    const rows = await prisma.inboxSubject.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async findByStatus(status: InboxSubjectStatus): Promise<InboxSubject[]> {
    const rows = await prisma.inboxSubject.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async findByOrigin(origin: InboxSubjectOrigin): Promise<InboxSubject[]> {
    const rows = await prisma.inboxSubject.findMany({
      where: { origin },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async findByCreatedBy(createdById: string): Promise<InboxSubject[]> {
    const rows = await prisma.inboxSubject.findMany({
      where: { createdById },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async findByReportId(reportId: string): Promise<InboxSubject | null> {
    const row = await prisma.inboxSubject.findUnique({ where: { reportId } })
    return row ? this.toDomain(row) : null
  }

  async delete(id: string): Promise<void> {
    await prisma.inboxSubject.delete({ where: { id } })
  }

  private toDomain(row: PrismaInboxSubjectRow): InboxSubject {
    return new InboxSubject(
      row.id,
      row.theme,
      row.description,
      row.createdById,
      row.reportId,
      row.status,
      row.origin,
      row.createdAt,
      row.updatedAt,
    )
  }
}
