// domain/repositories/IReportMediaRepository.ts
import type { ReportMedia } from '../value-objects/Media'
import type { MediaType } from '../value-objects'

export interface ReportMediaInsert {
  url: string
  type: MediaType
  order: number
  uploadedById: string
}

export interface IReportMediaRepository {
  saveMany(reportId: string, items: ReportMediaInsert[]): Promise<void>
  findByReportId(reportId: string): Promise<ReportMedia[]>
}
