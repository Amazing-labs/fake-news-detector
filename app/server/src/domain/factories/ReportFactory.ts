// domain/factories/ReportFactory.ts
import { Report, ReportStatus } from '../entities/Report'
import { randomUUID } from 'crypto'

export interface CreateReportParams {
  citizenId: string
  theme: string
  title: string
  content: string
}

export class ReportFactory {
  static create(params: CreateReportParams): Report {
    const id = randomUUID()
    return new Report(
      id,
      params.citizenId,
      params.theme,
      params.title,
      params.content,
      'OPEN' as ReportStatus,
      new Date(),
      new Date(),
    )
  }

  static createFromScratch(
    content: string,
    citizenId: string,
    title: string,
    theme: string,
  ): Report {
    return this.create({
      citizenId,
      theme,
      title,
      content,
    })
  }
}
