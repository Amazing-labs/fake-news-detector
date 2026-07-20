import { authClient } from '@lib/auth-client'

function getErrorMessage(error: unknown, fallback: string) {
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message
  }

  return fallback
}

export async function signInWithEmail(email: string, password: string) {
  const result = await authClient.signIn.email({ email, password })

  if (result.error) {
    throw new Error(
      getErrorMessage(result.error, 'Email ou mot de passe invalide.'),
    )
  }
}

export async function signUpWithEmail(
  name: string,
  email: string,
  password: string,
) {
  const result = await authClient.signUp.email({ name, email, password })

  if (result.error) {
    throw new Error(
      getErrorMessage(
        result.error,
        'Inscription impossible. Vérifiez vos informations.',
      ),
    )
  }
}

export async function requestPasswordReset(email: string, redirectTo: string) {
  const result = await authClient.requestPasswordReset({ email, redirectTo })

  if (result.error) {
    throw new Error(
      getErrorMessage(result.error, 'La demande de réinitialisation a échoué.'),
    )
  }
}

export async function resetPassword(password: string, token: string) {
  const result = await authClient.resetPassword({
    newPassword: password,
    token,
  })

  if (result.error) {
    throw new Error(
      getErrorMessage(
        result.error,
        'La réinitialisation du mot de passe a échoué.',
      ),
    )
  }
}
