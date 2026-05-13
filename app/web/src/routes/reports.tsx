import { createFileRoute } from '@tanstack/react-router'
import { ReportsPage } from '../pages/reports/reports-page'

export const Route = createFileRoute('/reports')({
  component: ReportsRoute,
})

function ReportsRoute() {
  return <ReportsPage />
}
