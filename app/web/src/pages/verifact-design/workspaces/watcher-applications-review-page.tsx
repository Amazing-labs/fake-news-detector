import { Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  CheckCircle2,
  ExternalLink,
  FilePlus2,
  FileSearch,
  History,
  UserCheck,
} from 'lucide-react'
import {
  investigationQueryKeys,
  listInvestigations,
} from '@entities/investigation/api'
import {
  approveWatcherApplication,
  listWatcherApplications,
  rejectWatcherApplication,
  watcherApplicationQueryKeys,
} from '@entities/watcher-application/api'
import { WatcherApplicationForm } from '@features/watcher-applications/watcher-application-form'
import { toApiErrorMessage } from '@shared/api/http'
import { LoadingRow, PageLoader } from '@shared/ui/loader'
import { Button } from '@shared/ui/shadcn/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/ui/shadcn/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shared/ui/shadcn/tabs'
import { AppLayout } from '../app-layout'
import { useResolvedActor } from '../session-routing'
import { EmptyState, ErrorState, StatusBadge } from '../workspace-ui'

export function WatcherApplicationsReviewPage() {
  const { actor, isActorPending } = useResolvedActor('citizen')
  const queryClient = useQueryClient()
  const applicationsQuery = useQuery({
    queryKey: watcherApplicationQueryKeys.list(),
    queryFn: listWatcherApplications,
    enabled: actor === 'director',
  })
  const decisionMutation = useMutation({
    mutationFn: (input: { id: string; decision: 'approve' | 'reject' }) =>
      input.decision === 'approve'
        ? approveWatcherApplication(input.id)
        : rejectWatcherApplication(input.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: watcherApplicationQueryKeys.all,
      })
    },
    onError: (error) => toast.error(toApiErrorMessage(error)),
  })
  const applications = applicationsQuery.data?.items ?? []
  const pendingApplications = applications.filter(
    (item) => item.status === 'PENDING',
  )
  const decidedApplications = applications.filter(
    (item) => item.status !== 'PENDING',
  )

  if (isActorPending) {
    return (
      <AppLayout actor="guest" page="people">
        <PageLoader label="Chargement de la session…" />
      </AppLayout>
    )
  }

  if (actor === 'watcher') {
    return <WatcherContributionWorkspacePage />
  }

  if (actor === 'citizen') {
    return <WatcherApplicationWorkspacePage />
  }

  return (
    <AppLayout actor="director" page="people">
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Candidatures</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardContent className="grid gap-3 p-5">
              {applicationsQuery.isPending ? (
                <LoadingRow label="Chargement des candidatures…" />
              ) : applicationsQuery.isError ? (
                <ErrorState error={applicationsQuery.error} />
              ) : pendingApplications.length === 0 ? (
                <EmptyState
                  icon={UserCheck}
                  title="Aucune candidature à traiter"
                  description="Les demandes de statut vigie déposées par les citoyens arriveront ici."
                />
              ) : null}
              {pendingApplications.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-3 rounded-lg border p-4 md:grid-cols-[1fr_auto]"
                >
                  <div>
                    <p className="font-medium">
                      {item.applicantName ?? `Candidature #${item.id}`}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {item.motivation}
                    </p>
                    <div className="mt-2">
                      <StatusBadge status={item.status} />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      disabled={decisionMutation.isPending}
                      loading={
                        decisionMutation.isPending &&
                        decisionMutation.variables?.id === item.id &&
                        decisionMutation.variables?.decision === 'approve'
                      }
                      onClick={() =>
                        decisionMutation.mutate({
                          id: item.id,
                          decision: 'approve',
                        })
                      }
                    >
                      {!(
                        decisionMutation.isPending &&
                        decisionMutation.variables?.id === item.id &&
                        decisionMutation.variables?.decision === 'approve'
                      ) && <CheckCircle2 />}
                      Approuver
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={decisionMutation.isPending}
                      loading={
                        decisionMutation.isPending &&
                        decisionMutation.variables?.id === item.id &&
                        decisionMutation.variables?.decision === 'reject'
                      }
                      onClick={() =>
                        decisionMutation.mutate({
                          id: item.id,
                          decision: 'reject',
                        })
                      }
                    >
                      Rejeter
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardContent className="grid gap-3 p-5">
              {applicationsQuery.isPending ? (
                <LoadingRow label="Chargement de l'historique…" />
              ) : applicationsQuery.isError ? (
                <ErrorState error={applicationsQuery.error} />
              ) : decidedApplications.length === 0 ? (
                <EmptyState
                  icon={History}
                  title="Aucune décision passée"
                  description="Les candidatures approuvées ou rejetées seront archivées ici."
                />
              ) : null}
              {decidedApplications.map((item) => (
                <div key={item.id} className="grid gap-2 rounded-lg border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">
                      {item.applicantName ?? `Candidature #${item.id}`}
                    </p>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {item.motivation}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {new Date(item.updatedAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  )
}

function WatcherApplicationWorkspacePage() {
  return (
    <AppLayout actor="citizen" page="reports">
      <WatcherApplicationForm />
    </AppLayout>
  )
}

function WatcherContributionWorkspacePage() {
  const investigationsQuery = useQuery({
    queryKey: investigationQueryKeys.list({ scope: 'contributable' }),
    queryFn: () => listInvestigations({ scope: 'contributable' }),
  })
  const activeInvestigations = investigationsQuery.data?.items ?? []

  return (
    <AppLayout actor="watcher" page="reports">
      <Card>
        <CardHeader>
          <CardTitle>Espace vigie</CardTitle>
          <CardDescription>
            Contribue aux enquetes ouvertes ou en révision avec des preuves,
            liens et observations terrain.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {investigationsQuery.isPending ? (
            <LoadingRow label="Chargement des enquêtes…" />
          ) : investigationsQuery.isError ? (
            <ErrorState error={investigationsQuery.error} />
          ) : activeInvestigations.length === 0 ? (
            <EmptyState
              icon={FileSearch}
              title="Aucune enquête à enrichir"
              description="Les enquêtes ouvertes à contribution apparaîtront ici."
            />
          ) : null}
          {activeInvestigations.map((item) => (
            <div
              key={item.id}
              className="grid gap-4 rounded-lg border p-4 md:grid-cols-[1fr_auto]"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">
                    {item.title ?? 'Sujet sans titre'}
                  </p>
                  <StatusBadge status={item.status} />
                </div>
                {item.subject && (
                  <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                    {item.subject}
                  </p>
                )}
                <p className="text-muted-foreground mt-3 text-sm">
                  Ajoute un contexte local, une source, un média ou une note qui
                  aide le journaliste a consolider le dossier.
                </p>
              </div>
              <div className="flex flex-wrap items-start gap-2 md:justify-end">
                <Button size="sm" variant="outline" asChild>
                  <Link
                    to="/investigations/$investigationId"
                    params={{ investigationId: item.id }}
                  >
                    <ExternalLink />
                    Voir le dossier
                  </Link>
                </Button>
                <Button size="sm">
                  <FilePlus2 />
                  Contribuer
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </AppLayout>
  )
}
