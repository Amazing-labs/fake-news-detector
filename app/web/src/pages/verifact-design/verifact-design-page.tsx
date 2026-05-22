import { Link, useLocation } from '@tanstack/react-router'
import {
  Archive,
  BarChart3,
  Bell,
  BookOpenCheck,
  CheckCircle2,
  CircleHelp,
  Clock3,
  FileCheck2,
  FilePlus2,
  FileSearch,
  Home,
  Inbox,
  LayoutDashboard,
  LogIn,
  Moon,
  Newspaper,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  UserCog,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '../../shared/ui/shadcn/alert'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../shared/ui/shadcn/avatar'
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
import { Separator } from '../../shared/ui/shadcn/separator'
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
import { cn } from '../../shared/lib/utils'

type Actor =
  | 'guest'
  | 'citizen'
  | 'watcher'
  | 'journalist'
  | 'director'
  | 'admin'
type PageKind =
  | 'dashboard'
  | 'subjects'
  | 'reports'
  | 'investigations'
  | 'publications'
  | 'people'
  | 'notifications'
  | 'profile'
  | 'auth'
  | 'create-subject'
  | 'correction'

type NavItem = {
  label: string
  to: string
  icon: LucideIcon
  badge?: string
}

const actorLabels: Record<Actor, string> = {
  guest: 'Invité',
  citizen: 'Citoyen',
  watcher: 'Vigie',
  journalist: 'Journaliste',
  director: 'Directeur',
  admin: 'Admin',
}

const navItems: NavItem[] = [
  { label: 'Accueil', to: '/', icon: Home },
  { label: 'Tableau de bord', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Sujets', to: '/inbox-subjects/global', icon: Inbox, badge: '24' },
  { label: 'Signalements', to: '/reports', icon: FileSearch, badge: '8' },
  { label: 'Enquêtes', to: '/investigations', icon: ShieldCheck, badge: '5' },
  { label: 'Publications', to: '/publications/list', icon: Newspaper },
  { label: 'Utilisateurs', to: '/journalists/list', icon: Users },
  { label: 'Notifications', to: '/notifications', icon: Bell, badge: '12' },
  { label: 'Profil', to: '/profile', icon: UserCog },
]

const roleCards: Array<{
  actor: Actor
  title: string
  description: string
  metric: string
  icon: LucideIcon
}> = [
  {
    actor: 'citizen',
    title: 'Citoyen',
    description:
      'Déposer un signalement, suivre son état et recevoir les corrections.',
    metric: '8 retours',
    icon: FilePlus2,
  },
  {
    actor: 'watcher',
    title: 'Vigie',
    description:
      'Qualifier les sujets entrants et documenter les premières preuves.',
    metric: '16 sujets',
    icon: FileSearch,
  },
  {
    actor: 'journalist',
    title: 'Journaliste',
    description:
      'Conduire les enquêtes, recouper les sources et préparer la note.',
    metric: '5 enquêtes',
    icon: BookOpenCheck,
  },
  {
    actor: 'director',
    title: 'Directeur',
    description:
      'Arbitrer, publier, demander un correctif ou archiver un dossier.',
    metric: '3 arbitrages',
    icon: ShieldCheck,
  },
]

const workItems = [
  {
    title: 'Crise d’essence',
    source: 'Signalement citoyen',
    status: 'En attente',
    owner: 'Desk alertes',
    priority: 'Haute',
  },
  {
    title: 'Vidéo sortie de contexte',
    source: 'Réseaux sociaux',
    status: 'Enquête',
    owner: 'Cellule preuves',
    priority: 'Critique',
  },
  {
    title: 'Chiffre économique contesté',
    source: 'Publication locale',
    status: 'Relecture',
    owner: 'Rédaction',
    priority: 'Normale',
  },
]

const notifications = [
  {
    title: 'Nouvelle preuve ajoutée',
    body: 'La cellule preuves a joint une source primaire au dossier carburant.',
    badge: 'preuve',
    unread: true,
  },
  {
    title: 'Arbitrage requis',
    body: 'Une enquête attend la décision du directeur de publication.',
    badge: 'urgent',
    unread: true,
  },
  {
    title: 'Correction planifiée',
    body: 'Un correctif est prêt à être relu avant publication.',
    badge: 'correctif',
    unread: false,
  },
]

function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return true
    return window.localStorage.getItem('verifact-theme') !== 'light'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    window.localStorage.setItem('verifact-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  return { isDark, setIsDark }
}

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
}

function AppLayout(props: {
  actor?: Actor
  page: PageKind
  children: React.ReactNode
}) {
  const location = useLocation()
  const { isDark, setIsDark } = useTheme()
  const actor = props.actor ?? inferActor(location.pathname)

  return (
    <div className="bg-background text-foreground min-h-screen">
      <aside className="bg-sidebar text-sidebar-foreground border-sidebar-border fixed inset-y-0 left-0 z-30 hidden w-72 border-r lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-3 px-5">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex size-9 items-center justify-center rounded-lg">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Fake News Detector</p>
            <p className="text-muted-foreground text-xs">Verification desk</p>
          </div>
        </div>
        <Separator />
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const active =
              location.pathname === item.to ||
              (item.to !== '/' &&
                location.pathname.startsWith(
                  item.to.split('/')[1] ? `/${item.to.split('/')[1]}` : item.to,
                ))
            return (
              <Link
                key={item.label}
                to={item.to}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                )}
              >
                <Icon className="size-4" />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {item.badge ? (
                  <Badge variant="secondary" className="h-5 px-1.5">
                    {item.badge}
                  </Badge>
                ) : null}
              </Link>
            )
          })}
        </nav>
        <Separator />
        <div className="p-3">
          <div className="bg-sidebar-accent/50 flex items-center gap-3 rounded-lg p-3">
            <Avatar>
              <AvatarImage src="" alt="Rédaction" />
              <AvatarFallback>{initials(actorLabels[actor])}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {actorLabels[actor]}
              </p>
              <p className="text-muted-foreground truncate text-xs">
                Session de travail
              </p>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="bg-background/90 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-20 border-b backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <div className="relative hidden flex-1 sm:block">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                className="max-w-xl pl-9"
                placeholder="Chercher un sujet, une source ou une correction"
              />
            </div>
            <Badge variant="outline" className="ml-auto hidden sm:inline-flex">
              {actorLabels[actor]}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDark((value) => !value)}
              aria-label="Changer de thème"
            >
              {isDark ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </Button>
            <Button variant="outline" asChild>
              <Link to="/auth" search={{ mode: 'sign-in' }}>
                Connexion
              </Link>
            </Button>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6">
          {props.children}
        </main>
      </div>
    </div>
  )
}

