import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { AppShell } from '../widgets/app-shell/app-shell'
import { useAppSession } from '../entities/session/model'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const { session, isPending } = useAppSession()

  return (
    <>
      <AppShell session={session} isPending={isPending}>
        <Outlet />
      </AppShell>
      <TanStackRouterDevtools />
    </>
  )
}
