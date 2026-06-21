import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { FilePlus2 } from 'lucide-react'
import { listReports, reportQueryKeys } from '@entities/report/api'
import { CreateReportForm } from '@features/reports/create-report-form'
import { toApiErrorMessage } from '@shared/api/http'
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
import { StatusBadge } from '../workspace-ui'

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
        <Card>
          <CardHeader>
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
              <p className="text-muted-foreground text-sm">
                Chargement des signalements...
              </p>
            ) : null}
            {reportsQuery.isError ? (
              <p className="text-destructive text-sm">
                {toApiErrorMessage(reportsQuery.error)}
              </p>
            ) : null}
            {!reportsQuery.isPending && reportRows.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Aucun signalement pour le moment.
              </p>
            ) : null}
            {reportRows.map((item) => (
              <div
                key={item.id}
                className="grid gap-3 rounded-lg border p-4 md:grid-cols-[1fr_auto]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{item.title}</p>
                    <StatusBadge status={item.status} />
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
