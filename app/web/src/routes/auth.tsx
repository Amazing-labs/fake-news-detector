import { createFileRoute } from '@tanstack/react-router'
import { AuthPage } from '../pages/auth/auth-page'
import type { AuthModeType } from '@entities/session/model'

export const Route = createFileRoute('/auth')({
  validateSearch: (search: Record<string, unknown>) => ({
    mode: validateMode(search.mode),
    ...(typeof search.token === 'string' ? { token: search.token } : {}),
  }),
  component: AuthRoute,
})

function validateMode(mode: string | unknown): AuthModeType | undefined {
  if (!mode) return
  switch (mode) {
    case 'sign-in':
      return 'sign-in'
    case 'sign-up':
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
  const { mode, token } = Route.useSearch()

  return <AuthPage mode={mode ?? 'sign-in'} resetToken={token} />
}
