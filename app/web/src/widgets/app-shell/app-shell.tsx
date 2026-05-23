import { Link, useRouterState } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import type { AppSession } from '../../lib/auth-client'
import { getNavigationForSession } from '../../shared/session/role-access'
import { Button } from '../../shared/ui/primitives'

export function AppShell(props: {
  session: AppSession | null
  isPending: boolean
  onSignOut: () => Promise<void>
  children: ReactNode
}) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const navigation = getNavigationForSession(props.session)

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[240px_1fr]">
        <aside className="border-b border-slate-200 bg-white p-4 lg:border-r lg:border-b-0">
          <div className="space-y-1">
            <Link to="/" className="block text-lg font-semibold text-slate-950">
              Fake News Detector
            </Link>
            <p className="text-sm text-slate-600">
              Frontend minimal pour tester les workflows backend.
            </p>
          </div>

          <nav className="mt-6 grid gap-1">
            {navigation.map((item) => {
              const active = pathname === item.to
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`rounded-md px-3 py-2 text-sm ${
                    active
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-950">
                {props.isPending
                  ? 'Chargement de session...'
                  : props.session
                    ? props.session.user.email
                    : 'Aucune session'}
              </p>
              <p className="text-xs text-slate-600">
                Role: {props.session?.user.actorRole ?? 'Invite'} | Statut:{' '}
                {props.session?.user.actorStatus ?? 'N/A'} | Source:{' '}
                {props.session?.meta?.authSource === 'frontend-bypass'
                  ? 'Bypass frontend'
                  : 'Better Auth'}
              </p>
            </div>
            {props.session ? (
              <Button
                variant="secondary"
                onClick={() => {
                  void props.onSignOut()
                }}
              >
                Deconnexion
              </Button>
            ) : null}
          </header>
          <main className="flex-1 p-4">{props.children}</main>
        </div>
      </div>
    </div>
  )
}
