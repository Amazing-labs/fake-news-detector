import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { AppShell } from '../widgets/app-shell/app-shell'
import { useAppSession } from '../entities/session/model'
import { NotFoundPage } from '../pages/verifact-design/verifact-design-page'
import { Toaster } from 'sonner'

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
})

function RootLayout() {
  const { session, isPending } = useAppSession()

  return (
    <>
      <AppShell session={session} isPending={isPending}>
        <Outlet />
      </AppShell>
      <Toaster richColors position="top-right" />
      <TanStackRouterDevtools />
    </>
  )
}
