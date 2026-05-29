import { createFileRoute } from '@tanstack/react-router'
import { ReportDetailPage } from '../pages/reports/reports-page'

export const Route = createFileRoute('/reports/$reportId')({
  component: ReportDetailRoute,
})

function ReportDetailRoute() {
  const { reportId } = Route.useParams()

  return <ReportDetailPage reportId={reportId} />
}
