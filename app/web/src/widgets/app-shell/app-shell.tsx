import { Link, useRouterState } from '@tanstack/react-router'
import {
  Bell,
  BookOpenCheck,
  CircleHelp,
  FileText,
  Gauge,
  Home,
  Inbox,
  LayoutList,
  LogOut,
  Megaphone,
  Newspaper,
  SearchCheck,
  ShieldCheck,
  UserRound,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { formatActorStatus, formatUserRole } from '../../entities/session/model'
import { authClient, type AppSession } from '../../lib/auth-client'
import { getNavigationForSession } from '../../shared/session/role-access'
import { Button } from '../../shared/ui/primitives'

const boardStats = [
  ['Notes ouvertes', '24'],
  ['Dossiers actifs', '8'],
  ['A arbitrer', '5'],
  ['Corrections', '12'],
]

function isActivePath(pathname: string, to: string) {
  return pathname === to || (to !== '/' && pathname.startsWith(to))
}

function getNavigationIcon(to: string): LucideIcon {
  if (to === '/') return Home
  if (to.startsWith('/dashboard')) return Gauge
  if (to.startsWith('/watcher-applications')) return ShieldCheck
  if (to.startsWith('/inbox-subjects')) return Inbox
  if (to.startsWith('/investigations')) return SearchCheck
  if (to.startsWith('/publications')) return Newspaper
  if (to.startsWith('/journalists')) return UsersRound
  if (to.startsWith('/notifications')) return Bell
  if (to.startsWith('/profile')) return UserRound
  if (to.startsWith('/citizen')) return BookOpenCheck
  if (to.startsWith('/journalist')) return LayoutList
  if (to.startsWith('/reports')) return Megaphone
  if (to.startsWith('/auth')) return FileText
  return CircleHelp
}

export function AppShell(props: {
  session: AppSession | null | undefined
  isPending: boolean
  children: ReactNode
}) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const navigation = getNavigationForSession(props.session)
  const role = formatUserRole(props.session?.user.actorRole)
  const status = formatActorStatus(props.session?.user.actorStatus)
  const showProfileSummary = pathname === '/profile'
  const activeNavItem =
    navigation.find((item) => isActivePath(pathname, item.to)) ?? navigation[0]

  if (pathname === '/' || pathname === '/auth') {
    return <>{props.children}</>
  }

  return (
    <div className="font-ui min-h-screen bg-[#f5f2ee] text-[#171514]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(255,255,255,0.9),transparent_24%),radial-gradient(circle_at_80%_0%,rgba(244,214,151,0.18),transparent_28%)]" />
      <header className="sticky top-0 z-30 border-b border-[#e8e2da]/80 bg-[#f5f2ee]/88 backdrop-blur-xl md:hidden">
        <div className="mx-auto max-w-[1180px] px-4 py-3">
          <details className="group relative max-w-sm md:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between rounded-full border border-[#e4ded5] bg-white/92 px-4 py-2 text-sm font-black text-[#171514] shadow-[0_10px_30px_rgba(33,28,23,0.06)] [&::-webkit-details-marker]:hidden">
              <span>{activeNavItem?.label ?? 'Menu'}</span>
              <span className="text-lg leading-none transition group-open:rotate-45">
                +
              </span>
            </summary>
            <nav className="absolute right-0 left-0 z-40 mt-2 grid gap-1 rounded-[1.35rem] border border-[#ebe5dc] bg-white/96 p-2 shadow-[0_24px_70px_rgba(33,28,23,0.16)] backdrop-blur">
              {navigation.map((item) => {
                const active = isActivePath(pathname, item.to)
                const Icon = getNavigationIcon(item.to)
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-black transition ${
                      active
                        ? 'bg-[#171514] text-white'
                        : 'text-[#6f6963] hover:bg-[#f7f4ef] hover:text-[#171514]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </details>
        </div>
      </header>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[112px] border-r border-[#e8e2da]/80 bg-white/62 px-3 py-4 shadow-[18px_0_60px_rgba(33,28,23,0.06)] backdrop-blur-2xl md:flex md:flex-col">
        <Link
          to="/"
          className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#171514] text-xs font-black text-white shadow-[0_16px_40px_rgba(23,21,20,0.18)]"
          aria-label="Fake News Detector"
        >
          FND
        </Link>

        <nav className="mt-5 grid flex-1 content-start gap-2 overflow-y-auto pb-3">
          {navigation.map((item) => {
            const active = isActivePath(pathname, item.to)
            const Icon = getNavigationIcon(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-center transition ${
                  active
                    ? 'bg-[#171514] text-white shadow-[0_14px_35px_rgba(23,21,20,0.16)]'
                    : 'text-[#b8b1aa] hover:bg-white/82 hover:text-[#171514]'
                }`}
                title={item.label}
              >
                <Icon
                  className={`h-5 w-5 ${
                    active
                      ? 'text-white'
                      : 'text-[#c7c0b8] group-hover:text-[#171514]'
                  }`}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span className="max-w-full text-[11px] leading-[1.05] font-black break-words">
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto grid justify-items-center gap-2 border-t border-[#ece7df] pt-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#faf8f5] text-xs font-black text-[#171514] ring-1 ring-[#ece7df]">
            {props.session?.user.name
              ?.split(' ')
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part.charAt(0).toUpperCase())
              .join('') ?? 'FND'}
          </div>
          {props.session ? (
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-2xl text-[#b8b1aa] transition hover:bg-white/82 hover:text-[#171514]"
              aria-label="Deconnexion"
              onClick={() => {
                void authClient.signOut()
              }}
            >
              <LogOut className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </aside>

      <div className="relative grid gap-6 px-4 py-7 md:ml-[112px] md:max-w-[calc(100vw-112px)] md:px-8 md:py-8">
        {showProfileSummary ? (
          <aside className="grid gap-4 lg:grid-cols-[1fr_360px]">
            <section className="rounded-[1.8rem] border border-[#ece7df] bg-white/88 p-5 shadow-[0_22px_75px_rgba(33,28,23,0.07)] backdrop-blur md:p-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="grid h-16 w-16 place-items-center rounded-[1.25rem] bg-[#171514] text-lg font-black text-white ring-1 ring-[#e8e2da]">
                    {props.session?.user.name
                      ?.split(' ')
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((part) => part.charAt(0).toUpperCase())
                      .join('') ?? 'FND'}
                  </div>
                  <div>
                    <h1 className="text-2xl font-black tracking-[-0.045em] text-[#171514]">
                      {props.session?.user.name ?? 'Profil'}
                      <span className="font-editorial">.</span>
                    </h1>
                    <p className="mt-1 max-w-xl text-sm leading-6 text-[#706a63]">
                      {role} dans le verification desk.
                    </p>
                  </div>
                </div>
                <Button className="w-full md:w-auto">Nouvelle note</Button>
              </div>
              <div className="mt-5 grid gap-2 text-sm sm:grid-cols-3">
                <p className="rounded-2xl bg-[#faf8f5] px-3 py-2">
                  <span className="block text-xs font-black text-[#918a83] uppercase">
                    Role
                  </span>
                  <span className="font-black text-[#171514]">{role}</span>
                </p>
                <p className="rounded-2xl bg-[#faf8f5] px-3 py-2">
                  <span className="block text-xs font-black text-[#918a83] uppercase">
                    Statut
                  </span>
                  <span className="font-black text-[#171514]">{status}</span>
                </p>
                <p className="truncate rounded-2xl bg-[#faf8f5] px-3 py-2">
                  <span className="block text-xs font-black text-[#918a83] uppercase">
                    Email
                  </span>
                  {props.isPending
                    ? 'Session en chargement'
                    : (props.session?.user.email ?? 'Aucune session')}
                </p>
              </div>
              {props.session ? (
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    className="text-xs font-black text-[#918a83] underline-offset-4 transition hover:text-[#171514] hover:underline"
                    onClick={() => {
                      void authClient.signOut()
                    }}
                  >
                    Deconnexion
                  </button>
                </div>
              ) : null}
            </section>

            <section className="rounded-[1.8rem] border border-[#ece7df] bg-white/80 p-5 shadow-[0_18px_60px_rgba(33,28,23,0.045)] backdrop-blur">
              <h2 className="font-black tracking-[-0.02em]">Activite</h2>
              <div className="mt-3 grid gap-2">
                {boardStats.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-2xl bg-[#faf8f5] px-3 py-2 text-sm"
                  >
                    <span className="text-[#706a63]">{label}</span>
                    <span className="font-black text-[#171514]">{value}</span>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        ) : null}

        <main className="min-w-0">{props.children}</main>
      </div>
    </div>
  )
}
