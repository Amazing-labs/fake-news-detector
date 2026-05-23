import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { Moon, Search, ShieldCheck, Sun } from 'lucide-react'
import type { ReactNode } from 'react'
import { useAppSession } from '../../entities/session/model'
import { authClient } from '../../lib/auth-client'
import { cn } from '../../shared/lib/utils'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../shared/ui/shadcn/avatar'
import { Badge } from '../../shared/ui/shadcn/badge'
import { Button } from '../../shared/ui/shadcn/button'
import { Input } from '../../shared/ui/shadcn/input'
import { Separator } from '../../shared/ui/shadcn/separator'
import { actorLabels, navByActor, navItems } from './data'
import {
  actorFromSession,
  inferActor,
  initials,
  sessionRoleLabel,
} from './session-routing'
import { useTheme } from './theme'
import type { Actor, PageKind } from './types'

export function AppLayout(props: {
  actor?: Actor
  page: PageKind
  children: ReactNode
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const { isDark, setIsDark } = useTheme()
  const { session } = useAppSession()
  const actor =
    actorFromSession(session) ?? props.actor ?? inferActor(location.pathname)
  const displayName = session?.user.name || actorLabels[actor]
  const roleLabel = sessionRoleLabel(session, actor)
  const visibleNavItems = navItems.filter((item) =>
    navByActor[actor].includes(item.label),
  )

  async function handleSignOut() {
    await authClient.signOut()
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
                {session ? roleLabel : 'Session invitee'}
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
                  Deconnexion
                </button>
              ) : (
                <Link to="/auth" search={{ mode: 'sign-in' }}>
                  Connexion
                </Link>
              )}
            </Button>
          </div>
          <nav className="border-t lg:hidden">
            <div className="scrollbar-thin flex gap-2 overflow-x-auto px-4 py-2 sm:px-6">
              {visibleNavItems.map((item) => {
                const Icon = item.icon
                const active = isActivePath(item.to)

                return (
                  <Link
                    key={item.label}
                    to={item.to}
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
