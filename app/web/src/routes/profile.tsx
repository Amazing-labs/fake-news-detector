import { createFileRoute } from '@tanstack/react-router'
import { authClient, type AppSession } from '../lib/auth-client'

export const Route = createFileRoute('/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: rawSession, isPending } = authClient.useSession()
  const session = rawSession as AppSession | null

  if (isPending) {
    return (
      <div className="rounded-4xl border border-stone-200 bg-white/80 p-8">
        Chargement de la session...
      </div>
    )
  }

  if (!session) {
    return (
      <div className="rounded-4xl border border-stone-200 bg-white/80 p-8">
        <h1 className="text-2xl font-semibold text-stone-900">
          Aucune session active
        </h1>
        <p className="mt-3 text-stone-700">
          Connecte-toi depuis la page d&apos;accueil pour voir le profil
          authentifie.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-4xl border border-stone-200 bg-white/80 p-8 shadow-[0_18px_50px_-28px_rgba(68,52,25,0.45)]">
      <p className="text-xs tracking-[0.26em] text-amber-800/70 uppercase">
        Session courante
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-stone-900">
        {session.user.name}
      </h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label="Email" value={session.user.email} />
        <Field label="Actor ID" value={session.user.actorId ?? 'Non relie'} />
        <Field
          label="Role metier"
          value={session.user.actorRole ?? 'Aucun role'}
        />
        <Field
          label="Statut metier"
          value={session.user.actorStatus ?? 'Inconnu'}
        />
        <Field label="Session ID" value={session.session.id} />
        <Field label="Expire le" value={session.session.expiresAt} />
      </div>
    </div>
  )
}

function Field(props: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4">
      <p className="text-xs tracking-[0.2em] text-stone-500 uppercase">
        {props.label}
      </p>
      <p className="mt-2 text-sm break-all text-stone-900">{props.value}</p>
    </div>
  )
}
