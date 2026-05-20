import { Link, useRouterState } from '@tanstack/react-router'
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

type NavSubRoute = {
  to: string
  label: string
}

const navSubRoutes: Record<string, NavSubRoute[]> = {
  '/inbox-subjects': [
    { to: '/inbox-subjects/global', label: 'Global' },
    { to: '/inbox-subjects/create', label: 'Creation' },
    { to: '/inbox-subjects/reports', label: 'Signalements' },
  ],
  '/investigations': [
    { to: '/investigations/pending-review', label: 'En attente' },
    { to: '/investigations/published', label: 'Publiees' },
  ],
  '/publications': [
    { to: '/publications/list', label: 'Liste' },
    { to: '/publications/corrections', label: 'Correctifs' },
  ],
}

function isActivePath(pathname: string, to: string) {
  return pathname === to || (to !== '/' && pathname.startsWith(to))
}

function getSubRoutes(to: string) {
  return navSubRoutes[to] ?? []
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
    <div className="min-h-screen bg-[#f5f2ee] text-[#171514]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(255,255,255,0.9),transparent_24%),radial-gradient(circle_at_80%_0%,rgba(244,214,151,0.18),transparent_28%)]" />
      <header className="sticky top-0 z-30 border-b border-[#e8e2da]/80 bg-[#f5f2ee]/88 backdrop-blur-xl">
        <div className="mx-auto max-w-[1180px] px-4 py-3 md:flex md:justify-center md:px-5">
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
                const subRoutes = getSubRoutes(item.to)
                const hasSubRoutes = subRoutes.length > 0
                return (
                  <div key={item.to}>
                    {hasSubRoutes ? (
                      <span
                        className={`block rounded-2xl px-3 py-2.5 text-sm font-black ${
                          active ? 'bg-[#171514] text-white' : 'text-[#6f6963]'
                        }`}
                      >
                        {item.label}
                      </span>
                    ) : (
                      <Link
                        to={item.to}
                        className={`block rounded-2xl px-3 py-2.5 text-sm font-black transition ${
                          active
                            ? 'bg-[#171514] text-white'
                            : 'text-[#6f6963] hover:bg-[#f7f4ef] hover:text-[#171514]'
                        }`}
                      >
                        {item.label}
                      </Link>
                    )}
                    {hasSubRoutes ? (
                      <div className="mt-1 ml-3 grid gap-1 border-l border-[#eee9e2] pl-2">
                        {subRoutes.map((subRoute) => (
                          <Link
                            key={subRoute.to}
                            to={subRoute.to}
                            className="rounded-xl px-3 py-2 text-sm font-bold text-[#706a63] hover:bg-[#f7f4ef] hover:text-[#171514]"
                          >
                            {subRoute.label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </nav>
          </details>

          <nav className="hidden w-fit max-w-full rounded-full border border-white/70 bg-white/45 p-1 shadow-[0_18px_55px_rgba(33,28,23,0.14),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-2xl md:flex md:items-center md:gap-1">
            {navigation.map((item) => {
              const active = isActivePath(pathname, item.to)
              const subRoutes = getSubRoutes(item.to)
              const hasSubRoutes = subRoutes.length > 0
              return (
                <div key={item.to} className="group relative">
                  {hasSubRoutes ? (
                    <button
                      type="button"
                      className={`block rounded-full px-4 py-2 text-sm font-black transition duration-200 ${
                        active
                          ? 'bg-[#171514] text-white shadow-[0_10px_24px_rgba(23,21,20,0.16)]'
                          : 'text-[#6f6963] hover:bg-[#f7f4ef] hover:text-[#171514]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ) : (
                    <Link
                      to={item.to}
                      className={`block rounded-full px-4 py-2 text-sm font-black transition duration-200 ${
                        active
                          ? 'bg-[#171514] text-white shadow-[0_10px_24px_rgba(23,21,20,0.16)]'
                          : 'text-[#6f6963] hover:bg-[#f7f4ef] hover:text-[#171514]'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )}
                  {hasSubRoutes ? (
                    <div className="invisible absolute top-full left-1/2 z-50 w-48 -translate-x-1/2 pt-2 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                      <div className="rounded-[1.25rem] border border-white/70 bg-white/94 p-2 shadow-[0_20px_60px_rgba(33,28,23,0.14)] backdrop-blur-xl">
                        {subRoutes.map((subRoute) => (
                          <Link
                            key={subRoute.to}
                            to={subRoute.to}
                            className="block rounded-2xl px-3 py-2 text-sm font-black text-[#706a63] hover:bg-[#f7f4ef] hover:text-[#171514]"
                          >
                            {subRoute.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </nav>
        </div>
      </header>

      <div className="relative mx-auto grid max-w-[1180px] gap-6 px-4 py-7 md:px-5">
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
