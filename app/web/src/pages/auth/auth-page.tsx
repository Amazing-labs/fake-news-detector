import { Link } from '@tanstack/react-router'
import { AuthForm } from '../../features/auth/auth-form'
import { useAppSession } from '../../entities/session/model'
import {
  DataList,
  EmptyState,
  PageLayout,
  SectionCard,
} from '../../shared/ui/primitives'

export function AuthPage() {
  const { session, isPending, refetch } = useAppSession()

  return (
    <PageLayout
      title="Front office de test"
      description="Base frontend end-to-end pour exercer le backend Hono et les workflows metier."
    >
      {isPending ? (
        <EmptyState
          title="Session en cours de chargement"
          description="Le frontend attend le retour de Better Auth avant d'afficher une interface de connexion ou de travail."
        />
      ) : session ? (
        <SectionCard
          title="Session active"
          description="La connexion est prete. L'utilisateur garde la meme UI d'authentification mais voit ensuite les ecrans autorises par son role metier."
        >
          <DataList
            items={[
              { label: 'Nom', value: session.user.name },
              { label: 'Email', value: session.user.email },
              { label: 'ID acteur', value: session.user.actorId ?? 'N/A' },
              { label: 'Role', value: session.user.actorRole ?? 'N/A' },
              { label: 'Statut', value: session.user.actorStatus ?? 'N/A' },
            ]}
          />
          <div className="flex flex-wrap gap-3 text-sm">
            <Link className="underline" to="/reports">
              Aller aux signalements
            </Link>
            <Link className="underline" to="/citizen">
              Espace citoyen
            </Link>
            <Link className="underline" to="/journalist">
              Espace journaliste
            </Link>
            <Link className="underline" to="/investigations">
              Aller aux enquetes
            </Link>
            <Link className="underline" to="/profile">
              Voir la session
            </Link>
          </div>
        </SectionCard>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <AuthForm
            onSuccess={() => {
              void refetch()
            }}
          />

          <SectionCard
            title="Connexion unique"
            description="Tout le monde passe par la meme interface de connexion ou d'inscription. Ce sont ensuite la session et le role metier lie via AuthLink qui determinent les ecrans accessibles."
          >
            <p className="text-sm text-slate-700">
              Un citoyen cree son compte directement. Un journaliste ou un
              directeur doit d'abord etre provisionne cote metier, puis son
              compte Better Auth est relie a cet acteur.
            </p>
          </SectionCard>
        </div>
      )}
    </PageLayout>
  )
}
