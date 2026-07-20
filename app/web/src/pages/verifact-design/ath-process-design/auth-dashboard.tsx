import { Link, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Moon,
  ShieldCheck,
  Sun,
} from 'lucide-react'
import { useEffect } from 'react'
import {
  localAuthActors,
  signInLocalActor,
  type AuthModeType,
  useAppSession,
} from '@entities/session/model'
import { isBetterAuthDisabled } from '@lib/auth-config'
import { Alert, AlertDescription, AlertTitle } from '@shared/ui/shadcn/alert'
import { Button } from '@shared/ui/shadcn/button'
import { actorLabels } from '../data'
import { actorFromSession, dashboardPathForSession } from '../session-routing'
import { useTheme } from '../theme'
import {
  ForgotPasswordForm,
  ResetPasswordForm,
  SignInForm,
  SignUpForm,
} from './auth-forms'
import { AuthHero } from './auth-design'
import { showLocalActorLoginViewSection } from './auth-local-actor'

export function VeriFactAuthPage(props: {
  mode: AuthModeType
  resetToken?: string
}) {
  const { isDark, setIsDark } = useTheme()
  const navigate = useNavigate()
  const { session, isPending } = useAppSession()
  const { mode } = props

  useEffect(() => {
    if (!isPending && session) {
      void navigate({ to: dashboardPathForSession(session) })
    }
  }, [isPending, navigate, session])

  async function handleLocalSignIn(
    actor: (typeof localAuthActors)[number]['actor'],
  ) {
    await signInLocalActor(actor)
  }

  function navigateToMode(nextMode: AuthModeType) {
    void navigate({ to: '/auth', search: { mode: nextMode } })
  }

  const isSignUp = mode === 'sign-up'

  return (
    <div className="bg-background text-foreground min-h-screen lg:grid lg:grid-cols-2">
      <AuthHero />
      <div className="flex min-h-screen flex-col px-5 py-8 sm:px-8">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
          >
            <ArrowLeft className="size-4" /> Accueil
          </Link>
          <button
            type="button"
            onClick={() => setIsDark((value) => !value)}
            aria-label={isDark ? 'Passer en clair' : 'Passer en sombre'}
            className="text-muted-foreground hover:text-foreground hover:bg-accent grid size-10 place-items-center rounded-lg transition-colors active:scale-[0.94]"
          >
            {isDark ? (
              <Sun className="size-[1.15rem]" />
            ) : (
              <Moon className="size-[1.15rem]" />
            )}
          </button>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <div className="mb-7">
            <span className="text-muted-foreground flex items-center gap-2 text-sm font-medium lg:hidden">
              <ShieldCheck className="size-4" />
              Fake News Detector
            </span>
            <h1 className="mt-3 text-[clamp(1.75rem,4vw,2.25rem)] leading-tight font-bold tracking-tight text-balance lg:mt-0">
              {isSignUp
                ? 'Créer un compte citoyen'
                : mode === 'forgot-password'
                  ? 'Réinitialiser votre accès'
                  : mode === 'reset-password'
                    ? 'Choisir un nouveau mot de passe'
                    : 'Bon retour'}
            </h1>
            <p className="text-muted-foreground mt-2 leading-relaxed text-pretty">
              {isSignUp
                ? 'Rejoignez la vérification en quelques secondes — gratuit, sans carte.'
                : 'Connectez-vous pour retrouver votre espace de travail.'}
            </p>
          </div>

          <div className="space-y-4">
            {isBetterAuthDisabled ? (
              <Alert>
                <ShieldCheck className="size-4" />
                <AlertTitle>Mode local frontend</AlertTitle>
                <AlertDescription>
                  Better Auth est désactivé. Aucun appel backend n'est requis
                  pour explorer l'interface.
                </AlertDescription>
              </Alert>
            ) : null}
            {!isBetterAuthDisabled && isPending ? (
              <Alert>
                <Clock3 className="size-4" />
                <AlertTitle>Vérification de session</AlertTitle>
                <AlertDescription>
                  Lecture de la session Better Auth.
                </AlertDescription>
              </Alert>
            ) : null}
            {session ? (
              <Alert>
                <CheckCircle2 className="size-4" />
                <AlertTitle>Session active</AlertTitle>
                <AlertDescription>
                  Tu es connecté comme{' '}
                  {actorLabels[actorFromSession(session) ?? 'guest']}.
                </AlertDescription>
              </Alert>
            ) : null}

            {session ? (
              <Button
                className="h-11 w-full transition-transform active:scale-[0.98]"
                asChild
              >
                <Link to={dashboardPathForSession(session)}>
                  Ouvrir mon dashboard
                </Link>
              </Button>
            ) : isBetterAuthDisabled ? (
              <div className="grid gap-3">
                {localAuthActors.map((localActor) =>
                  showLocalActorLoginViewSection(
                    isBetterAuthDisabled,
                    localActor,
                    handleLocalSignIn,
                  ),
                )}
              </div>
            ) : mode === 'sign-in' ? (
              <SignInForm onModeChange={navigateToMode} />
            ) : mode === 'sign-up' ? (
              <SignUpForm onModeChange={navigateToMode} />
            ) : mode === 'forgot-password' ? (
              <ForgotPasswordForm onModeChange={navigateToMode} />
            ) : (
              <ResetPasswordForm
                token={props.resetToken}
                onModeChange={navigateToMode}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
