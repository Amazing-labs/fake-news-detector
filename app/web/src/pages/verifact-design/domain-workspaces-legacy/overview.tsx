import { Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  FileSearch,
  PenLine,
  RotateCcw,
} from 'lucide-react'
import { Badge } from '../../../shared/ui/shadcn/badge'
import { Button } from '../../../shared/ui/shadcn/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../shared/ui/shadcn/card'
import { Input } from '../../../shared/ui/shadcn/input'
import { Label } from '../../../shared/ui/shadcn/label'
import { Textarea } from '../../../shared/ui/shadcn/textarea'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../shared/ui/shadcn/tabs'
import { AppLayout } from '../app-layout'
import { useResolvedActor } from '../session-routing'
import { domainLabel } from '../workspace-labels'
import { MetaCell, StatCard, StatusBadge } from '../workspace-ui'
import {
  CitizenReportCreateWorkspacePage as CitizenReportCreateWorkspace,
  CitizenWorkspacePage as CitizenWorkspace,
} from '../workspaces/citizen-workspace-page'
import { DirectorHomePage as DirectorHomeWorkspace } from '../workspaces/director-home-page'
import { investigations, publications, reports } from '../workspace-mocks'
import { GuestHomePage } from './admin'
import { slugifyLabel } from './utils'

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
  const currentInvestigation = investigations.find(
    (item) => item.status === 'PENDING_REVIEW',
  )

  return (
    <AppLayout actor="journalist" page="dashboard">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Dossier courant"
          value="1"
          hint="en responsabilite"
          icon={FileSearch}
        />
        <StatCard
          title="Etat du dossier"
          value="1"
          hint="revue direction"
          icon={ClipboardCheck}
        />
        <StatCard
          title="Retours direction"
          value="1"
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
                    <p className="font-medium">{currentInvestigation.title}</p>
                    <StatusBadge status={currentInvestigation.status} />
                  </div>
                  <p className="text-muted-foreground mt-2 text-sm">
                    {currentInvestigation.category} /{' '}
                    {currentInvestigation.evidence}
                  </p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:w-80">
                  <Button size="sm" asChild>
                    <Link
                      to="/investigations/$investigationId"
                      params={{
                        investigationId: slugifyLabel(
                          currentInvestigation.title,
                        ),
                      }}
                    >
                      Ouvrir le brouillon
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline">
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
                    {domainLabel(currentInvestigation.verdict)}
                  </p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-muted-foreground text-xs uppercase">
                    Sources
                  </p>
                  <p className="mt-1 font-medium">
                    {currentInvestigation.evidence}
                  </p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-muted-foreground text-xs uppercase">
                    Prochaine etape
                  </p>
                  <p className="mt-1 font-medium">Revue direction</p>
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
  const report = reports.find((item) => slugifyLabel(item.title) === reportId)

  if (!report) {
    return null
  }

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
            <StatusBadge status={report.status} />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <MetaCell label="Thème" value={report.theme} />
            <MetaCell label="Source" value={report.reporter} />
            <MetaCell label="Dernière mise à jour" value="16 mai 2026" />
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">Contenu</TabsTrigger>
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

        <TabsContent value="tracking" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Suivi du desk</CardTitle>
              <CardDescription>
                Étapes de traitement depuis la réception jusqu'au retour.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {[
                ['Réception', 'Signalement reçu et conservé dans le desk.'],
                [
                  'Qualification',
                  'Le desk vérifie si un sujet doit être ouvert.',
                ],
                [
                  'Retour',
                  'Une publication ou une archive sera rattachée ici.',
                ],
              ].map(([title, body]) => (
                <div key={title} className="flex gap-3">
                  <CheckCircle2 className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-muted-foreground text-sm">{body}</p>
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
  return (
    <AppLayout actor="citizen" page="dashboard">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Signalements actifs"
          value="2"
          hint="en suivi"
          icon={FileSearch}
        />
        <StatCard
          title="En attente de retour"
          value="1"
          hint="a clarifier"
          icon={AlertTriangle}
        />
        <StatCard
          title="Retours recus"
          value="4"
          hint="depuis la rédaction"
          icon={CheckCircle2}
        />
        <StatCard
          title="Corrections utiles"
          value="3"
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
            {publications.slice(0, 3).map((item) => {
              const publicationId = slugifyLabel(item.title)

              return (
                <div
                  key={item.title}
                  className="flex items-start justify-between gap-3 rounded-lg border p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.title}</p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Verdict: {domainLabel(item.verdict)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground size-8 shrink-0 rounded-full"
                    asChild
                    aria-label={`Voir ${item.title}`}
                  >
                    <Link
                      to="/publications/$publicationId"
                      params={{ publicationId }}
                    >
                      <ExternalLink className="size-4" />
                    </Link>
                  </Button>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

export function WatcherWorkspacePage() {
  return (
    <AppLayout actor="watcher" page="dashboard">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Enquêtes suivies"
          value="3"
          hint="actives"
          icon={FileSearch}
        />
        <StatCard
          title="Preuves soumises"
          value="7"
          hint="ce mois"
          icon={ClipboardCheck}
        />
        <StatCard
          title="Contributions acceptées"
          value="5"
          hint="validées"
          icon={CheckCircle2}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Enquetes a enrichir</CardTitle>
            <CardDescription>
              Une vigie ajoute des preuves mais ne pilote pas l'enquête.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {investigations.slice(0, 3).map((item) => (
              <div key={item.title} className="rounded-lg border p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{item.title}</p>
                  <Badge variant="outline">{domainLabel(item.category)}</Badge>
                </div>
                <p className="text-muted-foreground mt-2 text-sm">
                  Ajouter média, contexte terrain et justification.
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Soumettre une preuve</CardTitle>
            <CardDescription>
              Les medias devront etre classes avant la revue editoriale.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Label className="grid gap-2">
              Titre
              <Input placeholder="Source locale, image, lien..." />
            </Label>
            <Label className="grid gap-2">
              Observation
              <Textarea placeholder="Ce que la preuve confirme ou ecarte" />
            </Label>
            <Button className="w-fit">Ajouter la preuve</Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
