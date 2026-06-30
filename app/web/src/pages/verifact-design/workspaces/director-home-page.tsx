import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  FilePlus2,
  Gavel,
  Inbox,
  Loader2,
  UserCheck,
  Users,
} from 'lucide-react'
import {
  dashboardQueryKeys,
  getDashboardMetrics,
} from '@entities/dashboard/api'
import {
  investigationQueryKeys,
  listInvestigations,
} from '@entities/investigation/api'
import {
  listWatcherApplications,
  watcherApplicationQueryKeys,
} from '@entities/watcher-application/api'
import { toApiErrorMessage } from '@shared/api/http'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared/ui/shadcn/table'
import { AppLayout } from '../app-layout'
import { domainLabel } from '../workspace-labels'
import { StatCard, StatusBadge } from '../workspace-ui'

export function DirectorHomePage() {
  const pendingReviewsQuery = useQuery({
    queryKey: investigationQueryKeys.list({ scope: 'pending-review' }),
    queryFn: () => listInvestigations({ scope: 'pending-review' }),
  })
  const watcherApplicationsQuery = useQuery({
    queryKey: watcherApplicationQueryKeys.list(),
    queryFn: listWatcherApplications,
  })
  const metricsQuery = useQuery({
    queryKey: dashboardQueryKeys.metrics(),
    queryFn: getDashboardMetrics,
  })
  const metrics =
    metricsQuery.data?.profile === 'director' ? metricsQuery.data : undefined
  const pendingInvestigations = pendingReviewsQuery.data?.items ?? []
  const watcherApplications = watcherApplicationsQuery.data?.items ?? []
  const pendingWatcherApplications = watcherApplications.filter(
    (application) => application.status === 'PENDING',
  )
  const statValue = (value: number | undefined) =>
    value == null ? '—' : String(value)

  return (
    <AppLayout actor="director" page="dashboard">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="À arbitrer"
          value={String(pendingReviewsQuery.data?.total ?? 0)}
          hint="revue direction"
          icon={Gavel}
        />
        <StatCard
          title="Candidatures vigies"
          value={String(pendingWatcherApplications.length)}
          hint="en attente"
          icon={UserCheck}
        />
        <StatCard
          title="Enquêtes en cours"
          value={statValue(metrics?.inProgressInvestigations)}
          hint="actives"
          icon={Loader2}
        />
        <StatCard
          title="Sujets ouverts"
          value={statValue(metrics?.openSubjects)}
          hint="inbox"
          icon={Inbox}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revue des enquêtes</CardTitle>
          <CardDescription>
            Les actions visibles suivent les permissions du directeur de
            publication.
          </CardDescription>
          <CardAction className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <Link to="/inbox-subjects/create">
                <FilePlus2 />
                Nouveau sujet
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/watcher-applications">
                <UserCheck />
                Candidatures
              </Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dossier</TableHead>
                <TableHead>Verdict</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingReviewsQuery.isPending ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <LoadingRow label="Chargement des enquêtes…" />
                  </TableCell>
                </TableRow>
              ) : null}
              {pendingReviewsQuery.isError ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-destructive">
                    {toApiErrorMessage(pendingReviewsQuery.error)}
                  </TableCell>
                </TableRow>
              ) : null}
              {!pendingReviewsQuery.isPending &&
              pendingInvestigations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    Aucune enquête en revue direction.
                  </TableCell>
                </TableRow>
              ) : null}
              {pendingInvestigations.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.inboxSubjectId}
                  </TableCell>
                  <TableCell>
                    {item.draftVerdict ? domainLabel(item.draftVerdict) : '-'}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" asChild>
                      <Link to="/investigations">Ouvrir</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="bg-muted/30 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Gestion des acteurs</p>
              <p className="text-muted-foreground text-xs">
                Comptes journalistes, citoyens et vigies restent accessibles
                depuis la file utilisateurs.
              </p>
            </div>
            <Button asChild size="sm" variant="ghost">
              <Link to="/journalists/list">
                <Users />
                Utilisateurs
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  )
}