function inferActor(pathname: string): Actor {
  if (pathname.includes('journalists')) return 'admin'
  if (pathname.includes('publications') || pathname.includes('investigations'))
    return 'director'
  if (pathname.includes('reports') || pathname.includes('watcher'))
    return 'watcher'
  if (pathname.includes('citizen')) return 'citizen'
  if (pathname === '/' || pathname.includes('auth')) return 'guest'
  return 'journalist'
}

function PageHeader(props: {
  eyebrow: string
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-muted-foreground text-xs tracking-[0.25em] uppercase">
          {props.eyebrow}
        </CardTitle>
        <CardDescription className="max-w-3xl text-base">
          <span className="text-foreground block text-4xl font-semibold tracking-tight">
            {props.title}
          </span>
          <span className="mt-3 block">{props.description}</span>
        </CardDescription>
        {props.action ? <CardAction>{props.action}</CardAction> : null}
      </CardHeader>
    </Card>
  )
}

function MetricGrid({ actor }: { actor: Actor }) {
  const metrics = useMemo(
    () => [
      ['Sujets ouverts', actor === 'guest' ? '24' : '18', Inbox, '+12%'],
      ['À arbitrer', actor === 'director' ? '7' : '3', ShieldCheck, 'priorité'],
      ['Preuves vérifiées', '142', FileCheck2, '+28'],
      ['Notifications', '12', Bell, 'non lues'],
    ],
    [actor],
  )

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map(([label, value, Icon, hint]) => (
        <Card key={label as string}>
          <CardHeader>
            <CardTitle className="text-muted-foreground flex items-center justify-between text-sm font-medium">
              {label as string}
              <Icon className="size-4" />
            </CardTitle>
            <CardDescription>
              <span className="text-foreground text-3xl font-semibold">
                {value as string}
              </span>
              <span className="ml-2">{hint as string}</span>
            </CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

function RoleDashboard({ actor }: { actor: Actor }) {
  const currentRole =
    roleCards.find((role) => role.actor === actor) ?? roleCards[2]
  const Icon = currentRole.icon

  return (
    <AppLayout actor={actor} page="dashboard">
      <PageHeader
        eyebrow="Fake News Detector"
        title={
          actor === 'guest'
            ? 'Dashboard invité.'
            : `Dashboard ${actorLabels[actor].toLowerCase()}.`
        }
        description={
          actor === 'guest'
            ? 'La première vue montre le produit en action: flux, rôles, priorités et décisions éditoriales.'
            : currentRole.description
        }
        action={
          <Button asChild>
            <Link to={actor === 'guest' ? '/auth' : '/inbox-subjects/global'}>
              {actor === 'guest' ? <LogIn /> : <Plus />}
              {actor === 'guest' ? 'Entrer dans le desk' : 'Nouveau dossier'}
            </Link>
          </Button>
        }
      />
      <MetricGrid actor={actor} />
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <WorkTable />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon className="size-5" />
              Vue rôle
            </CardTitle>
            <CardDescription>{currentRole.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {roleCards.map((role) => {
              const RoleIcon = role.icon
              return (
                <div
                  key={role.actor}
                  className={cn(
                    'rounded-lg border p-3',
                    role.actor === actor && 'bg-muted',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <RoleIcon className="text-muted-foreground size-4" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{role.title}</p>
                      <p className="text-muted-foreground text-xs">
                        {role.metric}
                      </p>
                    </div>
                    {role.actor === actor ? <Badge>Actif</Badge> : null}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

function WorkTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>File de travail</CardTitle>
        <CardDescription>
          Une liste unique et lisible pour qualifier, enquêter et arbitrer.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sujet</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Priorité</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workItems.map((item) => (
              <TableRow key={item.title}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell className="text-muted-foreground">
                  {item.source}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{item.status}</Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      item.priority === 'Critique' ? 'destructive' : 'outline'
                    }
                  >
                    {item.priority}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function ActorTabsPage(props: {
  actor: Actor
  title: string
  description: string
  tabs: Array<{ value: string; label: string; icon: LucideIcon }>
}) {
  return (
    <AppLayout actor={props.actor} page="subjects">
      <PageHeader
        eyebrow="Fake News Detector"
        title={props.title}
        description={props.description}
        action={
          <Button>
            <FilePlus2 />
            Créer
          </Button>
        }
      />
      <Tabs defaultValue={props.tabs[0]?.value ?? 'global'}>
        <TabsList>
          {props.tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <TabsTrigger key={tab.value} value={tab.value}>
                <Icon className="size-4" />
                {tab.label}
              </TabsTrigger>
            )
          })}
        </TabsList>
        {props.tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            <WorkTable />
          </TabsContent>
        ))}
      </Tabs>
    </AppLayout>
  )
}

function NotificationsDashboard() {
  return (
    <AppLayout actor="journalist" page="notifications">
      <PageHeader
        eyebrow="Fake News Detector"
        title="Notifications."
        description="Les alertes importantes restent groupées par priorité, avec badges shadcn pour lecture rapide."
      />
      <div className="grid gap-4">
        {notifications.map((notification) => (
          <Card key={notification.title} className="py-0">
            <CardContent className="flex items-start gap-4 p-5">
              <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-full">
                <Bell className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{notification.title}</h2>
                  <Badge
                    variant={notification.unread ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {notification.badge}
                  </Badge>
                  {notification.unread ? (
                    <Badge variant="outline">Non lue</Badge>
                  ) : null}
                </div>
                <p className="text-muted-foreground mt-1 text-sm">
                  {notification.body}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  )
}

function ProfileDashboard() {
  return (
    <AppLayout actor="journalist" page="profile">
      <PageHeader
        eyebrow="Fake News Detector"
        title="Profil de travail."
        description="Une vue session utile, sans décor inutile, centrée sur les droits et l’activité."
      />
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Identité</CardTitle>
            <CardDescription>Rédaction connectée</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="size-14">
                <AvatarFallback>DK</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">Dioman Keita</p>
                <p className="text-muted-foreground text-sm">
                  diomankeita001@gmail.com
                </p>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              Déconnexion
            </Button>
          </CardContent>
        </Card>
        <WorkTable />
      </div>
    </AppLayout>
  )
}

export function VeriFactAuthPage() {
  useTheme()

  return (
    <div className="bg-background text-foreground grid min-h-screen place-items-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <ShieldCheck className="size-6" />
            Espace vérification
          </CardTitle>
          <CardDescription>
            Authentification shadcn, sobre et orientée dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <Alert>
            <Sparkles className="size-4" />
            <AlertTitle>Dashboard-first</AlertTitle>
            <AlertDescription>
              Après connexion, chaque acteur arrive directement sur son espace
              de travail.
            </AlertDescription>
          </Alert>
          <div className="grid gap-3">
            <Label htmlFor="email">Email</Label>
            <Input id="email" placeholder="redaction@fnd.test" type="email" />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" placeholder="••••••••" type="password" />
          </div>
          <Button className="w-full">Connexion</Button>
          <Button variant="outline" className="w-full" asChild>
            <Link to="/">Voir le dashboard invité</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export function NotFoundPage() {
  useTheme()

  return (
    <div className="bg-background text-foreground grid min-h-screen place-items-center p-4">
      <Card className="w-full max-w-xl text-center">
        <CardHeader>
          <CardTitle className="text-5xl">404</CardTitle>
          <CardDescription>
            Cette route n’existe pas dans le desk de vérification.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3">
          <CircleHelp className="text-muted-foreground size-10" />
          <p className="text-muted-foreground text-sm">
            Reviens au tableau de bord pour continuer le flux de travail.
          </p>
          <Button asChild>
            <Link to="/dashboard">Retour au dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export function VeriFactDashboardPage() {
  return <RoleDashboard actor="guest" />
}

export function VeriFactCitizenDashboardPage() {
  return <RoleDashboard actor="citizen" />
}

export function VeriFactWatcherDashboardPage() {
  return <RoleDashboard actor="watcher" />
}

export function VeriFactJournalistDashboardPage() {
  return <RoleDashboard actor="journalist" />
}

export function VeriFactDirectorDashboardPage() {
  return <RoleDashboard actor="director" />
}

export function VeriFactClaimsPage() {
  return (
    <ActorTabsPage
      actor="watcher"
      title="Sujets."
      description="Qualification par filtre: global, créations internes et signalements citoyens."
      tabs={[
        { value: 'global', label: 'Global', icon: Inbox },
        { value: 'create', label: 'Création', icon: FilePlus2 },
        { value: 'reports', label: 'Signalements', icon: FileSearch },
      ]}
    />
  )
}

export function VeriFactPendingPage() {
  return (
    <ActorTabsPage
      actor="director"
      title="Enquêtes."
      description="Une seule page avec filtre entre dossiers en attente, publiés et annulés."
      tabs={[
        { value: 'pending', label: 'En attente', icon: Clock3 },
        { value: 'published', label: 'Publiées', icon: CheckCircle2 },
        { value: 'canceled', label: 'Annulées', icon: Archive },
      ]}
    />
  )
}

export function VeriFactNotificationsPage() {
  return <NotificationsDashboard />
}

export function VeriFactProfilePage() {
  return <ProfileDashboard />
}

export function VeriFactGenericPage(props: {
  title: string
  description: string
  kind?: 'dashboard' | 'claims' | 'pending' | 'analytics' | 'profile'
}) {
  if (props.kind === 'claims') return <VeriFactClaimsPage />
  if (props.kind === 'pending') return <VeriFactPendingPage />
  if (props.kind === 'profile') return <VeriFactProfilePage />
  if (props.kind === 'analytics') {
    return (
      <ActorTabsPage
        actor="admin"
        title={props.title}
        description={props.description}
        tabs={[
          { value: 'overview', label: 'Vue globale', icon: BarChart3 },
          { value: 'users', label: 'Utilisateurs', icon: Users },
        ]}
      />
    )
  }

  return (
    <AppLayout actor="journalist" page="dashboard">
      <PageHeader
        eyebrow="Fake News Detector"
        title={`${props.title}.`}
        description={props.description}
      />
      <MetricGrid actor="journalist" />
      <WorkTable />
    </AppLayout>
  )
}

export function CorrectionsPage() {
  return (
    <AppLayout actor="director" page="correction">
      <PageHeader
        eyebrow="Fake News Detector"
        title="Créer un correctif."
        description="Formulaire shadcn pour préparer une correction éditoriale sans sortir du dashboard."
      />
      <Card>
        <CardHeader>
          <CardTitle>Correctif</CardTitle>
          <CardDescription>
            Associe la publication et rédige la note.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="publication">Publication</Label>
            <Input id="publication" placeholder="Titre ou référence publique" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="correction">Correction</Label>
            <Textarea
              id="correction"
              placeholder="Explique le correctif à publier"
            />
          </div>
          <Button className="w-fit">Préparer le correctif</Button>
        </CardContent>
      </Card>
    </AppLayout>
  )
}
