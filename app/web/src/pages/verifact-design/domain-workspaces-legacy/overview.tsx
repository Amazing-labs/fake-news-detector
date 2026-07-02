import { Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  ExternalLink,
  FileSearch,
  Paperclip,
  PenLine,
  RotateCcw,
} from 'lucide-react'
import {
  dashboardQueryKeys,
  getDashboardMetrics,
} from '@entities/dashboard/api'
import type { ActorMetrics } from '@entities/dashboard/model'
import { PageLoader } from '@shared/ui/loader'
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
import { EmptyState, MetaCell, StatCard, StatusBadge } from '../workspace-ui'
import {
  CitizenReportCreateWorkspacePage as CitizenReportCreateWorkspace,
  CitizenWorkspacePage as CitizenWorkspace,
} from '../workspaces/citizen-workspace-page'
import { DirectorHomePage as DirectorHomeWorkspace } from '../workspaces/director-home-page'
import {
  investigationQueryKeys,
  listInvestigations,
  submitInvestigationForReview,
} from '@entities/investigation/api'
import {
  listPublications,
  publicationQueryKeys,
} from '@entities/publication/api'
import {
  getReport,
  getReportMedia,
  reportQueryKeys,
} from '@entities/report/api'
import { toApiErrorMessage } from '@shared/api/http'
import { MediaPreviewItem } from './media-preview'
import { toPreviewMedia } from './media-preview-utils'
import { GuestHomePage } from './admin'

function useActorMetrics() {
  return useQuery({
    queryKey: dashboardQueryKeys.metrics(),
    queryFn: getDashboardMetrics,
  })
}

function metricsFor<P extends ActorMetrics['profile']>(
  data: ActorMetrics | null | undefined,
  profile: P,
): Extract<ActorMetrics, { profile: P }> | undefined {
  return data?.profile === profile
    ? (data as Extract<ActorMetrics, { profile: P }>)
    : undefined
}

function statValue(value: number | undefined) {
  return value == null ? '—' : String(value)
}

export function RoleAwareDashboardPage() {
  const { actor } = useResolvedActor('guest')

  if (actor === 'director') return <DirectorHomePage />
  if (actor === 'journalist') return <JournalistWorkspacePage />
  if (actor === 'watcher') return <WatcherWorkspacePage />
  if (actor === 'citizen') return <CitizenDashboardPage />

  return <GuestHomePage />
}

export function DirectorHomePage() {
  return <DirectorHomeWorkspace />
}

