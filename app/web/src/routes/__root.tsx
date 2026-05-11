import { Link, createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { authClient, type AppSession } from '../lib/auth-client'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const { data: rawSession, isPending } = authClient.useSession()
  const session = rawSession as AppSession | null

  return (
    <>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(214,168,96,0.24),transparent_34%),linear-gradient(180deg,#fcf8ef_0%,#f4eee2_48%,#efe4d1_100%)] text-stone-900">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <Link
            to="/"
            className="text-xl font-semibold tracking-[0.2em] text-stone-800"
          >
            FACT CHECK
          </Link>
          <nav className="flex items-center gap-4 text-sm text-stone-700">
            <Link to="/" className="[&.active]:font-semibold">
              Auth
            </Link>
            <Link to="/profile" className="[&.active]:font-semibold">
              Session
            </Link>
            <span className="rounded-full border border-stone-300/80 bg-white/70 px-3 py-1 text-xs tracking-[0.18em] text-stone-600 uppercase">
              {isPending ? 'Session...' : (session?.user?.actorRole ?? 'Guest')}
            </span>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-6xl px-6 pb-16">
          <Outlet />
        </main>
      </div>
      <TanStackRouterDevtools />
    </>
  )
}
