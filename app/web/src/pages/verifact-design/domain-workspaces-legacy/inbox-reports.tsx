import { Link } from '@tanstack/react-router'
import { ExternalLink, FilePlus2, Trash2 } from 'lucide-react'
import { Button } from '../../../shared/ui/shadcn/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../shared/ui/shadcn/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../shared/ui/shadcn/dialog'
import { Input } from '../../../shared/ui/shadcn/input'
import { Label } from '../../../shared/ui/shadcn/label'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../shared/ui/shadcn/tabs'
import { Textarea } from '../../../shared/ui/shadcn/textarea'
import { AppLayout } from '../app-layout'
import { useResolvedActor } from '../session-routing'
import { domainLabel } from '../workspace-labels'
import { StatusBadge } from '../workspace-ui'
import { inboxSubjects, reports } from '../workspace-mocks'
import { CitizenWorkspacePage } from './overview'
import { MediaDropzone } from './shared'
import { slugifyLabel } from './utils'

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

  if (!subject) {
    return null
  }

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
