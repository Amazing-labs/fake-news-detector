import { Report, type ReportStatus } from '../../../domain/entities/Report'
import type { IReportRepository } from '../../../domain/repositories/IReportRepository'
import { prisma } from '../../config/database'

type PrismaReportRow = NonNullable<
  Awaited<ReturnType<typeof prisma.report.findUnique>>
>

export class PrismaReportRepository implements IReportRepository {
  async save(report: Report): Promise<void> {
    const existing = await prisma.report.findUnique({
      where: { id: report.id },
    })
    if (existing) {
      await prisma.report.update({
        where: { id: report.id },
        data: {
          citizenId: report.citizenId,
          theme: report.theme,
          title: report.title,
          content: report.content,
          status: report.status,
          updatedAt: report.updatedAt,
        },
      })
      return
    }

    await prisma.report.create({
      data: {
        id: report.id,
        citizenId: report.citizenId,
        theme: report.theme,
        title: report.title,
        content: report.content,
        status: report.status,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
      },
    })
  }

  async findById(id: string): Promise<Report | null> {
    const row = await prisma.report.findUnique({ where: { id } })
    return row ? this.toDomain(row) : null
  }

  async findByStatus(status: ReportStatus): Promise<Report[]> {
    const rows = await prisma.report.findMany({ where: { status } })
    return rows.map((row) => this.toDomain(row))
  }

  async findAll(): Promise<Report[]> {
    const rows = await prisma.report.findMany()
    return rows.map((row) => this.toDomain(row))
  }

  async findByTheme(theme: string): Promise<Report[]> {
    const rows = await prisma.report.findMany({ where: { theme } })
    return rows.map((row) => this.toDomain(row))
  }

  async listInbox(): Promise<Report[]> {
    const rows = await prisma.report.findMany({
      where: { status: 'OPEN' },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async findByCitizenId(citizenId: string): Promise<Report[]> {
    const rows = await prisma.report.findMany({ where: { citizenId } })
    return rows.map((row) => this.toDomain(row))
  }

  async delete(id: string): Promise<void> {
    await prisma.report.delete({ where: { id } })
  }

  private toDomain(row: PrismaReportRow): Report {
    return new Report(
      row.id,
      row.citizenId,
      row.theme,
      row.title,
      row.content,
      row.status,
      row.createdAt,
      row.updatedAt,
    )
  }
}
