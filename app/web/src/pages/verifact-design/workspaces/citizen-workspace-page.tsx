import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Clock, FilePlus2, FileSearch, Inbox, Archive } from 'lucide-react'
import { listReports, reportQueryKeys } from '@entities/report/api'
import { CreateReportForm } from '@features/reports/create-report-form'
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
import { DoubleBorderCard, EmptyState, ErrorState, StatCard, StatusBadge } from '../workspace-ui'

function relativeTime(dateStr: string): string {
  const now = Date.now()
  const diff = now - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "à l'instant"
  if (minutes < 60) return `il y a ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `il y a ${days}j`
  const months = Math.floor(days / 30)
  return `il y a ${months}mois`
}

export function CitizenWorkspacePage() {
  const { session } = useResolvedActor('citizen')
  const citizenId = session?.user.actorId ?? undefined
  const reportsQuery = useQuery({
    queryKey: reportQueryKeys.list({ citizenId }),
    queryFn: () => listReports({ citizenId }),
    enabled: !!citizenId,
  })
  const reportRows = reportsQuery.data?.items ?? []

  const openCount = reportRows.filter(
    (r) => (r.subjectStatus ?? r.status) === 'OPEN' || r.status === 'PENDING',
  ).length
  const inProgressCount = reportRows.filter(
    (r) => (r.subjectStatus ?? r.status) === 'IN_PROGRESS',
  ).length
  const archivedCount = reportRows.filter(
    (r) => (r.subjectStatus ?? r.status) === 'ARCHIVED',
  ).length

  return (
    <AppLayout actor="citizen" page="reports">
      <div className="grid gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            title="En attente"
            value={String(openCount)}
            hint="signalements ouverts"
            icon={Clock}
          />
          <StatCard
            title="En cours"
            value={String(inProgressCount)}
            hint="enquetes en cours"
            icon={Inbox}
          />
          <StatCard
            title="Archivés"
            value={String(archivedCount)}
            hint="signalements clos"
            icon={Archive}
          />
        </div>

        <DoubleBorderCard>
          <Card className="pt-0">
            <CardHeader className="bg-sidebar/20 p-2.5">
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
                <div className="grid gap-3">
                  <div className="bg-muted h-16 animate-pulse rounded-lg" />
                  <div className="bg-muted h-16 animate-pulse rounded-lg" />
                </div>
              ) : reportsQuery.isError ? (
                <ErrorState error={reportsQuery.error} />
              ) : reportRows.length === 0 ? (
                <EmptyState
                  icon={FileSearch}
                  title="Aucun signalement pour le moment"
                  description="Signalez un contenu douteux : il rejoint le desk et vous suivez son traitement ici."
                />
              ) : (
                reportRows.map((item, i) => (
                  <Link
                    key={item.id}
                    style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
                    to="/reports/$reportId"
                    params={{ reportId: item.id }}
                    className="animate-slide-up motion-reduce:animate-none border-border/60 hover:border-border hover:bg-muted/30 grid gap-3 rounded-lg border p-4 transition-all hover:shadow-sm active:scale-[0.99] md:grid-cols-[1fr_auto]"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{item.title}</p>
                        <StatusBadge status={item.subjectStatus ?? item.status} />
                      </div>
                      <p className="text-muted-foreground mt-1 text-sm line-clamp-2">
                        {item.content}
                      </p>
                      <p className="text-muted-foreground/60 mt-1.5 flex flex-wrap items-center gap-3 text-xs">
                        <span>{relativeTime(item.createdAt)}</span>
                        <span className="hover:text-foreground inline-flex items-center gap-1 transition-colors">
                          Voir le suivi →
                        </span>
                      </p>
                    </div>
                  </Link>
                ))
              )}
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
