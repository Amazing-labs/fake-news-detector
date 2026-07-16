import { Link, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  Moon,
  ShieldCheck,
  Sun,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { AuthHero } from './auth-design'
import {
  localAuthActors,
  signInLocalActor,
  useAppSession,
} from '@entities/session/model'
import { isBetterAuthDisabled } from '@lib/auth-config'
import { Alert, AlertDescription, AlertTitle } from '@shared/ui/shadcn/alert'
import { Button } from '@shared/ui/shadcn/button'
import { Input } from '@shared/ui/shadcn/input'
import { Label } from '@shared/ui/shadcn/label'
import { Tabs, TabsList, TabsTrigger } from '@shared/ui/shadcn/tabs'
import { actorLabels } from '../data'
import { actorFromSession, dashboardPathForSession } from '../session-routing'
import { type AuthModeType } from '@entities/session/model'
import { useTheme } from '../theme'
import { showLocalActorLoginViewSection } from './auth-local-actor'

export function VeriFactAuthPage(props: { initialMode?: AuthModeType }) {
  const { isDark, setIsDark } = useTheme()
  const navigate = useNavigate()
  const { session, isPending } = useAppSession()
  const [mode, setMode] = useState<AuthModeType>(props.initialMode ?? 'sign-in')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    setMode(props.initialMode ?? 'sign-in')
  }, [props.initialMode])

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
            <ArrowLeft className="size-4" />
            Accueil
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
              {isSignUp ? 'Créer un compte citoyen' : 'Bon retour'}
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
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <Tabs
                  value={mode}
                  onValueChange={(value) => setMode(value as AuthModeType)}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="sign-in">Connexion</TabsTrigger>
                    <TabsTrigger value="sign-up">Inscription</TabsTrigger>
                  </TabsList>
                </Tabs>
                {mode === 'sign-up' ? (
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nom</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Awa Diarra"
                      required
                    />
                  </div>
                ) : null}
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="vous@exemple.fr"
                    type="email"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="mb-2 flex items-center justify-between">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Link
                      className="text-muted-foreground hover:text-foreground text-xs transition-colors"
                      to="/auth"
                      search={{ mode: 'forgot-password' as AuthModeType }}
                    >
                      Mot de passe oublier ?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="••••••••"
                      type={showPassword ? 'text' : 'password'}
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 flex items-center rounded-md px-3 focus-visible:ring-[3px] focus-visible:outline-none"
                      aria-label={
                        showPassword
                          ? 'Masquer le mot de passe'
                          : 'Afficher le mot de passe'
                      }
                      aria-pressed={showPassword}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>
                <Button
                  className="h-11 w-full transition-transform active:scale-[0.98]"
                  loading={pending}
                  type="submit"
                >
                  {isSignUp ? 'Créer mon compte' : 'Se connecter'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
