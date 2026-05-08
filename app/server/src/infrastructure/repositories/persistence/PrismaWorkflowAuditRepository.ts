import { WorkflowAudit } from '../../../domain/entities/WorkflowAudit'
import type { IWorkflowAuditRepository } from '../../../domain/repositories/IWorkflowAuditRepository'
import { prisma } from '../../config/database'

type PrismaWorkflowAuditRow = NonNullable<
  Awaited<ReturnType<typeof prisma.workflowAudit.findUnique>>
>

export class PrismaWorkflowAuditRepository implements IWorkflowAuditRepository {
  async save(audit: WorkflowAudit): Promise<void> {
    await prisma.workflowAudit.create({
      data: {
        id: audit.id,
        investigationId: audit.investigationId,
        actorId: audit.actorId,
        previousStatus: audit.previousStatus,
        newStatus: audit.newStatus,
        comment: audit.comment,
        createdAt: audit.createdAt,
      },
    })
  }

  async findById(id: string): Promise<WorkflowAudit | null> {
    const row = await prisma.workflowAudit.findUnique({ where: { id } })
    return row ? this.toDomain(row) : null
  }

  async findByInvestigationId(
    investigationId: string,
  ): Promise<WorkflowAudit[]> {
    const rows = await prisma.workflowAudit.findMany({
      where: { investigationId },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async findByActorId(actorId: string): Promise<WorkflowAudit[]> {
    const rows = await prisma.workflowAudit.findMany({
      where: { actorId },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async findRecent(limit: number): Promise<WorkflowAudit[]> {
    const rows = await prisma.workflowAudit.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    })
    return rows.map((row) => this.toDomain(row))
  }

  private toDomain(row: PrismaWorkflowAuditRow): WorkflowAudit {
    return new WorkflowAudit(
      row.id,
      row.investigationId,
      row.actorId,
      row.newStatus,
      row.previousStatus ?? null,
      row.comment ?? null,
      row.createdAt,
    )
  }
}
