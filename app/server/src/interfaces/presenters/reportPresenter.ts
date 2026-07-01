import type { Report } from '../../domain/entities/Report'
import type { EnrichedReport } from '../../application/services/FactCheckingQueryService'

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

export function presentEnrichedReport({
  report,
  reporterName,
  subjectStatus,
}: EnrichedReport) {
  return {
    ...presentReport(report),
    reporterName,
    subjectStatus,
  }
}

export function presentEnrichedReportList(items: EnrichedReport[]) {
  return {
    items: items.map(presentEnrichedReport),
    total: items.length,
  }
}
