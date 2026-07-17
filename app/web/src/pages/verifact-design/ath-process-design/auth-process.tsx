import { toast } from 'sonner'
import { authClient, type AppSession } from '@lib/auth-client'
import type { AuthModeType } from '@entities/session/model'

type AuthInputParams = {
    name?: string
    email: string
    password: string
}

type ResetPasswordType = Omit<AuthInputParams, 'name' | 'email'> & { confirm_password: string }
type ForgotPasswordType = Omi

export async function handleSubmit(
  event: React.FormEvent<HTMLFormElement>,
  params: AuthInputParams | ResetPasswordType,
  mode: AuthModeType
) {
  event.preventDefault()

  try {
  let result = null;

    switch (mode) {
      case 'sign-in':
        
        result = await authClient.signIn.email({ email: params.email, password: params.password });
        handleSubmitError<typeof result>('sign-in', result)
        break;
      case 'sign-up':
        if ()
        result = await authClient.signUp.email({ name: params.name, email: , password })
    }
    const result =
      mode === 'sign-up'
        ? 
        : 

    if (result.error) {
      // Generic on purpose: never reveal whether the email exists or which
      // field is wrong.
      toast.error(
        mode === ''
          ? ''
          : 'Email ou mot de passe invalide.',
      )
      return
    }

    toast.success('Session ouverte.')
    setPassword('')
    // If the session refresh fails, still navigate using the sign-in result.
    const refreshedSession = await authClient.getSession().catch(() => null)
    await navigate({
      to: dashboardPathForSession(
        (refreshedSession?.data ?? result.data) as unknown as AppSession,
      ),
    })
  } catch {
    toast.error('Une erreur inattendue est survenue. Veuillez réessayer.')
  } finally {
    setPending(false)
  }
}


function handleSubmitError<T>(mode: AuthModeType, result: T | null | any): void {
    if (!result.error) {
      return;
    }
    if (!mode) {
      throw new Error("Mode are require");
      
    }
    switch(mode) {
      case 'sign-up':
        toast.error(
          "Inscription impossible. Vérifiez vos informations."
        )
        break;
      case 'sign-in':
        toast.error('Email ou mot de passe invalide.');
        break;
      case 'reset-password':
        toast.error('Un problème est survenue lors de la réinitialisation de votre mot de passe. Veuillez réessayer')
        break
      case 'forgot-password':
      default:
        toast.error("Une erreur inattendue est survenue. Veuillez réessayer.")
    }
}

type SignInPayload = { mode: 'sign-in', params: AuthInputParams }
type SignUpPayload = { mode: 'sign-up', params: AuthInputParams }
type ResetPasswordPayload = { mod: 'forgot-password', }

function validateAuthInput(mode: AuthModeType, params: AuthInputParams | ResetPasswordType): void {
  if (!mode) throw new Error("Mode is require")
  switch(mode) {
    case 'sign-in':
      if (!params.name || !params.password) {
          toast.error("L'email et le mot de passe sont requis")
      }
      break;
    case 'sign-up':
      if (!params.name || !params.password || !params.email) {
        toast.error("Tous les champs sont réquis")
      }
      break;
    case 'forgot-password':
      if (!params.password || !params.con)
  }
}