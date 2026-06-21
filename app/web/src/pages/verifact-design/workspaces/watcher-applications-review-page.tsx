import { Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, ExternalLink, FilePlus2 } from 'lucide-react'
import {
  approveWatcherApplication,
  listWatcherApplications,
  rejectWatcherApplication,
  watcherApplicationQueryKeys,
} from '@entities/watcher-application/api'
import { WatcherApplicationForm } from '@features/watcher-applications/watcher-application-form'
import { toApiErrorMessage } from '@shared/api/http'
import { Badge } from '@shared/ui/shadcn/badge'
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
import { domainLabel } from '../workspace-labels'
import { investigations } from '../workspace-mocks'
import { StatusBadge } from '../workspace-ui'

function slugifyLabel(label: string) {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

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
  })
  const applications = applicationsQuery.data?.items ?? []
  const pendingApplications = applications.filter(
    (item) => item.status === 'PENDING',
  )

  if (isActorPending) {
    return (
      <AppLayout actor="guest" page="people">
        <Card role="status" aria-live="polite" aria-busy="true">
          <CardHeader>
            <CardTitle>Vérification de session</CardTitle>
            <CardDescription>
              Lecture du rôle avant d’afficher l’espace vigie.
            </CardDescription>
          </CardHeader>
        </Card>
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
      <Card>
        <CardHeader>
          <CardTitle>Espace vigie</CardTitle>
          <CardDescription>
            Valider les candidatures et garder une trace des decisions.
          </CardDescription>
        </CardHeader>
      </Card>
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Candidatures</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardContent className="grid gap-3 p-5">
              {applicationsQuery.isPending ? (
                <p className="text-muted-foreground text-sm">
                  Chargement des candidatures...
                </p>
              ) : null}
              {applicationsQuery.isError ? (
                <p className="text-destructive text-sm">
                  {toApiErrorMessage(applicationsQuery.error)}
                </p>
              ) : null}
              {!applicationsQuery.isPending &&
              pendingApplications.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Aucune candidature vigie.
                </p>
              ) : null}
              {pendingApplications.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-3 rounded-lg border p-4 md:grid-cols-[1fr_auto]"
                >
                  <div>
                    <p className="font-medium">Candidature #{item.id}</p>
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
                      onClick={() =>
                        decisionMutation.mutate({
                          id: item.id,
                          decision: 'approve',
                        })
                      }
                    >
                      <CheckCircle2 />
                      Approuver
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={decisionMutation.isPending}
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
              {decisionMutation.isError ? (
                <p className="text-destructive text-sm">
                  {toApiErrorMessage(decisionMutation.error)}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-muted-foreground text-sm">
                Decisions passees, refus motives et approbations de vigies.
              </p>
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
  const activeInvestigations = investigations.filter((item) =>
    ['IN_PROGRESS', 'NEEDS_REVISION'].includes(item.status),
  )

  return (
    <AppLayout actor="watcher" page="reports">
      <Card>
        <CardHeader>
          <CardTitle>Espace vigie</CardTitle>
          <CardDescription>
            Contribue aux enquetes en cours avec des preuves, liens et
            observations terrain.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {activeInvestigations.map((item) => (
            <div
              key={item.title}
              className="grid gap-4 rounded-lg border p-4 md:grid-cols-[1fr_auto]"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{item.title}</p>
                  <Badge variant="secondary">{domainLabel(item.status)}</Badge>
                </div>
                <p className="text-muted-foreground mt-1 text-sm">
                  {item.category} / {item.evidence}
                </p>
                <p className="text-muted-foreground mt-3 text-sm">
                  Ajoute un contexte local, une source, un média ou une note qui
                  aide le journaliste a consolider le dossier.
                </p>
              </div>
              <div className="flex flex-wrap items-start gap-2 md:justify-end">
                <Button size="sm" variant="outline" asChild>
                  <Link
                    to="/investigations/$investigationId"
                    params={{ investigationId: slugifyLabel(item.title) }}
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
