import {
  CitizenReportCreateWorkspacePage,
  ReportDetailWorkspacePage,
  ReportsWorkspacePage,
} from '../verifact-design/verifact-design-page'

export function ReportsPage() {
  return <ReportsWorkspacePage />
}

export function ReportCreatePage() {
  return <CitizenReportCreateWorkspacePage />
}

export function ReportDetailPage({ reportId }: { reportId: string }) {
  return <ReportDetailWorkspacePage reportId={reportId} />
}
