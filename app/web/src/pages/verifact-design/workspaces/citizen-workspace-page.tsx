import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { FilePlus2, FileSearch } from 'lucide-react'
import { listReports, reportQueryKeys } from '@entities/report/api'
import { CreateReportForm } from '@features/reports/create-report-form'
import { LoadingRow } from '@shared/ui/loader'
import { Button } from '@shared/ui/shadcn/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/ui/shadcn/card'
import { AppLayout } from '../app-layout'
import { useResolvedActor } from '../session-routing'
import { DoubleBorderCard, EmptyState, ErrorState, StatusBadge } from '../workspace-ui'

export function CitizenWorkspacePage() {
  const { session } = useResolvedActor('citizen')
  const citizenId = session?.user.actorId ?? undefined
  const reportsQuery = useQuery({
    queryKey: reportQueryKeys.list({ citizenId }),
    queryFn: () => listReports({ citizenId }),
    enabled: !!citizenId,
  })
  const reportRows = reportsQuery.data?.items ?? []

  return (
    <AppLayout actor="citizen" page="reports">
      <div className="grid gap-6">
        <DoubleBorderCard>
          <Card className='pt-0'>
          <CardHeader className='bg-sidebar/20 p-2.5' >
            <CardTitle>Mes signalements</CardTitle>
            <CardDescription>
              Suivre les rumeurs transmises au desk et leur état éditorial.
            </CardDescription>
            <CardAction>
              <Button asChild size="sm">
                <Link to="/reports/create">
                  <FilePlus2 />
                  Nouveau signalement
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="grid gap-3">
            {reportsQuery.isPending ? (
              <LoadingRow label="Chargement des signalements…" />
            ) : reportsQuery.isError ? (
              <ErrorState error={reportsQuery.error} />
            ) : reportRows.length === 0 ? (
              <EmptyState
                icon={FileSearch}
                title="Aucun signalement pour le moment"
                description="Signalez un contenu douteux : il rejoint le desk et vous suivez son traitement ici."
              />
            ) : null}
            {reportRows.map((item) => (
              <div
                key={item.id}
                className="grid gap-3 rounded-lg border p-4 md:grid-cols-[1fr_auto]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{item.title}</p>
                    {/* Prefer the joined InboxSubject status: it captures the
                        IN_PROGRESS step the binary report status can't. */}
                    <StatusBadge status={item.subjectStatus ?? item.status} />
                  </div>
                  <p className="text-muted-foreground mt-2 text-sm">
                    {item.content}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="self-start"
                  asChild
                >
                  <Link to="/reports/$reportId" params={{ reportId: item.id }}>
                    Voir le suivi
                  </Link>
                </Button>
              </div>
            ))}
            </CardContent>
          </Card>
        </DoubleBorderCard>
      </div>
    </AppLayout>
  )
}

export function CitizenReportCreateWorkspacePage() {
  return (
    <AppLayout actor="citizen" page="reports">
      <CreateReportForm />
    </AppLayout>
  )
}
