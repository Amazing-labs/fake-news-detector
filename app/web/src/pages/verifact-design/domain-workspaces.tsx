import { Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  Archive,
  BadgeCheck,
  Ban,
  CheckCircle2,
  ClipboardCheck,
  Download,
  ExternalLink,
  FilePlus2,
  FileSearch,
  FileText,
  Link2,
  PenLine,
  Play,
  RotateCcw,
  ShieldCheck,
  Trash2,
  XCircle,
} from 'lucide-react'
import { useRef, useState, type DragEvent, type ReactNode } from 'react'
import { cn } from '../../shared/lib/utils'
import { Badge } from '../../shared/ui/shadcn/badge'
import { Button } from '../../shared/ui/shadcn/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../shared/ui/shadcn/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../shared/ui/shadcn/dialog'
import { Input } from '../../shared/ui/shadcn/input'
import { Label } from '../../shared/ui/shadcn/label'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../shared/ui/shadcn/tabs'
import { Textarea } from '../../shared/ui/shadcn/textarea'
import { AppLayout } from './app-layout'
import { useResolvedActor } from './session-routing'
import { domainLabel } from './workspace-labels'
import { StatCard, StatusBadge } from './workspace-ui'
import {
  CitizenReportCreateWorkspacePage as CitizenReportCreateWorkspace,
  CitizenWorkspacePage as CitizenWorkspace,
} from './workspaces/citizen-workspace-page'
import { DirectorHomePage as DirectorHomeWorkspace } from './workspaces/director-home-page'
import {
  PeopleManagementPage as PeopleManagementWorkspace,
  UserCreateWorkspacePage as UserCreateWorkspace,
} from './workspaces/people-management-page'
import { WatcherApplicationsReviewPage as WatcherApplicationsReviewWorkspace } from './workspaces/watcher-applications-review-page'
import {
  NotificationDetailWorkspacePage as NotificationDetailWorkspace,
  NotificationsWorkspacePage as NotificationsWorkspace,
} from './workspaces/notifications-workspace-page'
import {
  inboxSubjects,
  investigations,
  publications,
  reports,
} from './workspace-mocks'

