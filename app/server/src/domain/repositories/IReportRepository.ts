// domain/repositories/IReportRepository.ts
import { Report, ReportStatus } from '../entities/Report'

export interface IReportRepository {
  save(report: Report): Promise<void>
  findById(id: string): Promise<Report | null>
  findByStatus(status: ReportStatus): Promise<Report[]>
  findAll(): Promise<Report[]>
  findByTheme(theme: string): Promise<Report[]>
  listInbox(): Promise<Report[]>
  findByCitizenId(citizenId: string): Promise<Report[]>
  delete(id: string): Promise<void>
}
