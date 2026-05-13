import { useQuery } from '@tanstack/react-query'
import type { ReportList } from '../../entities/report/model'
import { useAppSession } from '../../entities/session/model'
import { CreateReportForm } from '../../features/reports/create-report-form'
import { apiRequest } from '../../shared/api/http'
import { formatDateTime } from '../../shared/lib/format'
import {
  EmptyState,
  PageLayout,
  SectionCard,
  StatusBadge,
} from '../../shared/ui/primitives'

export function ReportsPage() {
  const { session } = useAppSession()

  const query = useQuery({
    queryKey: ['reports', session?.user.actorId ?? 'all'],
    queryFn: () =>
      apiRequest<ReportList>(
        session?.user.actorId
          ? `/api/reports?citizenId=${session.user.actorId}`
          : '/api/reports',
      ),
    enabled: !!session,
  })

  return (
    <PageLayout
      title="Signalements"
      description="Page citoyenne principale. Elle permet de soumettre un report et de relire les reports deja persistés."
    >
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <CreateReportForm />

        <SectionCard title="Mes signalements">
          {query.data?.items.length ? (
            <div className="grid gap-3">
              {query.data.items.map((report) => (
                <div
                  key={report.id}
                  className="rounded-md border border-slate-200 p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-950">
                        {report.theme}
                      </p>
                      <p className="text-sm text-slate-600">
                        {report.title || 'Sans titre'}
                      </p>
                    </div>
                    <StatusBadge value={report.status} />
                  </div>
                  <p className="mt-2 text-sm text-slate-700">
                    {report.content || 'Aucun contenu'}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Cree le {formatDateTime(report.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Aucun signalement"
              description="Commence par creer un premier report."
            />
          )}
        </SectionCard>
      </div>
    </PageLayout>
  )
}