function slugifyLabel(label: string) {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function ArbitrationReasonDialog({
  action,
  children,
  tone = 'default',
}: {
  action: string
  children: ReactNode
  tone?: 'default' | 'destructive'
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{action}</DialogTitle>
          <DialogDescription>
            Indique la raison editoriale avant de poursuivre cette action.
          </DialogDescription>
        </DialogHeader>
        <Label className="grid gap-2">
          Raison
          <Textarea
            required
            placeholder="Explique la raison de cette decision..."
          />
        </Label>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          <Button variant={tone === 'destructive' ? 'destructive' : 'default'}>
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function PublishInvestigationDialog({ children }: { children: ReactNode }) {
  const [withEvidence, setWithEvidence] = useState(false)

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) setWithEvidence(false)
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Publier le dossier</DialogTitle>
          <DialogDescription>
            Voulez-vous ajouter des preuves supplementaires pour renforcer la
            publication future ?
          </DialogDescription>
        </DialogHeader>

        {withEvidence ? (
          <div className="grid gap-4">
            <div className="rounded-lg border p-4">
              <p className="font-medium">Lien vérifié</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Ces liens seront rattaches a la publication creee par
                l'approbation.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Label className="grid gap-2 sm:col-span-2">
                  URL
                  <Input placeholder="https://source-officielle.example" />
                </Label>
                <Label className="grid gap-2">
                  Source d'autorité
                  <Input placeholder="Nom de la source" />
                </Label>
                <Label className="grid gap-2">
                  Type de source
                  <Input placeholder="Declaration officielle" />
                </Label>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <p className="font-medium">Média vérifié</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Le backend attend une URL, un type de média et, si utile, une
                source d'autorité.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Label className="grid gap-2 sm:col-span-2">
                  URL du média
                  <Input placeholder="https://source-officielle.example/preuve.jpg" />
                </Label>
                <Label className="grid gap-2">
                  Type de média
                  <Input placeholder="Image, video, document..." />
                </Label>
                <Label className="grid gap-2">
                  Source rattachee
                  <Input placeholder="Archive officielle" />
                </Label>
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          {withEvidence ? (
            <Button>
              <BadgeCheck />
              Publier avec preuves
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setWithEvidence(true)}>
                Oui, ajouter des preuves
              </Button>
              <Button>
                <BadgeCheck />
                Non, publier
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function MediaDropzone({
  inputId = 'media-upload',
  description = 'Images, videos, audio, PDF ou documents utiles au desk.',
}: {
  inputId?: string
  description?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])

  const addFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return
    setFiles((currentFiles) => [...currentFiles, ...Array.from(fileList)])
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setIsDragging(false)
    addFiles(event.dataTransfer.files)
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Médias</p>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
        {files.length ? (
          <Badge variant="secondary" className="shrink-0 rounded-full">
            {files.length} fichier{files.length > 1 ? 's' : ''}
          </Badge>
        ) : null}
      </div>

      <Label
        htmlFor={inputId}
        onDragEnter={(event: DragEvent<HTMLLabelElement>) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragOver={(event: DragEvent<HTMLLabelElement>) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'border-border bg-background/40 hover:bg-muted/40 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-7 text-center transition-colors',
          isDragging && 'border-primary bg-primary/10',
        )}
      >
        <FilePlus2 className="text-muted-foreground size-6" />
        <span className="mt-3 text-sm font-medium">Glisse les medias ici</span>
        <span className="text-muted-foreground mt-1 text-sm">
          ou clique pour les selectionner
        </span>
        <Input
          ref={inputRef}
          id={inputId}
          type="file"
          multiple
          accept="image/*,video/*,audio/*,application/pdf,text/plain"
          className="sr-only"
          onChange={(event) => addFiles(event.target.files)}
        />
      </Label>

      {files.length ? (
        <div className="grid gap-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${file.size}-${index}`}
              className="bg-muted/30 flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm"
            >
              <span className="truncate">{file.name}</span>
              <span className="text-muted-foreground shrink-0">
                {Math.max(1, Math.round(file.size / 1024))} Ko
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
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
  const report =
    reports.find((item) => slugifyLabel(item.title) === reportId) ?? reports[0]

  return (
    <AppLayout actor={actor} page="reports">
      <Card>
        <CardHeader>
          <CardTitle>{report.title}</CardTitle>
          <CardDescription>
            Historique du signalement et suivi éditorial.
          </CardDescription>
          <CardAction>
            <StatusBadge status={report.status} />
          </CardAction>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-muted-foreground text-xs font-medium uppercase">
                Theme
              </p>
              <p className="mt-1 font-medium">{report.theme}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-muted-foreground text-xs font-medium uppercase">
                Source
              </p>
              <p className="mt-1 font-medium">{report.reporter}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-muted-foreground text-xs font-medium uppercase">
                Derniere mise a jour
              </p>
              <p className="mt-1 font-medium">16 mai 2026</p>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <p className="font-medium">Rumeur transmise</p>
            <p className="text-muted-foreground mt-2 text-sm">
              {report.content}
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <p className="font-medium">Suivi du desk</p>
            <div className="mt-4 grid gap-3">
              {[
                ['Reception', 'Signalement recu et conserve dans le desk.'],
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
                  <CheckCircle2 className="text-muted-foreground mt-0.5 size-4" />
                  <div>
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-muted-foreground text-sm">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
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
    <AppLayout actor="watcher" page="reports">
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

export function ReportsWorkspacePage() {
  const { actor } = useResolvedActor('director')

  if (actor === 'citizen') return <CitizenWorkspacePage />

  return (
    <AppLayout actor="director" page="reports">
      <Card>
        <CardHeader>
          <CardTitle>Signalements citoyens</CardTitle>
          <CardDescription>
            Transformer les alertes utiles en sujets ou archiver les doublons.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {reports.map((item) => (
            <div
              key={item.title}
              className="grid gap-4 rounded-lg border p-4 lg:grid-cols-[1fr_auto]"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{item.title}</p>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-muted-foreground mt-1 text-sm">
                  {item.theme} / {item.reporter}
                </p>
                <p className="mt-3 text-sm">{item.content}</p>
              </div>
              <div className="flex flex-wrap items-start gap-2">
                <Button size="sm">Créer un sujet</Button>
                <Button size="sm" variant="outline">
                  Archiver
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </AppLayout>
  )
}

export function InboxWorkspacePage({
  defaultTab = 'global',
}: {
  defaultTab?: 'global' | 'director' | 'reports'
}) {
  const { actor } = useResolvedActor('director')
  const canManageSubjects = actor === 'director'

  return (
    <AppLayout actor="director" page="subjects">
      <Tabs defaultValue={defaultTab}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="global">Global</TabsTrigger>
            {canManageSubjects ? (
              <TabsTrigger value="director">Création direction</TabsTrigger>
            ) : null}
            <TabsTrigger value="reports">Signalements</TabsTrigger>
          </TabsList>
          {canManageSubjects ? (
            <Button asChild>
              <Link to="/inbox-subjects/create">
                <FilePlus2 />
                Nouveau sujet
              </Link>
            </Button>
          ) : null}
        </div>
        <TabsContent value="global" className="mt-4">
          <InboxList filter="all" actor={actor} />
        </TabsContent>
        {canManageSubjects ? (
          <TabsContent value="director" className="mt-4">
            <InboxList filter="DIRECTOR_INITIATED" actor={actor} />
          </TabsContent>
        ) : null}
        <TabsContent value="reports" className="mt-4">
          <InboxList filter="REPORT" actor={actor} />
        </TabsContent>
      </Tabs>
    </AppLayout>
  )
}

export function InboxCreateWorkspacePage() {
  const { actor } = useResolvedActor('director')

  return (
    <AppLayout actor="director" page="subjects">
      {actor === 'director' ? (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Nouveau sujet direction</CardTitle>
              <CardDescription>
                Un sujet créé par la direction entre directement dans l'inbox.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Label className="grid gap-2">
                Theme
                <Input placeholder="Thème éditorial" />
              </Label>
              <Label className="grid gap-2">
                Contexte
                <Textarea placeholder="Pourquoi le desk doit ouvrir ce sujet" />
              </Label>
              <MediaDropzone
                inputId="director-subject-media"
                description="Images, videos, audio, PDF ou documents utiles au desk."
              />
              <Button className="w-fit">Créer le sujet</Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <InboxList filter="all" actor={actor} />
      )}
    </AppLayout>
  )
}

function InboxList(props: {
  filter: 'all' | 'REPORT' | 'DIRECTOR_INITIATED'
  actor: 'guest' | 'citizen' | 'watcher' | 'journalist' | 'director' | 'admin'
}) {
  const rows =
    props.filter === 'all'
      ? inboxSubjects
      : inboxSubjects.filter((item) =>
          props.filter === 'REPORT'
            ? item.origin === 'Signalement citoyen'
            : item.origin === 'Création direction',
        )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sujets disponibles</CardTitle>
        <CardDescription>
          Les sujets ouverts peuvent etre pris par un journaliste actif.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {rows.map((item) => {
          const detailId = slugifyLabel(item.theme)
          const isInInvestigation = item.status === 'IN_PROGRESS'

          return (
            <div
              key={item.theme}
              className="grid gap-3 rounded-lg border p-4 md:grid-cols-[1fr_auto]"
            >
              <div>
                <p className="font-medium">{item.theme}</p>
                <p className="text-muted-foreground text-sm">
                  {item.origin} / {item.owner}
                </p>
                <p className="mt-3 text-sm">{item.description}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 self-start justify-self-start md:justify-self-end">
                <StatusBadge status={item.status} />
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground hover:bg-muted size-8 rounded-full transition-colors"
                  asChild
                >
                  {isInInvestigation ? (
                    <Link
                      to="/investigations/$investigationId"
                      params={{ investigationId: detailId }}
                      aria-label={`Voir le détail de l'enquête ${item.theme}`}
                    >
                      <ExternalLink />
                    </Link>
                  ) : (
                    <Link
                      to="/inbox-subjects/$subjectId"
                      params={{ subjectId: detailId }}
                      aria-label={`Voir le detail du sujet ${item.theme}`}
                    >
                      <ExternalLink />
                    </Link>
                  )}
                </Button>
                {props.actor === 'director' ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground hover:text-destructive h-7 px-2"
                      >
                        <Trash2 />
                        Supprimer
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Supprimer le sujet</DialogTitle>
                        <DialogDescription>
                          Voulez-vous vraiment supprimer ce sujet ?
                        </DialogDescription>
                      </DialogHeader>
                      <div className="rounded-lg border p-4">
                        <p className="font-medium">{item.theme}</p>
                        <p className="text-muted-foreground mt-1 text-sm">
                          {item.description}
                        </p>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Annuler</Button>
                        </DialogClose>
                        <Button variant="destructive">
                          <Trash2 />
                          Supprimer
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                ) : null}
                {props.actor === 'journalist' && item.status === 'OPEN' ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        Prendre
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Prendre ce sujet ?</DialogTitle>
                        <DialogDescription>
                          Ce sujet sera assigne a ton espace de travail. Une
                          fois pris, tu ne pourras pas revenir en arriere pour
                          l'abandonner.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="rounded-lg border p-4">
                        <p className="font-medium">{item.theme}</p>
                        <p className="text-muted-foreground mt-1 text-sm">
                          {item.description}
                        </p>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Annuler</Button>
                        </DialogClose>
                        <Button>Confirmer la prise</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                ) : null}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

export function InboxSubjectDetailWorkspacePage({
  subjectId,
}: {
  subjectId: string
}) {
  const { actor } = useResolvedActor('journalist')
  const subject =
    inboxSubjects.find((item) => slugifyLabel(item.theme) === subjectId) ??
    inboxSubjects[0]

  return (
    <AppLayout actor={actor} page="subjects">
      <Card>
        <CardHeader>
          <CardTitle>{subject.theme}</CardTitle>
          <CardDescription>
            Detail du sujet avant prise en charge journalistique.
          </CardDescription>
          <CardAction>
            <StatusBadge status={subject.status} />
          </CardAction>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-muted-foreground text-xs font-medium uppercase">
                Origine
              </p>
              <p className="mt-1 font-medium">{subject.origin}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-muted-foreground text-xs font-medium uppercase">
                Responsable
              </p>
              <p className="mt-1 font-medium">{subject.owner}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-muted-foreground text-xs font-medium uppercase">
                Etat
              </p>
              <p className="mt-1 font-medium">{domainLabel(subject.status)}</p>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <p className="font-medium">Contexte</p>
            <p className="text-muted-foreground mt-2 text-sm">
              {subject.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {actor === 'journalist' && subject.status === 'OPEN' ? (
              <Button>Prendre le sujet</Button>
            ) : null}
            <Button variant="outline" asChild>
              <Link to="/inbox-subjects/global">Retour aux sujets</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  )
}

export function InvestigationsWorkspacePage({
  defaultTab = 'pending',
}: {
  defaultTab?: 'pending' | 'published' | 'canceled'
}) {
  return (
    <AppLayout actor="director" page="investigations">
      <Tabs defaultValue={defaultTab}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="pending">En attente</TabsTrigger>
            <TabsTrigger value="published">Publiees</TabsTrigger>
            <TabsTrigger value="canceled">Annulees</TabsTrigger>
          </TabsList>
          <Button asChild>
            <Link
              to="/publications/corrections"
              search={{ publicationId: undefined }}
            >
              <RotateCcw />
              Créer un correctif
            </Link>
          </Button>
        </div>
        <TabsContent value="pending" className="mt-4">
          <InvestigationList status="PENDING_REVIEW" />
        </TabsContent>
        <TabsContent value="published" className="mt-4">
          <InvestigationList status="PUBLISHED" />
        </TabsContent>
        <TabsContent value="canceled" className="mt-4">
          <InvestigationList status="NEEDS_REVISION" />
        </TabsContent>
      </Tabs>
    </AppLayout>
  )
}

function InvestigationList({ status }: { status: string }) {
  const rows = investigations.filter((item) => item.status === status)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Liste des enquetes</CardTitle>
        <CardDescription>
          Le détail contient les actions de publication, rejet et archive.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {rows.length ? (
          rows.map((item) => (
            <div
              key={item.title}
              className="grid gap-4 rounded-lg border p-4 lg:grid-cols-[1fr_auto]"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{item.title}</p>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-muted-foreground mt-1 text-sm">
                  {item.journalist} / {item.category} / {item.evidence}
                </p>
              </div>
              <Button size="sm" variant="outline" asChild>
                <Link
                  to="/investigations/$investigationId"
                  params={{ investigationId: 'demo' }}
                >
                  Voir le detail
                </Link>
              </Button>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="font-medium">Aucun dossier pour ce filtre</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Les enquetes apparaitront ici quand leur statut changera.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function InvestigationDetailWorkspacePage({
  investigationId,
}: {
  investigationId?: string
}) {
  const { actor } = useResolvedActor('director')
  const dossier = {
    id: investigationId ?? 'selection courante',
    title: 'Video de checkpoint sortie de contexte',
    subject: "Vérifier le lieu, la date et l'unité présente dans la séquence.",
    journalist: 'Maimouna Traore',
    status: 'PENDING_REVIEW',
    category: 'CONTEXT_COLLAPSE',
    verdict: 'MISLEADING',
    attempts: 1,
    updatedAt: '16 mai 2026, 18:40',
    notes:
      'La séquence est authentique mais ancienne. Elle est republiée comme si elle documentait la situation actuelle.',
  }

  const sourceMedia = [
    {
      title: 'Video initiale recue depuis le signalement citoyen',
      type: 'VIDEO',
      origin: 'CITIZEN_REPORT',
      reliability: 'MISLEADING',
      category: 'CONTEXT_COLLAPSE',
      justification:
        "Les uniformes et le décor correspondent à une patrouille archivée, pas à l'événement actuel.",
    },
    {
      title: 'Capture publiée par la direction',
      type: 'IMAGE',
      origin: 'DIRECTOR_INITIATED',
      reliability: 'UNVERIFIABLE',
      category: 'OTHER',
      justification:
        'La capture seule ne permet pas d etablir la date ni le lieu.',
    },
  ]

  const watcherEvidence = [
    {
      title: 'Comparaison du decor',
      watcher: 'Awa Diarra',
      media: '2 images',
      category: 'CONTEXT_COLLAPSE',
      reliability: 'TRUE',
      note: 'Le panneau visible dans la video correspond a l ancien checkpoint.',
    },
    {
      title: 'Recherche de publication anterieure',
      watcher: 'Malik Sissoko',
      media: '1 lien',
      category: 'MISLEADING',
      reliability: 'TRUE',
      note: 'Le même extrait circule déjà dans une archive de 2022.',
    },
  ]

  if (actor === 'journalist') {
    return (
      <JournalistInvestigationWorkspace
        dossier={dossier}
        sourceMedia={sourceMedia}
        watcherEvidence={watcherEvidence}
      />
    )
  }

  return (
    <AppLayout actor={actor} page="investigations">
      <div className="grid gap-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>{dossier.title}</CardTitle>
                  <CardDescription className="mt-2 max-w-2xl">
                    {dossier.subject}
                  </CardDescription>
                </div>
                <StatusBadge status={dossier.status} />
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="bg-muted/40 grid gap-3 rounded-lg border p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">Arbitrage direction</p>
                    <p className="text-muted-foreground text-sm">
                      Publier, renvoyer en correction, archiver ou annuler ce
                      dossier.
                    </p>
                  </div>
                  <PublishInvestigationDialog>
                    <Button size="sm">
                      <BadgeCheck />
                      Publier
                    </Button>
                  </PublishInvestigationDialog>
                </div>
                <div
                  className={cn(
                    'grid gap-2',
                    dossier.verdict === 'MISLEADING'
                      ? 'sm:grid-cols-4'
                      : 'sm:grid-cols-3',
                  )}
                >
                  <ArbitrationReasonDialog action="Demander une correction">
                    <Button variant="outline" size="sm">
                      <PenLine />
                      Correction
                    </Button>
                  </ArbitrationReasonDialog>
                  {dossier.verdict === 'MISLEADING' ? (
                    <ArbitrationReasonDialog action="Archiver le dossier">
                      <Button variant="outline" size="sm">
                        <Archive />
                        Archiver
                      </Button>
                    </ArbitrationReasonDialog>
                  ) : null}
                  <ArbitrationReasonDialog
                    action="Annuler le dossier"
                    tone="destructive"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                    >
                      <Ban />
                      Annuler
                    </Button>
                  </ArbitrationReasonDialog>
                  <ArbitrationReasonDialog
                    action="Rejeter le dossier"
                    tone="destructive"
                  >
                    <Button variant="destructive" size="sm">
                      <XCircle />
                      Rejeter
                    </Button>
                  </ArbitrationReasonDialog>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    Verdict brouillon
                  </p>
                  <p className="mt-1 font-medium">
                    {domainLabel(dossier.verdict)}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    Catégorie
                  </p>
                  <p className="mt-1 font-medium">
                    {domainLabel(dossier.category)}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    Journaliste
                  </p>
                  <p className="mt-1 font-medium">{dossier.journalist}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    Revision
                  </p>
                  <p className="mt-1 font-medium">
                    Tentative {dossier.attempts}
                  </p>
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <p className="font-medium">Notes d'enquête</p>
                <p className="text-muted-foreground mt-2 text-sm">
                  {dossier.notes}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Médias analysés</CardTitle>
              <CardDescription>
                Médias issus du signalement, de la direction ou du journaliste.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {sourceMedia.map((media) => (
                <div key={media.title} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{media.title}</p>
                      <p className="text-muted-foreground text-sm">
                        {domainLabel(media.origin)} / {domainLabel(media.type)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        {domainLabel(media.reliability)}
                      </Badge>
                      <Badge variant="outline">
                        {domainLabel(media.category)}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-muted-foreground mt-3 text-sm">
                    {media.justification}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contributions vigies</CardTitle>
              <CardDescription>
                Preuves envoyees par les vigies et relues avant arbitrage.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {watcherEvidence.map((evidence) => (
                <div key={evidence.title} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{evidence.title}</p>
                      <p className="text-muted-foreground text-sm">
                        {evidence.watcher} / {evidence.media}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {domainLabel(evidence.reliability)}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-3 text-sm">
                    {evidence.note}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}

function JournalistInvestigationWorkspace({
  dossier,
  sourceMedia,
  watcherEvidence,
}: {
  dossier: {
    title: string
    subject: string
    journalist: string
    status: string
    category: string
    verdict: string
    attempts: number
    updatedAt: string
    notes: string
  }
  sourceMedia: Array<{
    title: string
    type: string
    origin: string
    reliability: string
    category: string
    justification: string
  }>
  watcherEvidence: Array<{
    title: string
    watcher: string
    media: string
    category?: string
    reliability?: string
    note: string
  }>
}) {
  const [proofMediaType, setProofMediaType] = useState('LINK')
  const isProofLink = proofMediaType === 'LINK'

  return (
    <AppLayout actor="journalist" page="investigations">
      <div className="grid gap-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>{dossier.title}</CardTitle>
                  <CardDescription className="mt-2 max-w-2xl">
                    {dossier.subject}
                  </CardDescription>
                </div>
                <StatusBadge status={dossier.status} />
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    Verdict brouillon
                  </p>
                  <p className="mt-1 font-medium">
                    {domainLabel(dossier.verdict)}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    Catégorie dominante
                  </p>
                  <p className="mt-1 font-medium">
                    {domainLabel(dossier.category)}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    Revision
                  </p>
                  <p className="mt-1 font-medium">
                    Tentative {dossier.attempts}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    Derniere mise a jour
                  </p>
                  <p className="mt-1 font-medium">{dossier.updatedAt}</p>
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <p className="font-medium">Notes d'enquête</p>
                <p className="text-muted-foreground mt-2 text-sm">
                  {dossier.notes}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button>
                  <ClipboardCheck />
                  Soumettre en revue
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/inbox-subjects/global">Retour aux sujets</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Classification des medias source</CardTitle>
              <CardDescription>
                Le backend attend categorie, fiabilite et justification pour
                chaque média issu du sujet.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {sourceMedia.map((media) => (
                <div
                  key={media.title}
                  className="grid gap-4 rounded-lg border p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{media.title}</p>
                      <p className="text-muted-foreground text-sm">
                        {domainLabel(media.origin)} / {domainLabel(media.type)}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {domainLabel(media.category)}
                    </Badge>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Label className="grid gap-2">
                      Catégorie
                      <select
                        defaultValue={media.category}
                        className="border-input bg-background h-10 rounded-md border px-3 text-sm"
                      >
                        <option value="CONTEXT_COLLAPSE">
                          Contexte detourne
                        </option>
                        <option value="MANIPULATED">Manipule</option>
                        <option value="FABRICATED">Fabrique</option>
                        <option value="SATIRE">Satire</option>
                        <option value="MISLEADING">Trompeur</option>
                        <option value="IMPOSTOR">Usurpation</option>
                        <option value="OTHER">Autre</option>
                      </select>
                    </Label>
                    <Label className="grid gap-2">
                      Fiabilite
                      <select
                        defaultValue={media.reliability}
                        className="border-input bg-background h-10 rounded-md border px-3 text-sm"
                      >
                        <option value="TRUE">Vrai</option>
                        <option value="FALSE">Faux</option>
                        <option value="MISLEADING">Trompeur</option>
                        <option value="UNVERIFIABLE">Non vérifiable</option>
                      </select>
                    </Label>
                  </div>
                  <Label className="grid gap-2">
                    Justification
                    <Textarea defaultValue={media.justification} />
                  </Label>
                  <Button size="sm" className="w-fit">
                    Enregistrer la classification
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ajouter une preuve journalistique</CardTitle>
              <CardDescription>
                Ajoute une URL vérifiée et la source d'autorité rattachée.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-3 md:grid-cols-2">
                <Label className="grid gap-2">
                  Type de média
                  <select
                    value={proofMediaType}
                    onChange={(event) => setProofMediaType(event.target.value)}
                    className="border-input bg-background h-10 rounded-md border px-3 text-sm"
                  >
                    <option value="LINK">Lien</option>
                    <option value="IMAGE">Image</option>
                    <option value="VIDEO">Video</option>
                    <option value="DOCUMENT">Document</option>
                    <option value="AUDIO">Audio</option>
                    <option value="TEXT">Texte</option>
                  </select>
                </Label>
                <Label className="grid gap-2">
                  Source d'autorité
                  <Input placeholder="Nom de la source" />
                </Label>
                <Label className="grid gap-2">
                  Type de source
                  <select className="border-input bg-background h-10 rounded-md border px-3 text-sm">
                    <option value="OFFICIAL_DECREE">Decision officielle</option>
                    <option value="ORIGINAL_RETRACTION">
                      Rectificatif original
                    </option>
                    <option value="DIRECT_EVIDENCE">Preuve directe</option>
                    <option value="MEDIA_CROSSCHECK">Recoupement média</option>
                    <option value="AUTHORITY_STATEMENT">
                      Déclaration d'autorité
                    </option>
                  </select>
                </Label>
              </div>
              {isProofLink ? (
                <Label className="grid gap-2">
                  URL de la preuve
                  <Input placeholder="https://..." type="url" />
                </Label>
              ) : (
                <MediaDropzone
                  inputId="journalist-proof-media"
                  description="Dépose un fichier ou sélectionne le média vérifié à joindre à cette preuve."
                />
              )}
              <Button className="w-fit">
                <FilePlus2 />
                Ajouter la preuve
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contributions vigies</CardTitle>
              <CardDescription>
                Les apports des vigies restent consultables pour consolider le
                dossier.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {watcherEvidence.map((evidence) => {
                const hasClassification = Boolean(evidence.reliability)

                return (
                  <div key={evidence.title} className="rounded-lg border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">{evidence.title}</p>
                        <p className="text-muted-foreground text-sm">
                          {evidence.watcher} / {evidence.media}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">
                          {evidence.category
                            ? domainLabel(evidence.category)
                            : 'Catégorie à définir'}
                        </Badge>
                        <Badge variant="secondary">
                          {evidence.reliability
                            ? domainLabel(evidence.reliability)
                            : 'Verdict a definir'}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-muted-foreground mt-3 text-sm">
                      {evidence.note}
                    </p>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <Label className="grid gap-2">
                        Catégorie
                        <select
                          defaultValue={evidence.category ?? ''}
                          className="border-input bg-background h-10 rounded-md border px-3 text-sm"
                        >
                          <option value="" disabled>
                            Choisir une categorie
                          </option>
                          <option value="CONTEXT_COLLAPSE">
                            Contexte detourne
                          </option>
                          <option value="MANIPULATED">Manipule</option>
                          <option value="FABRICATED">Fabrique</option>
                          <option value="SATIRE">Satire</option>
                          <option value="MISLEADING">Trompeur</option>
                          <option value="IMPOSTOR">Usurpation</option>
                          <option value="OTHER">Autre</option>
                        </select>
                      </Label>
                      <Label className="grid gap-2">
                        Verdict
                        <select
                          defaultValue={evidence.reliability ?? ''}
                          className="border-input bg-background h-10 rounded-md border px-3 text-sm"
                        >
                          <option value="" disabled>
                            Choisir un verdict
                          </option>
                          <option value="TRUE">Vrai</option>
                          <option value="FALSE">Faux</option>
                          <option value="MISLEADING">Trompeur</option>
                          <option value="UNVERIFIABLE">Non vérifiable</option>
                        </select>
                      </Label>
                      <Label className="grid gap-2 md:col-span-2">
                        Justification
                        <Textarea defaultValue={evidence.note} />
                      </Label>
                    </div>
                    <Button size="sm" variant="outline" className="mt-3">
                      {hasClassification ? 'Reclasser' : 'Classer'} cette
                      contribution
                    </Button>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}

export function PublicationsWorkspacePage() {
  const { actor } = useResolvedActor('director')
  const canManagePublications = actor === 'director' || actor === 'admin'

  return (
    <AppLayout actor={actor} page="publications">
      <Card>
        <CardHeader>
          <CardTitle>Publications et correctifs</CardTitle>
          <CardDescription>
            Chaque publication conserve son verdict final et ses preuves.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {publications.map((item) => {
            const publicationId = slugifyLabel(item.title)

            return (
              <div
                key={item.title}
                className="grid gap-3 rounded-lg border p-4 sm:grid-cols-[1fr_auto] sm:items-start"
              >
                <div className="min-w-0">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Verdict: {domainLabel(item.verdict)} / {item.evidence}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:justify-end">
                  <Badge
                    variant={
                      item.type === 'Correctif' ? 'secondary' : 'outline'
                    }
                  >
                    {domainLabel(item.type)}
                  </Badge>
                  {canManagePublications ? (
                    <Button size="sm" variant="outline" asChild>
                      <Link
                        to="/publications/corrections"
                        search={{ publicationId }}
                      >
                        <RotateCcw />
                        Correctif
                      </Link>
                    </Button>
                  ) : null}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground hover:bg-muted size-8 rounded-full transition-colors"
                    asChild
                  >
                    <Link
                      to="/publications/$publicationId"
                      params={{ publicationId }}
                      aria-label={`Voir le detail de ${item.title}`}
                    >
                      <ExternalLink />
                    </Link>
                  </Button>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </AppLayout>
  )
}

export function PublicationDetailWorkspacePage({
  publicationId,
}: {
  publicationId?: string
}) {
  const publication =
    publications.find((item) => slugifyLabel(item.title) === publicationId) ??
    publications[0]
  const { actor } = useResolvedActor('director')
  const canManagePublication = actor === 'director' || actor === 'admin'

  return (
    <AppLayout actor={actor} page="publications">
      <div
        className={cn(
          'grid gap-6',
          canManagePublication && 'lg:grid-cols-[1fr_320px]',
        )}
      >
        <Card>
          <CardHeader>
            <CardTitle>{publication.title}</CardTitle>
            <CardDescription>
              {actor === 'citizen'
                ? 'Synthèse publique du verdict et des preuves disponibles.'
                : 'Verdict final, preuves conservees et type de publication.'}
            </CardDescription>
            <CardAction>
              <Badge
                variant={
                  publication.type === 'Correctif' ? 'secondary' : 'outline'
                }
              >
                {domainLabel(publication.type)}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground text-xs font-medium uppercase">
                  Verdict
                </p>
                <p className="mt-1 font-medium">
                  {domainLabel(publication.verdict)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-medium uppercase">
                  Preuves
                </p>
                <p className="mt-1 font-medium">{publication.evidence}</p>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <p className="font-medium">
                {actor === 'citizen'
                  ? "Résumé de l'enquête"
                  : 'Trace editoriale'}
              </p>
              <p className="text-muted-foreground mt-2 text-sm">
                {actor === 'citizen'
                  ? publication.summary
                  : 'La publication garde le verdict, les sources utilisées et les corrections rattachées pour rester consultable par la rédaction.'}
              </p>
            </div>
            {actor === 'citizen' ? (
              <>
                <div className="rounded-lg border p-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium">Liens verifies</p>
                      <p className="text-muted-foreground mt-1 text-sm">
                        Ouvre les sources et compare-les avec le resume avant de
                        partager la publication.
                      </p>
                    </div>
                    <Badge variant="outline" className="w-fit">
                      {publication.verifiedLinks.length} lien
                      {publication.verifiedLinks.length > 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="mt-4 grid gap-3">
                    {publication.verifiedLinks.length ? (
                      publication.verifiedLinks.map((source) => (
                        <a
                          key={source.label}
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:bg-muted/40 flex items-start gap-3 rounded-lg border p-3 transition-colors"
                        >
                          <Link2 className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                          <span className="min-w-0 flex-1">
                            <span className="block font-medium">
                              {source.label}
                            </span>
                            <span className="text-muted-foreground mt-1 block text-sm">
                              {source.description}
                            </span>
                          </span>
                          <ExternalLink className="text-muted-foreground size-4 shrink-0" />
                        </a>
                      ))
                    ) : (
                      <p className="text-muted-foreground rounded-lg border border-dashed p-3 text-sm">
                        Aucun lien public n'a ete attache a cette publication.
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <p className="font-medium">Documents finaux</p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Pièces conservées avec la publication finale.
                    </p>
                    <div className="mt-4 grid gap-3">
                      {publication.finalDocuments.map((document) => (
                        <a
                          key={document.name}
                          href={document.url}
                          download
                          className="hover:bg-muted/40 flex items-center gap-3 rounded-lg border p-3 transition-colors"
                        >
                          <FileText className="text-muted-foreground size-4 shrink-0" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium">
                              {document.name}
                            </span>
                            <span className="text-muted-foreground text-sm">
                              {document.type} / {document.size}
                            </span>
                          </span>
                          <Download className="text-muted-foreground size-4 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <p className="font-medium">Médias vérifiés</p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Médias retenus ou comparés pendant la vérification.
                    </p>
                    <div className="mt-4 grid gap-3">
                      {publication.verifiedMedia.length ? (
                        publication.verifiedMedia.map((media) => {
                          if (media.type === 'Image') {
                            return (
                              <figure
                                key={media.name}
                                className="bg-card overflow-hidden rounded-lg border"
                              >
                                <img
                                  src={media.imageUrl}
                                  alt={media.alt ?? media.name}
                                  className="aspect-video w-full object-cover"
                                  loading="lazy"
                                />
                                <figcaption className="flex items-center justify-between gap-3 p-3">
                                  <span>
                                    <span className="block font-medium">
                                      {media.name}
                                    </span>
                                    <span className="text-muted-foreground text-sm">
                                      Image de reference Unsplash
                                    </span>
                                  </span>
                                  <a
                                    href={media.url}
                                    className="text-muted-foreground hover:text-foreground shrink-0"
                                    aria-label={`Ouvrir ${media.name}`}
                                  >
                                    <ExternalLink className="size-4" />
                                  </a>
                                </figcaption>
                              </figure>
                            )
                          }

                          if (media.type === 'Video') {
                            return (
                              <div
                                key={media.name}
                                className="bg-card overflow-hidden rounded-lg border"
                              >
                                <video
                                  controls
                                  preload="metadata"
                                  poster={media.posterUrl}
                                  className="aspect-video w-full bg-black object-cover"
                                >
                                  <source
                                    src={media.videoUrl}
                                    type="video/mp4"
                                  />
                                  Ton navigateur ne peut pas lire cette video.
                                </video>
                                <div className="flex items-center justify-between gap-3 p-3">
                                  <span>
                                    <span className="block font-medium">
                                      {media.name}
                                    </span>
                                    <span className="text-muted-foreground text-sm">
                                      Extrait compare pendant la verification
                                    </span>
                                  </span>
                                  <Play className="text-muted-foreground size-4 shrink-0" />
                                </div>
                              </div>
                            )
                          }

                          return (
                            <a
                              key={media.name}
                              href={media.url}
                              className="hover:bg-muted/40 flex items-center gap-3 rounded-lg border p-3 transition-colors"
                            >
                              <FileSearch className="text-muted-foreground size-4 shrink-0" />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate font-medium">
                                  {media.name}
                                </span>
                                <span className="text-muted-foreground text-sm">
                                  {media.type}
                                </span>
                              </span>
                              <ExternalLink className="text-muted-foreground size-4 shrink-0" />
                            </a>
                          )
                        })
                      ) : (
                        <p className="text-muted-foreground rounded-lg border border-dashed p-3 text-sm">
                          Aucun média final n'a été joint à cette publication.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : null}
            {actor === 'citizen' ? (
              <div className="rounded-lg border p-4">
                <p className="font-medium">Pour aller plus loin</p>
                <p className="text-muted-foreground mt-2 text-sm">
                  Si une information semble incomplete, tu peux creer un nouveau
                  signalement depuis la page Signalements. La rédaction
                  l'examinera comme une nouvelle alerte.
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
        {canManagePublication ? (
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>
                Corriger la publication sans modifier le verdict original.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button asChild>
                <Link
                  to="/publications/corrections"
                  search={{ publicationId: publicationId ?? undefined }}
                >
                  <RotateCcw />
                  Créer un correctif
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/publications/list">Retour aux publications</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </AppLayout>
  )
}

export function PublicationCorrectionsWorkspacePage({
  publicationId,
}: {
  publicationId?: string
}) {
  const [selectedPublicationId, setSelectedPublicationId] = useState(
    publicationId ?? slugifyLabel(publications[0]?.title ?? ''),
  )
  const activePublicationId = publicationId ?? selectedPublicationId
  const publication = publications.find(
    (item) => slugifyLabel(item.title) === activePublicationId,
  )
  const isPublicationLocked = Boolean(publicationId)

  return (
    <AppLayout actor="director" page="publications">
      <Card>
        <CardHeader>
          <CardTitle>Créer un correctif</CardTitle>
          <CardDescription>
            {publication
              ? 'Le correctif sera rattaché directement à cette publication.'
              : 'Sélectionne une publication pour créer un correctif.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {!isPublicationLocked ? (
            <Label className="grid gap-2">
              Publication cible
              <select
                className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                value={activePublicationId}
                onChange={(event) =>
                  setSelectedPublicationId(event.target.value)
                }
              >
                {publications.map((item) => {
                  const id = slugifyLabel(item.title)
                  return (
                    <option key={id} value={id}>
                      {item.title}
                    </option>
                  )
                })}
              </select>
            </Label>
          ) : null}
          {publication ? (
            <div className="rounded-lg border p-4">
              <p className="text-muted-foreground text-xs font-medium uppercase">
                Publication cible
              </p>
              <p className="mt-1 font-medium">{publication.title}</p>
              <p className="text-muted-foreground mt-2 text-sm">
                Verdict: {domainLabel(publication.verdict)} /{' '}
                {publication.evidence}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-4">
              <p className="font-medium">Aucune publication sélectionnée</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Choisis une publication dans la liste pour préparer le
                correctif.
              </p>
            </div>
          )}
          <Label className="grid gap-2">
            Correction
            <Textarea placeholder="Formuler le correctif à publier" />
          </Label>
          <Button className="w-fit" disabled={!publication}>
            <RotateCcw />
            Préparer le correctif
          </Button>
        </CardContent>
      </Card>
    </AppLayout>
  )
}

export function PeopleManagementPage() {
  return <PeopleManagementWorkspace />
}

export function UserCreateWorkspacePage() {
  return <UserCreateWorkspace />
}

export function UserStatusWorkspacePage({ userLabel }: { userLabel?: string }) {
  const isActive = userLabel !== 'Malik Sissoko'

  return (
    <AppLayout actor="director" page="people">
      <Card>
        <CardHeader>
          <CardTitle>{userLabel ?? 'Compte sélectionné'}</CardTitle>
          <CardDescription>
            Modifier le statut sans exposer les identifiants internes.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Label className="grid gap-2">
            Raison
            <select className="border-input bg-background h-10 rounded-md border px-3 text-sm">
              <option value="ABUSE">Abus de la plateforme</option>
              <option value="INACTIVE">Compte inactif</option>
              <option value="SECURITY">Risque de securite</option>
              <option value="OTHER">Autre</option>
            </select>
          </Label>
          <Label className="grid gap-2">
            Détails
            <Textarea placeholder="Commentaire interne" />
          </Label>
          <div className="flex flex-wrap gap-2">
            {isActive ? (
              <Button variant="outline">Desactiver</Button>
            ) : (
              <Button>Activer</Button>
            )}
            <Button variant="destructive">
              <Ban />
              Bannir
            </Button>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  )
}

export function WatcherApplicationsReviewPage() {
  return <WatcherApplicationsReviewWorkspace />
}

export function NotificationsWorkspacePage() {
  return <NotificationsWorkspace />
}

export function NotificationDetailWorkspacePage({
  notificationId,
}: {
  notificationId: string
}) {
  return <NotificationDetailWorkspace notificationId={notificationId} />
}

export function GuestHomePage() {
  return (
    <AppLayout actor="guest" page="dashboard">
      <div className="grid gap-6 xl:grid-cols-3">
        {[
          ['Citoyen', 'Dépose un signalement ou candidate comme vigie.'],
          ['Journaliste', 'Prend un sujet et prepare le dossier.'],
          ['Direction', 'Arbitre, publie, archive ou demande une correction.'],
        ].map(([title, body]) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{body}</CardDescription>
            </CardHeader>
          </Card>
        ))}
        <Card>
          <CardHeader>
            <CardTitle>Session</CardTitle>
            <CardDescription>
              Connecte-toi pour ouvrir l'espace adapté à ton rôle.
            </CardDescription>
            <CardAction>
              <Button asChild>
                <Link to="/auth" search={{ mode: 'sign-in' }}>
                  <ShieldCheck />
                  Connexion
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
        </Card>
      </div>
    </AppLayout>
  )
}
