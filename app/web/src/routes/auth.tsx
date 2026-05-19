import { createFileRoute } from '@tanstack/react-router'
import { AuthPage } from '../pages/auth/auth-page'

export const Route = createFileRoute('/auth')({
  validateSearch: (search: Record<string, unknown>) => ({
    mode: search.mode === 'sign-up' ? 'sign-up' : 'sign-in',
  }),
  component: AuthRoute,
})

function AuthRoute() {
  const { mode } = Route.useSearch()
  const initialMode = mode === 'sign-up' ? 'sign-up' : 'sign-in'

  return <AuthPage initialMode={initialMode} />
}