export function JournalistWorkspacePage() {
  const queryClient = useQueryClient()
  const { data } = useActorMetrics()
  const metrics = metricsFor(data, 'journalist')
  const inProgressQuery = useQuery({
    queryKey: investigationQueryKeys.list({ scope: 'in-progress' }),
    queryFn: () => listInvestigations({ scope: 'in-progress' }),
  })
  const currentInvestigation = inProgressQuery.data?.items[0]

  const submitMutation = useMutation({
    mutationFn: (investigationId: string) =>
      submitInvestigationForReview(investigationId),
    onSuccess: () => {
      toast.success('Dossier soumis en revue.')
      void queryClient.invalidateQueries({
        queryKey: investigationQueryKeys.all,
      })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (error) => toast.error(toApiErrorMessage(error)),
  })

  return (
    <AppLayout actor="journalist" page="dashboard">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Dossier courant"
          value={statValue(metrics?.currentDossiers)}
          hint="en responsabilite"
          icon={FileSearch}
        />
        <StatCard
          title="Etat du dossier"
          value={statValue(metrics?.pendingReviews)}
          hint="revue direction"
          icon={ClipboardCheck}
        />
        <StatCard
          title="Retours direction"
          value={statValue(metrics?.directorReturns)}
          hint="correction"
          icon={PenLine}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dossier en cours</CardTitle>
          <CardDescription>
            Un journaliste travaille un seul sujet actif, puis le soumet pour
            revue.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {currentInvestigation ? (
            <div className="grid gap-4 rounded-lg border p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">
                      {currentInvestigation.title ?? 'Sujet sans titre'}
                    </p>
                    <StatusBadge status={currentInvestigation.status} />
                  </div>
                  {currentInvestigation.subject && (
                    <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
                      {currentInvestigation.subject}
                    </p>
                  )}
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:w-80">
                  <Button size="sm" asChild>
                    <Link
                      to="/investigations/$investigationId"
                      params={{ investigationId: currentInvestigation.id }}
                    >
                      Ouvrir le brouillon
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      submitMutation.mutate(currentInvestigation.id)
                    }
                    loading={submitMutation.isPending}
                  >
                    Soumettre en revue
                  </Button>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-muted-foreground text-xs uppercase">
                    Verdict brouillon
                  </p>
                  <p className="mt-1 font-medium">
                    {currentInvestigation.draftVerdict
                      ? domainLabel(currentInvestigation.draftVerdict)
                      : '—'}
                  </p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-muted-foreground text-xs uppercase">
                    Catégorie
                  </p>
                  <p className="mt-1 font-medium">
                    {currentInvestigation.mediaCategory
                      ? domainLabel(currentInvestigation.mediaCategory)
                      : '—'}
                  </p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-muted-foreground text-xs uppercase">
                    Tentatives
                  </p>
                  <p className="mt-1 font-medium">
                    {currentInvestigation.attemptCount}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </AppLayout>
  )
}

export function CitizenWorkspacePage() {
  return <CitizenWorkspace />
}

export function CitizenReportCreateWorkspacePage() {
  return <CitizenReportCreateWorkspace />
}

export function ReportDetailWorkspacePage({ reportId }: { reportId: string }) {
  const { actor } = useResolvedActor('citizen')
  const reportQuery = useQuery({
    queryKey: reportQueryKeys.detail(reportId),
    queryFn: () => getReport(reportId),
    enabled: Boolean(reportId),
  })
  const mediaQuery = useQuery({
    queryKey: reportQueryKeys.media(reportId),
    queryFn: () => getReportMedia(reportId),
    enabled: Boolean(reportId),
  })
  const report = reportQuery.data
  const media = (mediaQuery.data?.items ?? []).map(toPreviewMedia)

  if (reportQuery.isPending) {
    return (
      <AppLayout actor={actor} page="reports">
        <PageLoader label="Chargement du signalement…" />
      </AppLayout>
    )
  }

  if (reportQuery.isError) {
    return (
      <AppLayout actor={actor} page="reports">
        <Card>
          <CardContent className="text-destructive pt-6">
            {toApiErrorMessage(reportQuery.error)}
          </CardContent>
        </Card>
      </AppLayout>
    )
  }

  if (!report) {
    return null
  }

  // The joined InboxSubject status is the richer editorial lifecycle the citizen
  // follows (OPEN -> IN_PROGRESS -> ARCHIVED); fall back to the binary report
  // status if the report was never converted into a subject.
  const lifecycle = report.subjectStatus ?? report.status
  const trackingSteps = [
    {
      title: 'Réception',
      body: 'Signalement reçu et conservé dans le desk.',
      done: true,
    },
    {
      title: 'En enquête',
      body: 'Un journaliste a ouvert un sujet et vérifie la rumeur.',
      done: lifecycle === 'IN_PROGRESS' || lifecycle === 'ARCHIVED',
    },
    {
      title: 'Retour',
      body: 'Une publication ou une archive a clôturé le signalement.',
      done: lifecycle === 'ARCHIVED',
    },
  ]

  return (
    <AppLayout actor={actor} page="reports">
      {/* Header card */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-lg font-semibold">{report.title}</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Historique du signalement et suivi éditorial.
              </p>
            </div>
            <StatusBadge status={lifecycle} />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <MetaCell label="Thème" value={report.theme} />
            <MetaCell label="Source" value={report.reporterName ?? '—'} />
            <MetaCell
              label="Dernière mise à jour"
              value={new Date(report.updatedAt).toLocaleDateString('fr-FR')}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">Contenu</TabsTrigger>
          <TabsTrigger value="media">Médias ({media.length})</TabsTrigger>
          <TabsTrigger value="tracking">Suivi</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Rumeur transmise</CardTitle>
              <CardDescription>
                Le texte exact soumis par le citoyen au moment du signalement.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {report.content}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="mt-4">
          {mediaQuery.isPending ? (
            <PageLoader label="Chargement des médias…" />
          ) : mediaQuery.isError ? (
            <Card>
              <CardContent className="text-destructive pt-6">
                {toApiErrorMessage(mediaQuery.error)}
              </CardContent>
            </Card>
          ) : media.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {media.map((item) => (
                <MediaPreviewItem key={item.name} item={item} canDownload />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Paperclip}
              title="Aucun média joint"
              description="Vous n'avez pas ajouté de média à ce signalement."
            />
          )}
        </TabsContent>

        <TabsContent value="tracking" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Suivi du desk</CardTitle>
              <CardDescription>
                Étapes de traitement depuis la réception jusqu'au retour.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {trackingSteps.map((step) => (
                <div key={step.title} className="flex gap-3">
                  {step.done ? (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  ) : (
                    <Circle className="text-muted-foreground/50 mt-0.5 size-4 shrink-0" />
                  )}
                  <div>
                    <p
                      className={
                        step.done
                          ? 'text-sm font-medium'
                          : 'text-muted-foreground text-sm font-medium'
                      }
                    >
                      {step.title}
                    </p>
                    <p className="text-muted-foreground text-sm">{step.body}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  )
}

export function CitizenDashboardPage() {
  const { data } = useActorMetrics()
  const metrics = metricsFor(data, 'citizen')
  const publicationsQuery = useQuery({
    queryKey: publicationQueryKeys.list(),
    queryFn: () => listPublications(),
  })
  const recentPublications = publicationsQuery.data?.items.slice(0, 3) ?? []

  return (
    <AppLayout actor="citizen" page="dashboard">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Signalements actifs"
          value={statValue(metrics?.activeReports)}
          hint="en suivi"
          icon={FileSearch}
        />
        <StatCard
          title="En attente de retour"
          value={statValue(metrics?.awaitingReply)}
          hint="a clarifier"
          icon={AlertTriangle}
        />
        <StatCard
          title="Retours recus"
          value={statValue(metrics?.repliesReceived)}
          hint="depuis la rédaction"
          icon={CheckCircle2}
        />
        <StatCard
          title="Corrections utiles"
          value={statValue(metrics?.corrections)}
          hint="publiees"
          icon={RotateCcw}
        />
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Retours publics</CardTitle>
            <CardDescription>
              Les publications et correctifs lies aux signalements verifies.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {recentPublications.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Aucun retour public pour le moment.
              </p>
            ) : null}
            {recentPublications.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-3 rounded-lg border p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {item.title ?? 'Publication sans titre'}
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Verdict: {domainLabel(item.finalVerdict)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground size-8 shrink-0 rounded-full"
                  asChild
                  aria-label={`Voir ${item.title ?? item.id}`}
                >
                  <Link
                    to="/publications/$publicationId"
                    params={{ publicationId: item.id }}
                  >
                    <ExternalLink className="size-4" />
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

export function WatcherWorkspacePage() {
  const { data } = useActorMetrics()
  const metrics = metricsFor(data, 'watcher')
  const investigationsQuery = useQuery({
    queryKey: investigationQueryKeys.list({ scope: 'contributable' }),
    queryFn: () => listInvestigations({ scope: 'contributable' }),
  })
  const enrichable = investigationsQuery.data?.items.slice(0, 3) ?? []

  return (
    <AppLayout actor="watcher" page="dashboard">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Enquêtes suivies"
          value={statValue(metrics?.followedInvestigations)}
          hint="actives"
          icon={FileSearch}
        />
        <StatCard
          title="Preuves soumises"
          value={statValue(metrics?.evidenceThisMonth)}
          hint="ce mois"
          icon={ClipboardCheck}
        />
        <StatCard
          title="Contributions acceptées"
          value={statValue(metrics?.acceptedContributions)}
          hint="validées"
          icon={CheckCircle2}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enquetes a enrichir</CardTitle>
          <CardDescription>
            Une vigie ajoute des preuves mais ne pilote pas l'enquête. Ouvre une
            enquête pour soumettre une contribution.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {enrichable.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Aucune enquête à enrichir pour le moment.
            </p>
          ) : null}
          {enrichable.map((item) => (
            <Link
              key={item.id}
              to="/investigations/$investigationId"
              params={{ investigationId: item.id }}
              className="hover:bg-muted/40 block rounded-lg border p-4 transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">
                  {item.title ?? 'Sujet sans titre'}
                </p>
                <Badge variant="outline">{domainLabel(item.status)}</Badge>
              </div>
              <p className="text-muted-foreground mt-2 text-sm">
                Ajouter média, contexte terrain et justification.
              </p>
            </Link>
          ))}
        </CardContent>
      </Card>
    </AppLayout>
  )
}
