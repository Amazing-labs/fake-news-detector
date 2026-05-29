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
  Gavel,
  Inbox,
  Link2,
  Newspaper,
  PenLine,
  Play,
  RotateCcw,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react'
import {
  useRef,
  useState,
  type ComponentType,
  type DragEvent,
  type ReactNode,
} from 'react'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../shared/ui/shadcn/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../shared/ui/shadcn/tabs'
import { Textarea } from '../../shared/ui/shadcn/textarea'
import { AppLayout } from './app-layout'
import { useResolvedActor } from './session-routing'

const inboxSubjects = [
  {
    theme: "Crise d'essence",
    origin: 'Signalement citoyen',
    status: 'OPEN',
    owner: 'Non assigne',
    description:
      "Rumeurs autour d'une origine djihadiste de la penurie de carburant.",
  },
  {
    theme: 'Video de checkpoint',
    origin: 'Creation direction',
    status: 'IN_PROGRESS',
    owner: 'Maimouna Traore',
    description:
      "Verifier le lieu, la date et l'unite presente dans la sequence.",
  },
  {
    theme: 'Prix du mil',
    origin: 'Signalement citoyen',
    status: 'OPEN',
    owner: 'Non assigne',
    description: 'Comparer les chiffres publies avec les releves officiels.',
  },
]

const reports = [
  {
    title: "Crise d'essence",
    theme: 'Securite',
    status: 'OPEN',
    reporter: 'Malik Sissoko',
    content:
      'Une rumeur locale relie la penurie a un groupe arme sans source directe.',
  },
  {
    title: 'Prix du mil',
    theme: 'Economie',
    status: 'OPEN',
    reporter: 'Awa Diarra',
    content:
      'Les prix annonces sur les reseaux ne correspondent pas au releve officiel.',
  },
  {
    title: 'Alerte archivee',
    theme: 'Sante',
    status: 'ARCHIVED',
    reporter: 'Oumar Keita',
    content: 'Doublon d un signalement deja transforme en sujet.',
  },
]

const investigations = [
  {
    title: 'Video de checkpoint',
    status: 'PENDING_REVIEW',
    category: 'Contexte trompeur',
    verdict: 'MISLEADING',
    journalist: 'Maimouna Traore',
    evidence: '3 medias classes',
  },
  {
    title: "Crise d'essence",
    status: 'IN_PROGRESS',
    category: 'Source insuffisante',
    verdict: 'UNVERIFIABLE',
    journalist: 'Ibrahim Diallo',
    evidence: '2 sources terrain',
  },
  {
    title: 'Prix du mil',
    status: 'NEEDS_REVISION',
    category: 'Chiffre public',
    verdict: 'TRUE',
    journalist: 'Maimouna Traore',
    evidence: 'Retour direction',
  },
  {
    title: 'Date de publication virale',
    status: 'PUBLISHED',
    category: 'Archive retrouvee',
    verdict: 'MISLEADING',
    journalist: 'Cellule preuves',
    evidence: 'Publication originale',
  },
]

