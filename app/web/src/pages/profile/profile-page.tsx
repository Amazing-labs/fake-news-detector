import { useAppSession } from '../../entities/session/model'
import { formatDateTime } from '../../shared/lib/format'
import {
  DataList,
  EmptyState,
  PageLayout,
  SectionCard,
} from '../../shared/ui/primitives'

export function ProfilePage() {
  const { session, isPending } = useAppSession()

  return (
    <PageLayout
      title="Profil / Session"
      description="Vue technique de session pour debugger le branchage Better Auth vers l'acteur metier."
    >
      {isPending ? (
        <EmptyState
          title="Chargement"
          description="Le frontend attend la session Better Auth."
        />
      ) : !session ? (
        <EmptyState
          title="Aucune session"
          description="Connecte-toi pour visualiser les claims Better Auth et l'acteur lie."
        />
      ) : (
        <SectionCard title="Session courante">
          <DataList
            items={[
              { label: 'Nom', value: session.user.name },
              { label: 'Email', value: session.user.email },
              { label: 'ID utilisateur', value: session.user.id },
              { label: 'ID acteur', value: session.user.actorId ?? 'N/A' },
              { label: 'Role', value: session.user.actorRole ?? 'N/A' },
              { label: 'Statut', value: session.user.actorStatus ?? 'N/A' },
              { label: 'ID session', value: session.session.id },
              {
                label: 'Expire le',
                value: formatDateTime(session.session.expiresAt),
              },
            ]}
          />
        </SectionCard>
      )}
    </PageLayout>
  )
}
