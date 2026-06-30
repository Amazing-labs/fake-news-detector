import { Link, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  Download,
  ExternalLink,
  FilePlus2,
  FileText,
  Trash2,
} from 'lucide-react'
import { Button } from '@shared/ui/shadcn/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/ui/shadcn/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@shared/ui/shadcn/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shared/ui/shadcn/tabs'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CreateDirectorInboxSubjectForm } from '@features/inbox-subjects/create-director-inbox-subject-form'
import { AppLayout } from '../app-layout'
import { useResolvedActor } from '../session-routing'
import { toApiErrorMessage } from '@shared/api/http'
import { downloadFromUrl, triggerBlobDownload } from '@shared/lib/download'
import { domainLabel } from '../workspace-labels'
import { MetaCell, StatusBadge } from '../workspace-ui'
import { listReports, reportQueryKeys } from '@entities/report/api'
import type { ReportItem } from '@entities/report/model'
import {
  getInboxSubject,
  getInboxSubjectMedia,
  inboxSubjectQueryKeys,
  listInboxSubjects,
  pickInboxSubject,
} from '@entities/inbox-subject/api'
import type {
  InboxSubjectItem,
  InboxSubjectMediaItem,
} from '@entities/inbox-subject/model'
import { CitizenWorkspacePage } from './overview'

const ORIGIN_LABELS: Record<string, string> = {
  REPORT: 'Signalement citoyen',
  DIRECTOR_INITIATED: 'Création direction',
}

// A journalist claims a subject -> the server opens the investigation and
// returns it; on success we refresh the inbox and jump to the new dossier.
function usePickSubjectMutation() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: pickInboxSubject,
    onSuccess: (investigation) => {
      if (!investigation) return
      void queryClient.invalidateQueries({
        queryKey: inboxSubjectQueryKeys.all,
      })
      void navigate({
        to: '/investigations/$investigationId',
        params: { investigationId: investigation.id },
      })
    },
    onError: (error) => {
      toast.error(toApiErrorMessage(error))
    },
  })
}

// ── Reports list (director only) ───────────────────────────────────────────────

