import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { AppSessionProvider, useAppSession } from '../entities/session/model'
import { AppShell } from '../widgets/app-shell/app-shell'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <AppSessionProvider>
      <RootLayoutContent />
    </AppSessionProvider>
  )
}

function RootLayoutContent() {
  const { session, isPending, signOut } = useAppSession()

  return (
    <>
      <AppShell session={session} isPending={isPending} onSignOut={signOut}>
        <Outlet />
      </AppShell>
      <TanStackRouterDevtools />
    </>
  )
}