const publications = [
  {
    title: 'La video du checkpoint date de 2022',
    verdict: 'MISLEADING',
    type: 'Publication',
    evidence: '3 liens verifies',
    summary:
      "La sequence est authentique, mais elle ne documente pas l'evenement recent mentionne dans les publications virales. Le journaliste a retrouve la publication originale et recoupe la date avec des archives et des sources de contexte.",
    verifiedLinks: [
      {
        label: 'Publication originale archivee',
        url: 'https://example.org/archive/checkpoint-2022',
        description: 'Archive de la sequence publiee en 2022.',
      },
      {
        label: 'Contexte date par la redaction',
        url: 'https://example.org/fact-check/checkpoint-context',
        description: 'Chronologie utilisee pour verifier la date.',
      },
      {
        label: 'Source locale recoupee',
        url: 'https://example.org/source/checkpoint-location',
        description: 'Element de contexte sur le lieu de la sequence.',
      },
    ],
    finalDocuments: [
      {
        name: 'Note de verification finale.pdf',
        type: 'PDF',
        size: '248 Ko',
        url: '#note-verification-finale',
      },
      {
        name: 'Journal des sources.csv',
        type: 'CSV',
        size: '18 Ko',
        url: '#journal-sources',
      },
    ],
    verifiedMedia: [
      {
        name: 'Capture publication originale',
        type: 'Image',
        url: '#capture-publication-originale',
        imageUrl:
          'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80',
        alt: 'Journal et notes de verification',
      },
      {
        name: 'Extrait video compare',
        type: 'Video',
        url: '#extrait-video-compare',
        posterUrl:
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
        videoUrl:
          'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      },
    ],
  },
  {
    title: 'Correction sur le prix du mil',
    verdict: 'TRUE',
    type: 'Correctif',
    evidence: '1 source officielle',
    summary:
      'Le correctif confirme les chiffres officiels et remplace une estimation partagee sans source primaire.',
    verifiedLinks: [
      {
        label: 'Releve officiel du marche',
        url: 'https://example.org/source/prix-du-mil',
        description: 'Source officielle utilisee pour corriger la publication.',
      },
    ],
    finalDocuments: [
      {
        name: 'Correctif publie.pdf',
        type: 'PDF',
        size: '112 Ko',
        url: '#correctif-publie',
      },
    ],
    verifiedMedia: [
      {
        name: 'Photo du releve officiel',
        type: 'Image',
        url: '#photo-releve-officiel',
        imageUrl:
          'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80',
        alt: 'Documents administratifs verifies',
      },
    ],
  },
  {
    title: 'Archive: origine de la penurie non verifiable',
    verdict: 'UNVERIFIABLE',
    type: 'Archive',
    evidence: 'Dossier insuffisant',
    summary:
      "Les elements disponibles ne permettent pas d'attribuer l'origine de la penurie a une source fiable.",
    verifiedLinks: [],
    finalDocuments: [
      {
        name: 'Decision archivage.pdf',
        type: 'PDF',
        size: '96 Ko',
        url: '#decision-archivage',
      },
    ],
    verifiedMedia: [],
  },
]

const people = [
  {
    name: 'Maimouna Traore',
    role: 'Journaliste',
    status: 'ACTIVE',
    load: '1 enquete active',
    type: 'journalist',
  },
  {
    name: 'Awa Diarra',
    role: 'Citoyenne vigie',
    status: 'ACTIVE',
    load: '4 preuves envoyees',
    type: 'citizen',
  },
  {
    name: 'Malik Sissoko',
    role: 'Citoyen',
    status: 'DISABLED',
    load: '0 signalement ouvert',
    type: 'citizen',
  },
]

const watcherApplications = [
  {
    name: 'Awa Diarra',
    status: 'PENDING',
    motivation: 'Veille locale, sources terrain et suivi des publications.',
  },
  {
    name: 'Oumar Keita',
    status: 'APPROVED',
    motivation: 'Experience de moderation communautaire.',
  },
]

function slugifyLabel(label: string) {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const domainLabelByValue: Record<string, string> = {
  ACTIVE: 'Actif',
  ALERT: 'Alerte',
  APPROVED: 'Approuve',
  ARCHIVED: 'Archive',
  ARCHIVED_PUBLICATION: 'Publication archivee',
  AUTHORITY_STATEMENT: 'Declaration officielle',
  CITIZEN_REPORT: 'Signalement citoyen',
  CONTEXT_COLLAPSE: 'Contexte detourne',
  CORRECTION: 'Correctif',
  DIRECTOR_INITIATED: 'Cree par la direction',
  DIRECT_EVIDENCE: 'Preuve directe',
  DISABLED: 'Desactive',
  FABRICATED: 'Fabrique',
  FALSE: 'Faux',
  IMAGE: 'Image',
  IMPOSTOR: 'Usurpation',
  IN_PROGRESS: 'En enquete',
  JOURNALIST_PROOF: 'Preuve journaliste',
  MANIPULATED: 'Manipule',
  MEDIA_CROSSCHECK: 'Recoupement media',
  MISLEADING: 'Trompeur',
  NEEDS_REVISION: 'A corriger',
  OFFICIAL_DECREE: 'Decision officielle',
  OPEN: 'Ouvert',
  OTHER: 'Autre',
  PENDING: 'En attente',
  PENDING_REVIEW: 'Revue direction',
  PUBLICATION: 'Publication',
  PUBLISHED: 'Publie',
  REJECTED: 'Rejete',
  SATIRE: 'Satire',
  TEXT: 'Texte',
  TRUE: 'Vrai',
  UNVERIFIABLE: 'Non verifiable',
  VIDEO: 'Video',
}

function domainLabel(value: string) {
  return domainLabelByValue[value] ?? value
}

function StatusBadge({
  status,
  className,
}: {
  status: string
  className?: string
}) {
  if (status === 'PUBLISHED' || status === 'APPROVED' || status === 'ACTIVE') {
    return (
      <Badge className={cn('h-6 rounded-full px-2.5', className)}>
        {domainLabel(status)}
      </Badge>
    )
  }

  if (
    status === 'PENDING' ||
    status === 'OPEN' ||
    status === 'PENDING_REVIEW'
  ) {
    return (
      <Badge
        variant="secondary"
        className={cn('h-6 rounded-full px-2.5', className)}
      >
        {domainLabel(status)}
      </Badge>
    )
  }

  if (status === 'DISABLED' || status === 'REJECTED') {
    return (
      <Badge
        variant="destructive"
        className={cn('h-6 rounded-full px-2.5', className)}
      >
        {domainLabel(status)}
      </Badge>
    )
  }

  return (
    <Badge
      variant="outline"
      className={cn('h-6 rounded-full px-2.5', className)}
    >
      {domainLabel(status)}
    </Badge>
  )
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
              <p className="font-medium">Lien verifie</p>
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
                  Source d'autorite
                  <Input placeholder="Nom de la source" />
                </Label>
                <Label className="grid gap-2">
                  Type de source
                  <Input placeholder="Declaration officielle" />
                </Label>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <p className="font-medium">Media verifie</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Le backend attend une URL, un type de media et, si utile, une
                source d'autorite.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Label className="grid gap-2 sm:col-span-2">
                  URL du media
                  <Input placeholder="https://source-officielle.example/preuve.jpg" />
                </Label>
                <Label className="grid gap-2">
                  Type de media
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

function StatCard(props: {
  title: string
  value: string
  hint: string
  icon: ComponentType<{ className?: string }>
}) {
  const Icon = props.icon

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-muted-foreground flex items-center justify-between text-sm font-medium">
          {props.title}
          <Icon className="size-4" />
        </CardTitle>
        <CardDescription>
          <span className="text-foreground text-3xl font-semibold">
            {props.value}
          </span>
          <span className="ml-2">{props.hint}</span>
        </CardDescription>
      </CardHeader>
    </Card>
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
          <p className="text-sm font-medium">Medias</p>
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
        onDragEnter={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragOver={(event) => {
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
  return (
    <AppLayout actor="director" page="dashboard">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="A arbitrer"
          value="7"
          hint="revue direction"
          icon={Gavel}
        />
        <StatCard
          title="Candidatures vigies"
          value="2"
          hint="en attente"
          icon={UserCheck}
        />
        <StatCard
          title="Correctifs"
          value="3"
          hint="a preparer"
          icon={RotateCcw}
        />
        <StatCard title="Sujets ouverts" value="24" hint="inbox" icon={Inbox} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revue des enquetes</CardTitle>
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
              {investigations.map((item) => (
                <TableRow key={item.title}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{domainLabel(item.verdict)}</TableCell>
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
            <div className="grid gap-5 rounded-lg border p-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{currentInvestigation.title}</p>
                  <StatusBadge status={currentInvestigation.status} />
                </div>
                <p className="text-muted-foreground mt-2 text-sm">
                  {currentInvestigation.category} /{' '}
                  {currentInvestigation.evidence}
                </p>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
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
              <div className="grid content-start gap-2">
                <Button size="sm" asChild>
                  <Link
                    to="/investigations/$investigationId"
                    params={{
                      investigationId: slugifyLabel(currentInvestigation.title),
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
          ) : null}
        </CardContent>
      </Card>
    </AppLayout>
  )
}

export function CitizenWorkspacePage() {
  return (
    <AppLayout actor="citizen" page="reports">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mes signalements</CardTitle>
            <CardDescription>
              Suivre les rumeurs transmises au desk et leur etat editorial.
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
            {reports.slice(0, 3).map((item) => (
              <div
                key={item.title}
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
                  <Link
                    to="/reports/$reportId"
                    params={{ reportId: slugifyLabel(item.title) }}
                  >
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
      <Card>
        <CardHeader>
          <CardTitle>Nouveau signalement</CardTitle>
          <CardDescription>
            Decris la rumeur, ajoute les messages ou medias recus, puis envoie
            le tout au desk.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Label className="grid gap-2">
            Theme
            <Input placeholder="Ex. sante, securite, economie" />
          </Label>
          <Label className="grid gap-2">
            Rumeur a verifier
            <Textarea placeholder="Decris la rumeur et le contexte connu" />
          </Label>
          <Label className="grid gap-2">
            Message recu
            <Textarea placeholder="Colle ici le message, la publication ou le texte recu" />
          </Label>
          <MediaDropzone
            inputId="citizen-report-media"
            description="Images, captures d'ecran, videos, notes audio ou documents recus avec la rumeur."
          />
          <div className="flex flex-wrap gap-2">
            <Button>Envoyer le signalement</Button>
            <Button variant="outline" asChild>
              <Link to="/reports">Retour aux signalements</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  )
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
            Historique du signalement et suivi editorial.
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
                  'Le desk verifie si un sujet doit etre ouvert.',
                ],
                [
                  'Retour',
                  'Une publication ou une archive sera rattachee ici.',
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
          hint="depuis la redaction"
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
              Une vigie ajoute des preuves mais ne pilote pas l'enquete.
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
                  Ajouter media, contexte terrain et justification.
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
                <Button size="sm">Creer un sujet</Button>
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
              <TabsTrigger value="director">Creation direction</TabsTrigger>
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
                Un sujet cree par la direction entre directement dans l'inbox.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Label className="grid gap-2">
                Theme
                <Input placeholder="Theme editorial" />
              </Label>
              <Label className="grid gap-2">
                Contexte
                <Textarea placeholder="Pourquoi le desk doit ouvrir ce sujet" />
              </Label>
              <MediaDropzone
                inputId="director-subject-media"
                description="Images, videos, audio, PDF ou documents utiles au desk."
              />
              <Button className="w-fit">Creer le sujet</Button>
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
            : item.origin === 'Creation direction',
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
                      aria-label={`Voir le detail de l'enquete ${item.theme}`}
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
              Creer un correctif
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
          Le detail contient les actions de publication, rejet et archive.
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
    subject: 'Verifier le lieu, la date et l unite presente dans la sequence.',
    journalist: 'Maimouna Traore',
    status: 'PENDING_REVIEW',
    category: 'CONTEXT_COLLAPSE',
    verdict: 'MISLEADING',
    attempts: 1,
    updatedAt: '16 mai 2026, 18:40',
    notes:
      'La sequence est authentique mais ancienne. Elle est republiee comme si elle documentait la situation actuelle.',
  }

  const sourceMedia = [
    {
      title: 'Video initiale recue depuis le signalement citoyen',
      type: 'VIDEO',
      origin: 'CITIZEN_REPORT',
      reliability: 'MISLEADING',
      category: 'CONTEXT_COLLAPSE',
      justification:
        'Les uniformes et le decor correspondent a une patrouille archivee, pas a l evenement actuel.',
    },
    {
      title: 'Capture publiee par la direction',
      type: 'IMAGE',
      origin: 'DIRECTOR_INITIATED',
      reliability: 'UNVERIFIABLE',
      category: 'OTHER',
      justification:
        'La capture seule ne permet pas d etablir la date ni le lieu.',
    },
  ]

  const authoritySources = [
    {
      name: 'Archive video originale',
      type: 'MEDIA_CROSSCHECK',
      detail: 'Publication source retrouvee, datee du 12 fevrier 2022.',
    },
    {
      name: 'Communique local',
      type: 'AUTHORITY_STATEMENT',
      detail:
        'La prefecture confirme qu aucun incident similaire n est en cours.',
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
      note: 'Le meme extrait circule deja dans une archive de 2022.',
    },
  ]

  const timeline = [
    'Sujet cree depuis un signalement citoyen',
    'Journaliste assigne et medias classes',
    'Sources d autorite rattachees',
    'Dossier soumis a revue direction',
  ]

  if (actor === 'journalist') {
    return (
      <JournalistInvestigationWorkspace
        dossier={dossier}
        sourceMedia={sourceMedia}
        authoritySources={authoritySources}
        watcherEvidence={watcherEvidence}
        timeline={timeline}
      />
    )
  }

  return (
    <AppLayout actor={actor} page="investigations">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
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
                    Categorie
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
                <p className="font-medium">Notes d enquete</p>
                <p className="text-muted-foreground mt-2 text-sm">
                  {dossier.notes}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Medias analyses</CardTitle>
              <CardDescription>
                Medias issus du signalement, de la direction ou du journaliste.
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

        <div className="grid content-start gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Sources d autorite</CardTitle>
              <CardDescription>
                Sources rattachees aux preuves journalistiques.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {authoritySources.map((source) => (
                <div key={source.name} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{source.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {domainLabel(source.type)}
                      </p>
                    </div>
                    <ShieldCheck className="text-primary size-4" />
                  </div>
                  <p className="text-muted-foreground mt-2 text-sm">
                    {source.detail}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progression</CardTitle>
              <CardDescription>
                Derniere mise a jour: {dossier.updatedAt}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {timeline.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="text-primary size-4" />
                  <span className="text-sm">{item}</span>
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
  authoritySources,
  watcherEvidence,
  timeline,
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
  authoritySources: Array<{
    name: string
    type: string
    detail: string
  }>
  watcherEvidence: Array<{
    title: string
    watcher: string
    media: string
    category?: string
    reliability?: string
    note: string
  }>
  timeline: string[]
}) {
  const [proofMediaType, setProofMediaType] = useState('LINK')
  const isProofLink = proofMediaType === 'LINK'

  return (
    <AppLayout actor="journalist" page="investigations">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
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
                    Categorie dominante
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
                <p className="font-medium">Notes d enquete</p>
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
                chaque media issu du sujet.
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
                      Categorie
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
                        <option value="UNVERIFIABLE">Non verifiable</option>
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
                Ajoute une URL verifiee et la source d autorite rattachee.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-3 md:grid-cols-2">
                <Label className="grid gap-2">
                  Type de media
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
                  Source d autorite
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
                    <option value="MEDIA_CROSSCHECK">Recoupement media</option>
                    <option value="AUTHORITY_STATEMENT">
                      Declaration d autorite
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
                  description="Depose un fichier ou selectionne le media verifie a joindre a cette preuve."
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
                            : 'Categorie a definir'}
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
                        Categorie
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
                          <option value="UNVERIFIABLE">Non verifiable</option>
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

        <div className="grid content-start gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Sources d autorite</CardTitle>
              <CardDescription>
                Sources rattachees aux preuves deja ajoutees.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {authoritySources.map((source) => (
                <div key={source.name} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{source.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {domainLabel(source.type)}
                      </p>
                    </div>
                    <ShieldCheck className="text-primary size-4" />
                  </div>
                  <p className="text-muted-foreground mt-2 text-sm">
                    {source.detail}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progression</CardTitle>
              <CardDescription>
                Le dossier part en direction uniquement apres soumission.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {timeline.slice(0, 3).map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="text-primary size-4" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}

export function PublicationsWorkspacePage() {
  return (
    <AppLayout actor="director" page="publications">
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
                  <Button size="sm" variant="outline" asChild>
                    <Link
                      to="/publications/corrections"
                      search={{ publicationId }}
                    >
                      <RotateCcw />
                      Correctif
                    </Link>
                  </Button>
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
                ? 'Synthese publique du verdict et des preuves disponibles.'
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
                  ? "Resume de l'enquete"
                  : 'Trace editoriale'}
              </p>
              <p className="text-muted-foreground mt-2 text-sm">
                {actor === 'citizen'
                  ? publication.summary
                  : 'La publication garde le verdict, les sources utilisees et les corrections rattachees pour rester consultable par la redaction.'}
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
                      Pieces conservees avec la publication finale.
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
                    <p className="font-medium">Medias verifies</p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Medias retenus ou compares pendant la verification.
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
                          Aucun media final n'a ete joint a cette publication.
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
                  signalement depuis la page Signalements. La redaction
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
                  Creer un correctif
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
  const publication = publications.find(
    (item) => slugifyLabel(item.title) === publicationId,
  )

  return (
    <AppLayout actor="director" page="publications">
      <Card>
        <CardHeader>
          <CardTitle>Creer un correctif</CardTitle>
          <CardDescription>
            {publication
              ? 'Le correctif sera rattache directement a cette publication.'
              : 'Selectionne une publication depuis la liste pour creer un correctif.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
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
              <p className="font-medium">Aucune publication selectionnee</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Retourne a la liste et utilise le bouton Correctif de la
                publication concernee.
              </p>
            </div>
          )}
          <Label className="grid gap-2">
            Correction
            <Textarea placeholder="Formuler le correctif a publier" />
          </Label>
          <Button className="w-fit" disabled={!publication}>
            <RotateCcw />
            Preparer le correctif
          </Button>
        </CardContent>
      </Card>
    </AppLayout>
  )
}

export function PeopleManagementPage() {
  return (
    <AppLayout actor="director" page="people">
      <Tabs defaultValue="journalists">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="journalists">Journalistes</TabsTrigger>
            <TabsTrigger value="citizens">Citoyens</TabsTrigger>
            <TabsTrigger value="watchers">Vigies</TabsTrigger>
          </TabsList>
          <Button asChild>
            <Link to="/journalists/create">
              <UserPlus />
              Creer journaliste
            </Link>
          </Button>
        </div>
        <TabsContent value="journalists" className="mt-4">
          <PeopleList filter="journalist" />
        </TabsContent>
        <TabsContent value="citizens" className="mt-4">
          <PeopleList filter="citizen" />
        </TabsContent>
        <TabsContent value="watchers" className="mt-4">
          <PeopleList filter="citizen" watcherOnly />
        </TabsContent>
      </Tabs>
    </AppLayout>
  )
}

function PeopleList(props: {
  filter: 'journalist' | 'citizen'
  watcherOnly?: boolean
}) {
  const rows = people.filter((person) => {
    if (person.type !== props.filter) return false
    if (props.watcherOnly) return person.role.includes('vigie')
    return true
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comptes</CardTitle>
        <CardDescription>
          Activation, suspension ou bannissement selon le statut courant.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {rows.map((person) => (
          <div
            key={person.name}
            className="grid gap-3 rounded-lg border p-4 md:grid-cols-[1fr_auto]"
          >
            <div>
              <p className="font-medium">{person.name}</p>
              <p className="text-muted-foreground text-sm">
                {person.role} / {person.load}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={person.status} />
              <Button size="sm" variant="outline" asChild>
                <Link
                  to="/journalists/status"
                  search={{ journalistId: person.name }}
                >
                  Gerer
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function UserCreateWorkspacePage() {
  return (
    <AppLayout actor="director" page="people">
      <Card>
        <CardHeader>
          <CardTitle>Provisionner un journaliste</CardTitle>
          <CardDescription>
            Le compte pourra ensuite prendre des sujets et conduire des
            enquetes.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Label className="grid gap-2">
            Nom complet
            <Input placeholder="Nom du journaliste" />
          </Label>
          <Label className="grid gap-2">
            Email
            <Input placeholder="email@redaction.test" />
          </Label>
          <Button className="w-fit">
            <UserPlus />
            Creer le compte
          </Button>
        </CardContent>
      </Card>
    </AppLayout>
  )
}

export function UserStatusWorkspacePage({ userLabel }: { userLabel?: string }) {
  const isActive = userLabel !== 'Malik Sissoko'

  return (
    <AppLayout actor="director" page="people">
      <Card>
        <CardHeader>
          <CardTitle>{userLabel ?? 'Compte selectionne'}</CardTitle>
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
            Details
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
  const { actor } = useResolvedActor('citizen')

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
              {watcherApplications.map((item) => (
                <div
                  key={item.name}
                  className="grid gap-3 rounded-lg border p-4 md:grid-cols-[1fr_auto]"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {item.motivation}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm">
                      <CheckCircle2 />
                      Approuver
                    </Button>
                    <Button size="sm" variant="outline">
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
      <Card>
        <CardHeader>
          <CardTitle>Espace vigie</CardTitle>
          <CardDescription>
            Candidate pour contribuer aux enquetes ouvertes par la redaction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <Label className="grid gap-2">
              Motivation
              <Textarea placeholder="Explique pourquoi tu veux devenir vigie et comment tu peux aider la redaction." />
            </Label>
            <Button className="w-fit">
              <UserPlus />
              Envoyer la candidature
            </Button>
          </form>
        </CardContent>
      </Card>
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
                  Ajoute un contexte local, une source, un media ou une note qui
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

const notificationItems = [
  {
    id: 'nouvelle-publication',
    type: 'PUBLICATION',
    theme: 'Nouvelle publication',
    message: 'Un dossier suivi vient de recevoir un verdict public.',
    isRead: false,
    publicationId: 'la-video-du-checkpoint-date-de-2022',
    investigationId: null,
  },
  {
    id: 'correctif-publie',
    type: 'CORRECTION',
    theme: 'Correctif publie',
    message: 'Une publication a ete corrigee apres nouvelle validation.',
    isRead: false,
    publicationId: 'correction-sur-le-prix-du-mil',
    investigationId: null,
  },
  {
    id: 'dossier-archive',
    type: 'ARCHIVED_PUBLICATION',
    theme: 'Dossier archive',
    message: 'Une enquete non verifiable a ete archivee par la direction.',
    isRead: true,
    publicationId: null,
    investigationId: 'crise-essence',
  },
  {
    id: 'action-requise',
    type: 'ALERT',
    theme: 'Action requise',
    message: 'Une preuve ou une revision attend ton intervention.',
    isRead: true,
    publicationId: null,
    investigationId: null,
  },
] as const

const notificationTypeConfig = {
  PUBLICATION: {
    icon: Newspaper,
    label: 'Publication',
    intent: 'Verdict public disponible',
    actionLabel: 'Ouvrir la publication',
  },
  CORRECTION: {
    icon: RotateCcw,
    label: 'Correctif',
    intent: 'Publication corrigee',
    actionLabel: 'Ouvrir le correctif',
  },
  ALERT: {
    icon: AlertTriangle,
    label: 'Alerte',
    intent: 'Intervention attendue',
    actionLabel: 'Retour aux notifications',
  },
  ARCHIVED_PUBLICATION: {
    icon: Archive,
    label: 'Archive',
    intent: 'Enquete archivee',
    actionLabel: 'Ouvrir le dossier',
  },
} as const

function getNotificationConfig(
  type: (typeof notificationItems)[number]['type'],
) {
  return notificationTypeConfig[type]
}

function getNotificationTarget(item: (typeof notificationItems)[number]) {
  if (item.publicationId) {
    return {
      kind: 'publication',
      id: item.publicationId,
      label: getNotificationConfig(item.type).actionLabel,
    } as const
  }

  if (item.investigationId) {
    return {
      kind: 'investigation',
      id: item.investigationId,
      label: getNotificationConfig(item.type).actionLabel,
    } as const
  }

  return null
}

export function NotificationsWorkspacePage() {
  const { actor } = useResolvedActor('journalist')

  function renderNotificationCard(item: (typeof notificationItems)[number]) {
    const config = getNotificationConfig(item.type)
    const Icon = config.icon
    const target = getNotificationTarget(item)
    const card = (
      <Card
        className={cn(
          'hover:border-primary/40 hover:bg-muted/40 transition-colors',
          !item.isRead && 'border-primary/30 bg-primary/5 shadow-primary/10',
        )}
      >
        <CardContent className="flex items-start gap-4 p-5">
          <div
            className={cn(
              'bg-muted flex size-10 shrink-0 items-center justify-center rounded-full',
              !item.isRead && 'bg-primary/10 text-primary',
            )}
          >
            <Icon className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {!item.isRead ? (
                <span className="bg-primary size-2 rounded-full" />
              ) : null}
              <p className="font-semibold">{item.theme}</p>
              <Badge variant="secondary">{config.label}</Badge>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">{item.message}</p>
            <p className="text-muted-foreground mt-3 text-xs font-medium">
              {config.intent}
            </p>
          </div>
          {target ? (
            <ExternalLink className="text-muted-foreground mt-1 size-4 shrink-0" />
          ) : null}
        </CardContent>
      </Card>
    )

    return (
      <Link
        key={item.id}
        to="/notifications/$notificationId"
        params={{ notificationId: item.id }}
        className="block"
        aria-label={`Voir le detail: ${item.theme}`}
      >
        {card}
      </Link>
    )
  }

  return (
    <AppLayout actor={actor} page="notifications">
      <div className="grid gap-4">
        {notificationItems.map(renderNotificationCard)}
      </div>
    </AppLayout>
  )
}

export function NotificationDetailWorkspacePage({
  notificationId,
}: {
  notificationId: string
}) {
  const { actor } = useResolvedActor('journalist')
  const item =
    notificationItems.find((candidate) => candidate.id === notificationId) ??
    notificationItems[0]
  const config = getNotificationConfig(item.type)
  const target = getNotificationTarget(item)
  const Icon = config.icon

  return (
    <AppLayout actor={actor} page="notifications">
      <Card
        className={cn(
          !item.isRead && 'border-primary/30 bg-primary/5 shadow-primary/10',
        )}
      >
        <CardHeader>
          <div className="flex flex-wrap items-start gap-4">
            <div
              className={cn(
                'bg-muted flex size-11 shrink-0 items-center justify-center rounded-full',
                !item.isRead && 'bg-primary/10 text-primary',
              )}
            >
              <Icon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {!item.isRead ? (
                  <span className="bg-primary size-2 rounded-full" />
                ) : null}
                <CardTitle>{item.theme}</CardTitle>
                <Badge variant="secondary">{config.label}</Badge>
              </div>
              <CardDescription className="mt-2">{item.message}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {target?.kind === 'publication' ? (
              <Button asChild>
                <Link
                  to="/publications/$publicationId"
                  params={{ publicationId: target.id }}
                >
                  <ExternalLink />
                  {target.label}
                </Link>
              </Button>
            ) : null}
            {target?.kind === 'investigation' ? (
              <Button asChild>
                <Link
                  to="/investigations/$investigationId"
                  params={{ investigationId: target.id }}
                >
                  <ExternalLink />
                  {target.label}
                </Link>
              </Button>
            ) : null}
            <Button variant="outline" asChild>
              <Link to="/notifications">Retour aux notifications</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  )
}

export function GuestHomePage() {
  return (
    <AppLayout actor="guest" page="dashboard">
      <div className="grid gap-6 xl:grid-cols-3">
        {[
          ['Citoyen', 'Depose un signalement ou candidate comme vigie.'],
          ['Journaliste', 'Prend un sujet et prepare le dossier.'],
          ['Direction', 'Arbitre, publie, archive ou demande correction.'],
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
              Connecte-toi pour ouvrir l'espace adapte a ton role.
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
