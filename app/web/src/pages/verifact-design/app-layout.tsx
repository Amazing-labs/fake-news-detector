import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import {
  AlertTriangle,
  Archive,
  Bell,
  Moon,
  Newspaper,
  RotateCcw,
  Search,
  ShieldCheck,
  Sun,
} from 'lucide-react'
import type { ComponentType, ReactNode } from 'react'
import { useLayoutEffect, useRef } from 'react'
import { signOutAppSession, useAppSession } from '../../entities/session/model'
import { cn } from '../../shared/lib/utils'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../shared/ui/shadcn/avatar'
import { Badge } from '../../shared/ui/shadcn/badge'
import { Button } from '../../shared/ui/shadcn/button'
import { Input } from '../../shared/ui/shadcn/input'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../../shared/ui/shadcn/hover-card'
import { Separator } from '../../shared/ui/shadcn/separator'
import { actorLabels, navByActor, navItems } from './data'
import { notificationItems } from './workspace-mocks'
import {
  actorFromSession,
  inferActor,
  initials,
  sessionRoleLabel,
} from './session-routing'
import { useTheme } from './theme'
import type { Actor, PageKind } from './types'

let tabletNavScrollLeft = 0

const NOTIF_ICONS: Record<
  (typeof notificationItems)[number]['type'],
  ComponentType<{ className?: string }>
> = {
  PUBLICATION: Newspaper,
  CORRECTION: RotateCcw,
  ALERT: AlertTriangle,
  ARCHIVED_PUBLICATION: Archive,
}

function NotificationPopover({ unreadCount }: { unreadCount: number }) {
  return (
    <HoverCard openDelay={150} closeDelay={250}>
      <HoverCardTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <span className="relative">
            <Bell className="size-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex size-3">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-destructive opacity-60" />
                <span className="relative inline-flex size-3 items-center justify-center rounded-full bg-destructive text-[8px] font-bold text-white">
                  {unreadCount}
                </span>
              </span>
            )}
          </span>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent align="end" className="w-[380px] p-0">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3">
          <span className="text-sm font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              {unreadCount} non lues
            </Badge>
          )}
        </div>
        <Separator />
        {/* Notification rows */}
        <div className="max-h-[340px] overflow-y-auto">
          {notificationItems.map((item) => {
            const Icon = NOTIF_ICONS[item.type]
            return (
              <Link
                key={item.id}
                to="/notifications/$notificationId"
                params={{ notificationId: item.id }}
                className={cn(
                  'hover:bg-muted/60 flex items-start gap-3 px-4 py-3 transition-colors',
                  !item.isRead && 'bg-primary/5',
                )}
              >
                <div
                  className={cn(
                    'bg-muted mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full',
                    !item.isRead && 'bg-primary/10 text-primary',
                  )}
                >
                  <Icon className="size-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {!item.isRead && (
                      <span className="bg-primary size-1.5 shrink-0 rounded-full" />
                    )}
                    <p className="truncate text-sm font-medium">{item.theme}</p>
                  </div>
                  <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">
                    {item.message}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
        <Separator />
        {/* Footer */}
        <div className="px-4 py-2">
          <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
            <Link to="/notifications">Voir toutes les notifications</Link>
          </Button>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

export function AppLayout(props: {
  actor?: Actor
  page: PageKind
  children: ReactNode
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const tabletNavRef = useRef<HTMLDivElement>(null)
  const { isDark, setIsDark } = useTheme()
  const { session } = useAppSession()
  const actor =
    actorFromSession(session) ?? props.actor ?? inferActor(location.pathname)
  const displayName = session?.user.name || actorLabels[actor]
  const roleLabel = sessionRoleLabel(session, actor)
  const visibleNavItems = navItems.filter((item) =>
    navByActor[actor].includes(item.label),
  )
  const unreadCount = notificationItems.filter((n) => !n.isRead).length

  async function handleSignOut() {
    await signOutAppSession()
    await navigate({ to: '/auth', search: { mode: 'sign-in' } })
  }

  function isActivePath(to: string) {
    const sectionPath = to.split('/')[1]

    return (
      location.pathname === to ||
      (to !== '/' &&
        location.pathname.startsWith(sectionPath ? `/${sectionPath}` : to))
    )
  }

  useLayoutEffect(() => {
    const nav = tabletNavRef.current

    if (nav) {
      nav.scrollLeft = tabletNavScrollLeft
    }
  }, [location.pathname, visibleNavItems])

  return (
    <div className="bg-background text-foreground min-h-screen">
      <aside className="bg-sidebar text-sidebar-foreground border-sidebar-border fixed inset-y-0 left-0 z-30 hidden w-72 border-r lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-3 px-5">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex size-9 items-center justify-center rounded-lg">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Fake News Detector</p>
            <p className="text-muted-foreground text-xs">
              Desk de vérification
            </p>
          </div>
        </div>
        <Separator />
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {visibleNavItems.map((item) => {
            const Icon = item.icon
            const active = isActivePath(item.to)

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
              <AvatarImage src={session?.user.image ?? ''} alt={displayName} />
              <AvatarFallback>{initials(displayName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{displayName}</p>
              <p className="text-muted-foreground truncate text-xs">
                {session ? roleLabel : 'Session invitée'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="bg-background/90 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-20 border-b backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <div className="flex items-center gap-2 lg:hidden">
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex size-9 items-center justify-center rounded-lg">
                <ShieldCheck className="size-5" />
              </div>
              <span className="hidden text-sm font-semibold sm:inline">
                Fake News Detector
              </span>
            </div>
            <div className="relative hidden flex-1 sm:block">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                className="max-w-xl pl-9"
                placeholder="Chercher un sujet, une source ou une correction"
              />
            </div>
            <Badge variant="outline" className="ml-auto hidden sm:inline-flex">
              {roleLabel}
            </Badge>
            <NotificationPopover unreadCount={unreadCount} />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDark((value) => !value)}
              aria-label="Changer de theme"
            >
              {isDark ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </Button>
            <Button variant="outline" asChild>
              {session ? (
                <button type="button" onClick={() => void handleSignOut()}>
                  Déconnexion
                </button>
              ) : (
                <Link to="/auth" search={{ mode: 'sign-in' }}>
                  Connexion
                </Link>
              )}
            </Button>
          </div>
          <nav className="border-t lg:hidden">
            <div
              ref={tabletNavRef}
              className="scrollbar-thin flex gap-2 overflow-x-auto px-4 py-2 sm:px-6"
              onScroll={(event) => {
                tabletNavScrollLeft = event.currentTarget.scrollLeft
              }}
            >
              {visibleNavItems.map((item) => {
                const Icon = item.icon
                const active = isActivePath(item.to)

                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => {
                      tabletNavScrollLeft =
                        tabletNavRef.current?.scrollLeft ?? tabletNavScrollLeft
                    }}
                    className={cn(
                      'flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm transition-colors',
                      active
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <Icon className="size-4" />
                    <span>{item.label}</span>
                    {item.badge ? (
                      <Badge
                        variant={active ? 'secondary' : 'outline'}
                        className="h-5 px-1.5"
                      >
                        {item.badge}
                      </Badge>
                    ) : null}
                  </Link>
                )
              })}
            </div>
          </nav>
        </header>

        <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6">
          {props.children}
        </main>
      </div>
    </div>
  )
}
