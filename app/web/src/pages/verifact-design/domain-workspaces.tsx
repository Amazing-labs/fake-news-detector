import { Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  Archive,
  BadgeCheck,
  Ban,
  CheckCircle2,
  ClipboardCheck,
  FilePlus2,
  FileSearch,
  Gavel,
  Inbox,
  Newspaper,
  PenLine,
  RotateCcw,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react'
import type { ComponentType } from 'react'
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
  },
  {
    title: 'Correction sur le prix du mil',
    verdict: 'TRUE',
    type: 'Correctif',
    evidence: '1 source officielle',
  },
  {
    title: 'Archive: origine de la penurie non verifiable',
    verdict: 'UNVERIFIABLE',
    type: 'Archive',
    evidence: 'Dossier insuffisant',
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

function StatusBadge({
  status,
  className,
}: {
  status: string
  className?: string
}) {
  const labelByStatus: Record<string, string> = {
    ACTIVE: 'Actif',
    APPROVED: 'Approuve',
    ARCHIVED: 'Archive',
    DISABLED: 'Desactive',
    IN_PROGRESS: 'En enquete',
    NEEDS_REVISION: 'A corriger',
    OPEN: 'Ouvert',
    PENDING: 'En attente',
    PENDING_REVIEW: 'Revue direction',
    PUBLISHED: 'Publie',
    REJECTED: 'Rejete',
  }

  if (status === 'PUBLISHED' || status === 'APPROVED' || status === 'ACTIVE') {
    return (
      <Badge className={cn('h-6 rounded-full px-2.5', className)}>
        {labelByStatus[status]}
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
        {labelByStatus[status]}
      </Badge>
    )
  }

  if (status === 'DISABLED' || status === 'REJECTED') {
    return (
      <Badge
        variant="destructive"
        className={cn('h-6 rounded-full px-2.5', className)}
      >
        {labelByStatus[status]}
      </Badge>
    )
  }

  return (
    <Badge
      variant="outline"
      className={cn('h-6 rounded-full px-2.5', className)}
    >
      {labelByStatus[status] ?? status}
    </Badge>
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

export function RoleAwareDashboardPage() {
  const { actor } = useResolvedActor('guest')

  if (actor === 'director') return <DirectorHomePage />
  if (actor === 'journalist') return <JournalistWorkspacePage />
  if (actor === 'watcher') return <WatcherWorkspacePage />
  if (actor === 'citizen') return <CitizenWorkspacePage />

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
            <Button asChild size="sm" variant="outline">
              <Link
                to="/publications/corrections"
                search={{ publicationId: undefined }}
              >
                <RotateCcw />
                Correctif
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
                  <TableCell>{item.verdict}</TableCell>
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
  return (
    <AppLayout actor="journalist" page="dashboard">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Enquetes actives"
          value="5"
          hint="capacite suivie"
          icon={FileSearch}
        />
        <StatCard
          title="A soumettre"
          value="2"
          hint="pret pour revue"
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
          <CardTitle>Dossiers de travail</CardTitle>
          <CardDescription>
            Prendre un sujet, documenter les sources, puis soumettre pour revue.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {investigations
            .filter((item) => item.status !== 'PUBLISHED')
            .map((item) => (
              <div
                key={item.title}
                className="grid gap-4 rounded-lg border p-4 lg:grid-cols-[1fr_15rem]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{item.title}</p>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-muted-foreground mt-2 text-sm">
                    {item.category} / {item.evidence}
                  </p>
                </div>
                <div className="grid gap-2">
                  <Button size="sm">Ouvrir le brouillon</Button>
                  <Button size="sm" variant="outline">
                    Soumettre en revue
                  </Button>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </AppLayout>
  )
}

export function CitizenWorkspacePage() {
  return (
    <AppLayout actor="citizen" page="reports">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Nouveau signalement</CardTitle>
            <CardDescription>
              Les signalements ouverts sont limites pour garder une file
              lisible.
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
            <Button className="w-fit">Envoyer le signalement</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Suivi</CardTitle>
            <CardDescription>
              Un signalement peut rester ouvert, etre archive ou devenir sujet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {reports.slice(0, 2).map((item) => (
              <div key={item.title} className="rounded-lg border p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{item.title}</p>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-muted-foreground mt-2 text-sm">
                  {item.content}
                </p>
              </div>
            ))}
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
                  <Badge variant="outline">{item.category}</Badge>
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
        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
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
              <Button className="w-fit">Creer le sujet</Button>
            </CardContent>
          </Card>
          <InboxList filter="DIRECTOR_INITIATED" actor={actor} />
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
          const investigationId = item.theme
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')

          return (
            <div
              key={item.theme}
              className="hover:bg-muted/30 focus-within:ring-ring relative grid gap-3 rounded-lg border p-4 transition-colors focus-within:ring-2 md:grid-cols-[1fr_auto]"
            >
              <Link
                to="/investigations/$investigationId"
                params={{ investigationId }}
                aria-label={`Ouvrir le detail de ${item.theme}`}
                className="absolute inset-0 rounded-lg outline-none"
              />
              <div className="pointer-events-none">
                <p className="font-medium">{item.theme}</p>
                <p className="text-muted-foreground text-sm">
                  {item.origin} / {item.owner}
                </p>
                <p className="mt-3 text-sm">{item.description}</p>
              </div>
              <div className="relative z-10 flex flex-wrap items-center gap-2 self-start justify-self-start md:justify-self-end">
                <StatusBadge status={item.status} />
                {props.actor === 'director' ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive h-7 px-2"
                  >
                    <Trash2 />
                    Supprimer
                  </Button>
                ) : null}
                {props.actor === 'journalist' && item.status === 'OPEN' ? (
                  <Button size="sm" variant="outline">
                    Prendre
                  </Button>
                ) : null}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
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
  return (
    <AppLayout actor="director" page="investigations">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Validation editoriale</CardTitle>
            <CardDescription>
              Dossier: {investigationId ?? 'selection courante'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {[
              'Verdict brouillon renseigne',
              'Sources autorite rattachees',
              'Medias classes et justifies',
              'Preuves vigies relues',
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <CheckCircle2 className="text-primary size-4" />
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Decision</CardTitle>
            <CardDescription>
              Le rejet demande un commentaire obligatoire dans le workflow.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button>
              <BadgeCheck />
              Publier
            </Button>
            <Button variant="outline">
              <PenLine />
              Demander correction
            </Button>
            <Button variant="outline">
              <Archive />
              Archiver
            </Button>
            <Button variant="outline" className="text-destructive">
              <Ban />
              Annuler
            </Button>
            <Button variant="destructive">
              <XCircle />
              Rejeter
            </Button>
          </CardContent>
        </Card>
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
          <CardAction>
            <Button asChild>
              <Link
                to="/publications/corrections"
                search={{ publicationId: undefined }}
              >
                <RotateCcw />
                Creer un correctif
              </Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="grid gap-3">
          {publications.map((item) => (
            <div key={item.title} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-medium">{item.title}</p>
                <Badge
                  variant={item.type === 'Correctif' ? 'secondary' : 'outline'}
                >
                  {item.type}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-2 text-sm">
                Verdict: {item.verdict} / {item.evidence}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </AppLayout>
  )
}

export function PublicationCorrectionsWorkspacePage() {
  return (
    <AppLayout actor="director" page="publications">
      <Card>
        <CardHeader>
          <CardTitle>Creer un correctif</CardTitle>
          <CardDescription>
            Le correctif est rattache a une notification et une publication.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Label className="grid gap-2">
            Publication
            <Input placeholder="Selectionner une publication" />
          </Label>
          <Label className="grid gap-2">
            Correction
            <Textarea placeholder="Formuler le correctif a publier" />
          </Label>
          <Button className="w-fit">
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

export function NotificationsWorkspacePage() {
  return (
    <AppLayout actor="journalist" page="notifications">
      <div className="grid gap-4">
        {[
          {
            icon: Newspaper,
            type: 'PUBLICATION',
            title: 'Nouvelle publication',
            body: 'Un dossier suivi vient de recevoir un verdict public.',
          },
          {
            icon: RotateCcw,
            type: 'CORRECTION',
            title: 'Correctif publie',
            body: 'Une publication a ete corrigee apres nouvelle validation.',
          },
          {
            icon: Archive,
            type: 'ARCHIVED_PUBLICATION',
            title: 'Dossier archive',
            body: 'Une enquete non verifiable a ete archivee par la direction.',
          },
          {
            icon: AlertTriangle,
            type: 'ALERT',
            title: 'Action requise',
            body: 'Une preuve ou une revision attend ton intervention.',
          },
        ].map((item) => {
          const Icon = item.icon

          return (
            <Card key={item.type}>
              <CardContent className="flex items-start gap-4 p-5">
                <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-full">
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{item.title}</p>
                    <Badge variant="secondary">{item.type}</Badge>
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {item.body}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
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
