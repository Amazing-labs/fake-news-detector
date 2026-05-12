import { createFileRoute } from '@tanstack/react-router'
import { startTransition, useState } from 'react'
import { authClient, type AppSession } from '../lib/auth-client'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: rawSession, isPending, refetch } = authClient.useSession()
  const session = rawSession as AppSession | null
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    try {
      if (mode === 'sign-up') {
        const result = await authClient.signUp.email({
          name,
          email,
          password,
        })

        if (result.error) {
          setError(result.error.message ?? 'Inscription impossible')
          return
        }

        setSuccess('Compte cree et session ouverte.')
      } else {
        const result = await authClient.signIn.email({
          email,
          password,
        })

        if (result.error) {
          setError(result.error.message ?? 'Connexion impossible')
          return
        }

        setSuccess('Connexion reussie.')
      }

      startTransition(() => {
        void refetch()
      })
      setPassword('')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSignOut() {
    setError(null)
    setSuccess(null)
    await authClient.signOut()
    startTransition(() => {
      void refetch()
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-4xl border border-stone-200/70 bg-white/75 p-8 shadow-[0_18px_50px_-28px_rgba(68,52,25,0.45)] backdrop-blur">
        <p className="mb-3 text-xs tracking-[0.3em] text-amber-800/80 uppercase">
          Better Auth
        </p>
        <h1 className="max-w-xl text-5xl leading-tight font-semibold text-stone-900">
          Une authentification reelle, branchee au langage metier.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-700">
          La session Better Auth pilote maintenant les permissions Hono, puis se
          raccorde a l&apos;acteur metier pour retrouver son role citoyen,
          journaliste ou directeur.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <InfoCard
            label="Session"
            value={isPending ? 'Chargement' : session ? 'Active' : 'Inactive'}
          />
          <InfoCard label="Role" value={session?.user.actorRole ?? 'Aucun'} />
          <InfoCard
            label="Acteur"
            value={session?.user.actorId ?? 'Non relie'}
          />
        </div>
      </section>

      <section className="rounded-4xl border border-stone-900/10 bg-stone-950 px-6 py-7 text-stone-50 shadow-[0_24px_60px_-30px_rgba(38,27,13,0.65)]">
        <div className="mb-6 flex rounded-full bg-white/10 p-1 text-sm">
          <button
            type="button"
            onClick={() => setMode('sign-in')}
            className={`flex-1 rounded-full px-4 py-2 transition ${
              mode === 'sign-in'
                ? 'bg-amber-300 text-stone-950'
                : 'text-stone-200'
            }`}
          >
            Connexion
          </button>
          <button
            type="button"
            onClick={() => setMode('sign-up')}
            className={`flex-1 rounded-full px-4 py-2 transition ${
              mode === 'sign-up'
                ? 'bg-amber-300 text-stone-950'
                : 'text-stone-200'
            }`}
          >
            Inscription
          </button>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          {mode === 'sign-up' ? (
            <label className="grid gap-2 text-sm text-stone-200">
              Nom
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-stone-50 transition outline-none focus:border-amber-300"
                placeholder="Awa Traore"
              />
            </label>
          ) : null}

          <label className="grid gap-2 text-sm text-stone-200">
            Email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-stone-50 transition outline-none focus:border-amber-300"
              placeholder="awa@example.com"
            />
          </label>

          <label className="grid gap-2 text-sm text-stone-200">
            Mot de passe
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-stone-50 transition outline-none focus:border-amber-300"
              placeholder="Au moins 8 caracteres"
            />
          </label>

          {error ? (
            <p className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          ) : null}

          {success ? (
            <p className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {success}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-2xl bg-amber-300 px-4 py-3 font-medium text-stone-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? 'En cours...'
              : mode === 'sign-up'
                ? 'Creer mon compte'
                : 'Se connecter'}
          </button>
        </form>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/6 p-4 text-sm text-stone-200">
          <p className="font-medium text-stone-50">Etat de session</p>
          <p className="mt-2 text-stone-300">
            {session
              ? `Connecte en tant que ${session.user.email}`
              : 'Aucune session active.'}
          </p>
          {session ? (
            <button
              type="button"
              onClick={() => {
                void handleSignOut()
              }}
              className="mt-4 rounded-full border border-white/15 px-4 py-2 text-xs tracking-[0.18em] text-stone-100 uppercase transition hover:border-amber-300 hover:text-amber-200"
            >
              Deconnexion
            </button>
          ) : null}
        </div>
      </section>
    </div>
  )
}

function InfoCard(props: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-stone-50/90 p-4">
      <p className="text-xs tracking-[0.24em] text-stone-500 uppercase">
        {props.label}
      </p>
      <p className="mt-3 text-lg font-medium text-stone-900">{props.value}</p>
    </div>
  )
}