export function ReportsWorkspacePage() {
  const { actor, isActorPending } = useResolvedActor('guest')
  const reportsQuery = useQuery({
    queryKey: reportQueryKeys.list(),
    queryFn: () => listReports(),
  })

  if (isActorPending) return null
  if (actor === 'citizen' || actor === 'watcher')
    return <CitizenWorkspacePage />

  const items = reportsQuery.data?.items ?? []
  const openItems = items.filter((r) => r.status === 'OPEN')
  const archivedItems = items.filter((r) => r.status !== 'OPEN')

  return (
    <AppLayout actor="director" page="reports">
      <Tabs defaultValue="open">
        <TabsList>
          <TabsTrigger value="open">Ouverts ({openItems.length})</TabsTrigger>
          <TabsTrigger value="archived">
            Archivés ({archivedItems.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="open" className="mt-4">
          <ReportList items={openItems} />
        </TabsContent>
        <TabsContent value="archived" className="mt-4">
          <ReportList items={archivedItems} />
        </TabsContent>
      </Tabs>
    </AppLayout>
  )
}

function ReportList({ items }: { items: ReportItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Signalements citoyens</CardTitle>
        <CardDescription>
          Transformer les alertes utiles en sujets ou archiver les doublons.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {items.length ? (
          items.map((item) => (
            <div
              key={item.id}
              className="grid gap-4 rounded-lg border p-4 lg:grid-cols-[1fr_auto]"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{item.title}</p>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-muted-foreground mt-1 text-sm">
                  {item.theme}
                  {item.reporterName ? ` / ${item.reporterName}` : ''}
                </p>
                <p className="mt-3 text-sm">{item.content}</p>
              </div>
              <div className="flex shrink-0 flex-wrap items-start gap-2">
                <Button size="sm">Créer un sujet</Button>
                <Button size="sm" variant="outline">
                  Archiver
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="font-medium">Aucun signalement ici</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Les signalements apparaîtront ici une fois déposés.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── Inbox subjects list ────────────────────────────────────────────────────────

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
            {canManageSubjects && (
              <TabsTrigger value="director">Création direction</TabsTrigger>
            )}
            <TabsTrigger value="reports">Signalements</TabsTrigger>
          </TabsList>
          {canManageSubjects && (
            <Button asChild>
              <Link to="/inbox-subjects/create">
                <FilePlus2 />
                Nouveau sujet
              </Link>
            </Button>
          )}
        </div>
        <TabsContent value="global" className="mt-4">
          <InboxList filter="all" actor={actor} />
        </TabsContent>
        {canManageSubjects && (
          <TabsContent value="director" className="mt-4">
            <InboxList filter="DIRECTOR_INITIATED" actor={actor} />
          </TabsContent>
        )}
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
        <CreateDirectorInboxSubjectForm />
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
  const inboxSubjectsQuery = useQuery({
    queryKey: inboxSubjectQueryKeys.list(),
    queryFn: () => listInboxSubjects(),
  })
  const pickMutation = usePickSubjectMutation()
  const allRows = inboxSubjectsQuery.data?.items ?? []
  const rows: InboxSubjectItem[] =
    props.filter === 'all'
      ? allRows
      : allRows.filter((item) => item.origin === props.filter)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sujets disponibles</CardTitle>
        <CardDescription>
          Les sujets ouverts peuvent être pris par un journaliste actif.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {rows.length ? (
          rows.map((item) => {
            return (
              <div
                key={item.id}
                className="grid gap-3 rounded-lg border p-4 md:grid-cols-[1fr_auto]"
              >
                <div>
                  <p className="font-medium">{item.theme}</p>
                  <p className="text-muted-foreground text-sm">
                    {ORIGIN_LABELS[item.origin] ?? item.origin}
                    {item.ownerName ? ` / ${item.ownerName}` : ''}
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
                    <Link
                      to="/inbox-subjects/$subjectId"
                      params={{ subjectId: item.id }}
                      aria-label={`Voir le détail du sujet ${item.theme}`}
                    >
                      <ExternalLink />
                    </Link>
                  </Button>
                  {props.actor === 'director' && (
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
                  )}
                  {props.actor === 'journalist' && item.status === 'OPEN' && (
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
                            Ce sujet sera assigné à ton espace de travail. Une
                            fois pris, tu ne pourras pas l'abandonner.
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
                          <Button
                            loading={
                              pickMutation.isPending &&
                              pickMutation.variables === item.id
                            }
                            onClick={() => pickMutation.mutate(item.id)}
                          >
                            Confirmer la prise
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="font-medium">Aucun sujet ici</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Les sujets apparaîtront ici une fois créés ou reçus.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── Inbox subject detail ───────────────────────────────────────────────────────

export function InboxSubjectDetailWorkspacePage({
  subjectId,
}: {
  subjectId: string
}) {
  const { actor } = useResolvedActor('journalist')
  const subjectQuery = useQuery({
    queryKey: inboxSubjectQueryKeys.detail(subjectId),
    queryFn: () => getInboxSubject(subjectId),
  })
  const mediaQuery = useQuery({
    queryKey: inboxSubjectQueryKeys.media(subjectId),
    queryFn: () => getInboxSubjectMedia(subjectId),
  })
  const pickMutation = usePickSubjectMutation()
  const subject = subjectQuery.data

  if (!subject) return null

  const media: SubjectMedia[] = (mediaQuery.data?.items ?? []).map(
    toSubjectMedia,
  )
  const mediaCount = media.length
  const canTake = actor === 'journalist' && subject.status === 'OPEN'

  return (
    <AppLayout actor={actor} page="subjects">
      {/* Header card */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-lg font-semibold">{subject.theme}</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Détail du sujet avant prise en charge journalistique.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <StatusBadge status={subject.status} />
              {canTake && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">Prendre le sujet</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Prendre ce sujet ?</DialogTitle>
                      <DialogDescription>
                        Ce sujet sera assigné à ton espace de travail. Une fois
                        pris, tu ne pourras pas l'abandonner.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="rounded-lg border p-4">
                      <p className="font-medium">{subject.theme}</p>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {subject.description}
                      </p>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Annuler</Button>
                      </DialogClose>
                      <Button
                        loading={pickMutation.isPending}
                        onClick={() => pickMutation.mutate(subjectId)}
                      >
                        Confirmer la prise
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <MetaCell
              label="Origine"
              value={ORIGIN_LABELS[subject.origin] ?? subject.origin}
            />
            <MetaCell
              label="Responsable"
              value={subject.ownerName ?? 'Non assigné'}
            />
            <MetaCell label="État" value={domainLabel(subject.status)} />
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="context">
        <TabsList>
          <TabsTrigger value="context">Contexte</TabsTrigger>
          <TabsTrigger value="media">Médias ({mediaCount})</TabsTrigger>
        </TabsList>

        <TabsContent value="context" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contexte éditorial</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {subject.description}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="mt-4">
          {mediaCount > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {media.map((item) => (
                <SubjectMediaItem
                  key={item.name}
                  item={item}
                  canDownload={actor === 'journalist' || actor === 'director'}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="font-medium">Aucun média joint</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Le créateur du sujet n'a pas joint de média.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Button variant="outline" className="w-fit" asChild>
        <Link to="/inbox-subjects/global">← Retour aux sujets</Link>
      </Button>
    </AppLayout>
  )
}

// ── Media helpers ──────────────────────────────────────────────────────────────

async function downloadMedia(item: SubjectMedia) {
  const contentUrl =
    item.type === 'IMAGE'
      ? item.imageUrl
      : item.type === 'VIDEO'
        ? item.videoUrl
        : item.type === 'AUDIO'
          ? item.audioUrl
          : item.url

  if (!contentUrl || contentUrl.startsWith('#')) {
    if (item.type === 'DOCUMENT') {
      const blob = new Blob(
        [
          `[Fichier de démonstration]\n\n${item.name}\n\nCe fichier est un placeholder.`,
        ],
        { type: 'text/plain' },
      )
      triggerBlobDownload(blob, item.name)
    }
    return
  }

  await downloadFromUrl(contentUrl, item.name)
}

type SubjectMedia = {
  name: string
  type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'LINK' | 'TEXT'
  url: string
  imageUrl?: string
  alt?: string
  videoUrl?: string
  posterUrl?: string
  audioUrl?: string
  size?: string
}

function mediaName(url: string, type: string): string {
  try {
    const last = new URL(url).pathname.split('/').pop()
    if (last) return decodeURIComponent(last)
  } catch {
    // not a parseable URL — fall back to the type label
  }
  return domainLabel(type)
}

function toSubjectMedia(item: InboxSubjectMediaItem): SubjectMedia {
  const type = item.type as SubjectMedia['type']
  return {
    name: mediaName(item.url, item.type),
    type,
    url: item.url,
    imageUrl: type === 'IMAGE' ? item.url : undefined,
    videoUrl: type === 'VIDEO' ? item.url : undefined,
    audioUrl: type === 'AUDIO' ? item.url : undefined,
  }
}

function SubjectMediaItem({
  item,
  canDownload,
}: {
  item: SubjectMedia
  canDownload: boolean
}) {
  return (
    <div className="overflow-hidden rounded-lg border">
      {item.type === 'IMAGE' && item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.alt ?? item.name}
          className="h-48 w-full object-cover"
        />
      ) : item.type === 'VIDEO' && item.videoUrl ? (
        <video
          src={item.videoUrl}
          poster={item.posterUrl}
          controls
          className="h-48 w-full bg-black object-contain"
        />
      ) : item.type === 'AUDIO' && item.audioUrl ? (
        <div className="bg-muted/40 flex h-24 items-center justify-center px-4">
          <audio src={item.audioUrl} controls className="w-full" />
        </div>
      ) : (
        <div className="bg-muted/40 flex h-24 items-center justify-center gap-3 px-4">
          <FileText className="text-muted-foreground size-8 shrink-0" />
          <p className="text-muted-foreground min-w-0 truncate text-sm">
            {item.name}
          </p>
        </div>
      )}
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{item.name}</p>
          {item.size && (
            <p className="text-muted-foreground text-xs">{item.size}</p>
          )}
        </div>
        {canDownload && (
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground size-8 shrink-0"
            aria-label={`Télécharger ${item.name}`}
            onClick={() => downloadMedia(item)}
          >
            <Download className="size-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
