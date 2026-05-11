import type { Report } from '../../domain/entities/Report'

export function presentReport(report: Report) {
  return {
    id: report.id,
    citizenId: report.citizenId,
    theme: report.theme,
    title: report.title,
    content: report.content,
    status: report.status,
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt.toISOString(),
  }
}

export function presentReportList(reports: Report[]) {
  return {
    items: reports.map(presentReport),
    total: reports.length,
  }
}
