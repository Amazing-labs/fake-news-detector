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
      description="Page citoyenne principale. Elle permet de soumettre un report et de relire les reports deja persistes."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.45fr)]">
        <CreateReportForm />

        <SectionCard title="Mes signalements">
          {query.data?.items.length ? (
            <div className="grid gap-3">
              {query.data.items.map((report) => (
                <div
                  key={report.id}
                  className="rounded-[1.15rem] border border-[#eee9e2] bg-[#fbfaf8] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-black tracking-[-0.015em] text-[#171514]">
                        {report.theme}
                      </p>
                      <p className="text-sm leading-6 text-[#706a63]">
                        {report.title || 'Sans titre'}
                      </p>
                    </div>
                    <StatusBadge value={report.status} />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#706a63]">
                    {report.content || 'Aucun contenu'}
                  </p>
                  <p className="mt-3 text-xs font-bold text-[#918a83]">
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
