import { createFileRoute } from '@tanstack/react-router'
import { ReportCreatePage } from '../pages/reports/reports-page'

export const Route = createFileRoute('/reports/create')({
  component: ReportsCreateRoute,
})

function ReportsCreateRoute() {
  return <ReportCreatePage />
}
