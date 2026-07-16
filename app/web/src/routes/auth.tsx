import { createFileRoute } from '@tanstack/react-router'
import { AuthPage } from '../pages/auth/auth-page'
import type { AuthModeType } from '@entities/session/model'

export const Route = createFileRoute('/auth')({
  validateSearch: (search: Record<string, unknown>) => ({
    mode: validateMode(search.mode),
  }),
  component: AuthRoute,
})

function validateMode(mode: string | unknown): AuthModeType | undefined {
  if (!mode) return
  switch (mode) {
    case 'sign-in':
      return 'sign-in'
    case 'sign-out':
      return 'sign-up'
    case 'forgot-password':
      return 'forgot-password'
    case 'reset-password':
      return 'reset-password'
    default:
      throw new Error('Invalide mode')
  }
}

function AuthRoute() {
  const { mode } = Route.useSearch()
  const initialMode = mode === 'sign-up' ? 'sign-up' : 'sign-in'

  return <AuthPage initialMode={initialMode} />
}
