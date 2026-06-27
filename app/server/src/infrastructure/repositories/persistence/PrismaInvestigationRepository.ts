import { Evidence } from '../../../domain/entities/Evidence'
import { Investigation } from '../../../domain/entities/Investigation'
import type { IInvestigationRepository } from '../../../domain/repositories/IInvestigationRepository'
import { prisma } from '../../config/database'

type PrismaInvestigationRow = NonNullable<
  Awaited<ReturnType<typeof prisma.investigation.findUnique>>
>

export class PrismaInvestigationRepository implements IInvestigationRepository {
  async save(investigation: Investigation): Promise<void> {
    await prisma.investigation.create({
      data: {
        id: investigation.id,
        inboxSubjectId: investigation.inboxSubjectId,
        journalistId: investigation.journalistId,
        mediaCategory: investigation.mediaCategory,
        draftVerdict: investigation.draftVerdict,
        investigationNotes: investigation.investigationNotes,
        attemptCount: investigation.attemptCount,
        status: investigation.status,
        createdAt: investigation.createdAt,
        updatedAt: investigation.updatedAt,
      },
    })
  }

  async findById(id: string): Promise<Investigation | null> {
    const row = await prisma.investigation.findUnique({ where: { id } })
    return row ? this.toDomain(row) : null
  }

  async findByReportId(reportId: string): Promise<Investigation | null> {
    const row = await prisma.investigation.findFirst({
      where: {
        inboxSubject: {
          reportId,
        },
      },
    })
    return row ? this.toDomain(row) : null
  }

  async findByInboxSubjectId(
    inboxSubjectId: string,
  ): Promise<Investigation | null> {
    const row = await prisma.investigation.findUnique({
      where: { inboxSubjectId },
    })
    return row ? this.toDomain(row) : null
  }

  async findByJournalistId(journalistId: string): Promise<Investigation[]> {
    const rows = await prisma.investigation.findMany({
      where: { journalistId },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async findAll(): Promise<Investigation[]> {
    const rows = await prisma.investigation.findMany()
    return rows.map((row) => this.toDomain(row))
  }

  async findInProgress(): Promise<Investigation[]> {
    const rows = await prisma.investigation.findMany({
      where: { status: 'IN_PROGRESS' },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async findPendingReviews(): Promise<Investigation[]> {
    const rows = await prisma.investigation.findMany({
      where: { status: 'PENDING_REVIEW' },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async findPublished(): Promise<Investigation[]> {
    const rows = await prisma.investigation.findMany({
      where: { status: 'PUBLISHED' },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async findCanceled(): Promise<Investigation[]> {
    const rows = await prisma.investigation.findMany({
      where: { status: 'CANCELED' },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async findContributable(): Promise<Investigation[]> {
    // Contributable == editable per Investigation.canBeEdited(): a watcher can
    // enrich an investigation while it is OPEN, actively worked (IN_PROGRESS),
    // or sent back for revision (NEEDS_REVISION).
    const rows = await prisma.investigation.findMany({
      where: { status: { in: ['OPEN', 'IN_PROGRESS', 'NEEDS_REVISION'] } },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async update(investigation: Investigation): Promise<void> {
    await prisma.investigation.update({
      where: { id: investigation.id },
      data: {
        inboxSubjectId: investigation.inboxSubjectId,
        journalistId: investigation.journalistId,
        mediaCategory: investigation.mediaCategory,
        draftVerdict: investigation.draftVerdict,
        investigationNotes: investigation.investigationNotes,
        attemptCount: investigation.attemptCount,
        status: investigation.status,
        updatedAt: investigation.updatedAt,
      },
    })
  }

  async addEvidence(
    investigationId: string,
    evidence: Evidence,
  ): Promise<void> {
    await prisma.evidence.create({
      data: {
        id: evidence.id,
        investigationId,
        watcherId: evidence.watcherId,
        title: evidence.title,
        content: evidence.content,
        createdAt: evidence.createdAt,
        updatedAt: evidence.updatedAt,
      },
    })
  }

  private toDomain(row: PrismaInvestigationRow): Investigation {
    return new Investigation(
      row.id,
      row.inboxSubjectId,
      row.journalistId,
      row.mediaCategory,
      row.draftVerdict,
      row.investigationNotes,
      row.attemptCount,
      row.status,
      row.createdAt,
      row.updatedAt,
    )
  }
}
