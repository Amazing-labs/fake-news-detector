import { Link, useNavigate } from '@tanstack/react-router'
import { CheckCircle2, Clock3, ShieldCheck, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  localAuthActors,
  signInLocalActor,
  useAppSession,
} from '@entities/session/model'
import { isBetterAuthDisabled } from '@lib/auth-config'
import { authClient, type AppSession } from '@lib/auth-client'
import { Alert, AlertDescription, AlertTitle } from '@shared/ui/shadcn/alert'
import { Button } from '@shared/ui/shadcn/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/ui/shadcn/card'
import { Input } from '@shared/ui/shadcn/input'
import { Label } from '@shared/ui/shadcn/label'
import { Tabs, TabsList, TabsTrigger } from '@shared/ui/shadcn/tabs'
import { actorLabels } from './data'
import { actorFromSession, dashboardPathForSession } from './session-routing'
import { useTheme } from './theme'

export function VeriFactAuthPage(props: {
  initialMode?: 'sign-in' | 'sign-up'
}) {
  useTheme()
  const navigate = useNavigate()
  const { session, isPending } = useAppSession()
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>(
    props.initialMode ?? 'sign-in',
  )
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMode(props.initialMode ?? 'sign-in')
  }, [props.initialMode])

  useEffect(() => {
    if (!isPending && session) {
      void navigate({ to: dashboardPathForSession(session) })
    }
  }, [isPending, navigate, session])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)
    setMessage(null)

    try {
      const result =
        mode === 'sign-up'
          ? await authClient.signUp.email({ name, email, password })
          : await authClient.signIn.email({ email, password })

      if (result.error) {
        setError(result.error.message ?? 'Authentification impossible')
        return
      }

      setMessage('Session ouverte.')
      setPassword('')
      const refreshedSession = await authClient.getSession()
      await navigate({
        to: dashboardPathForSession(
          (refreshedSession.data ?? result.data) as unknown as AppSession,
        ),
      })
    } finally {
      setPending(false)
    }
  }

  async function handleLocalSignIn(
    actor: (typeof localAuthActors)[number]['actor'],
  ) {
    await signInLocalActor(actor)
  }

  return (
    <div className="bg-background text-foreground grid min-h-screen place-items-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <ShieldCheck className="size-6" />
            Espace vérification
          </CardTitle>
          <CardDescription>
            Authentification shadcn, sobre et orientée dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {isBetterAuthDisabled ? (
            <Alert>
              <ShieldCheck className="size-4" />
              <AlertTitle>Mode local frontend</AlertTitle>
              <AlertDescription>
                Better Auth est désactivé. Aucun appel backend n'est requis pour
                explorer l'interface.
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
          <Alert>
            <Sparkles className="size-4" />
            <AlertTitle>Dashboard-first</AlertTitle>
            <AlertDescription>
              Après connexion, chaque acteur arrive directement sur son espace
              de travail.
            </AlertDescription>
          </Alert>
          {session ? (
            <Button className="w-full" asChild>
              <Link to={dashboardPathForSession(session)}>
                Ouvrir mon dashboard
              </Link>
            </Button>
          ) : isBetterAuthDisabled ? (
            <div className="grid gap-3">
              {localAuthActors.map((localActor) => (
                <Button
                  key={localActor.actor}
                  type="button"
                  variant="outline"
                  className="h-auto justify-start rounded-xl p-4 text-left"
                  onClick={() => void handleLocalSignIn(localActor.actor)}
                >
                  <span className="grid gap-1">
                    <span className="font-semibold">{localActor.label}</span>
                    <span className="text-muted-foreground text-sm font-normal">
                      {localActor.description}
                    </span>
                  </span>
                </Button>
              ))}
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Tabs
                value={mode}
                onValueChange={(value) =>
                  setMode(value as 'sign-in' | 'sign-up')
                }
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="sign-in">Connexion</TabsTrigger>
                  <TabsTrigger value="sign-up">Inscription</TabsTrigger>
                </TabsList>
              </Tabs>
              {mode === 'sign-up' ? (
                <div className="grid gap-3">
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
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="redaction@fnd.test"
                  type="email"
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="********"
                  type="password"
                  required
                />
              </div>
              {error ? (
                <Alert variant="destructive">
                  <AlertTitle>Erreur</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
              {message ? (
                <Alert>
                  <AlertTitle>Succes</AlertTitle>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              ) : null}
              <Button className="w-full" loading={pending} type="submit">
                {mode === 'sign-up' ? 'Créer un compte' : 'Connexion'}
              </Button>
            </form>
          )}
          <Button variant="outline" className="w-full" asChild>
            <Link to="/">Voir le dashboard invite</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
