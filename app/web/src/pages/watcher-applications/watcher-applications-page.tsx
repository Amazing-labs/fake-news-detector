import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { WatcherApplicationList } from '../../entities/watcher-application/model'
import { hasRole, useAppSession } from '../../entities/session/model'
import { WatcherApplicationForm } from '../../features/watcher-applications/watcher-application-form'
import { apiRequest } from '../../shared/api/http'
import { formatDateTime } from '../../shared/lib/format'
import {
  Button,
  EmptyState,
  PageLayout,
  SectionCard,
  StatusBadge,
} from '../../shared/ui/primitives'

export function WatcherApplicationsPage() {
  const { session } = useAppSession()
  const queryClient = useQueryClient()
  const canReview = hasRole(session, ['EDITORIAL_DIRECTOR'])
  const canApply = hasRole(session, ['CITIZEN'])

  const query = useQuery({
    queryKey: ['watcher-applications'],
    queryFn: () =>
      apiRequest<WatcherApplicationList>('/api/watcher-applications'),
    enabled: !!session && canReview,
  })

  const decisionMutation = useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: string
      action: 'approve' | 'reject'
    }) =>
      apiRequest<null>(`/api/watcher-applications/${id}/${action}`, {
        method: 'POST',
        body: JSON.stringify({}),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['watcher-applications'] })
    },
  })

  return (
    <PageLayout
      title="Vigie"
      description="Flux citoyen de candidature et flux directeur de decision."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.45fr)]">
        {canApply ? (
          <WatcherApplicationForm />
        ) : (
          <SectionCard title="Candidature vigie">
            <EmptyState
              title="Formulaire indisponible"
              description="Seuls les citoyens peuvent envoyer une candidature vigie."
            />
          </SectionCard>
        )}

        <SectionCard title="Revue directeur">
          {canReview ? (
            query.data?.items.length ? (
              <div className="grid gap-3">
                {query.data.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-[1.15rem] border border-[#eee9e2] bg-[#fbfaf8] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-black tracking-[-0.015em] text-[#171514]">
                          Candidature vigie #{index + 1}
                        </p>
                        <p className="text-sm leading-6 text-[#706a63]">
                          Profil citoyen en attente de decision
                        </p>
                      </div>
                      <StatusBadge value={item.status} />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#706a63]">
                      {item.motivation}
                    </p>
                    <p className="mt-3 text-xs font-bold text-[#918a83]">
                      Cree le {formatDateTime(item.createdAt)}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button
                        onClick={() =>
                          decisionMutation.mutate({
                            id: item.id,
                            action: 'approve',
                          })
                        }
                      >
                        Approuver
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() =>
                          decisionMutation.mutate({
                            id: item.id,
                            action: 'reject',
                          })
                        }
                      >
                        Rejeter
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Aucune candidature"
                description="La file d'attente vigie est vide."
              />
            )
          ) : (
            <EmptyState
              title="Acces reserve au directeur"
              description="La liste complete des candidatures n'est visible que cote direction editoriale."
            />
          )}
        </SectionCard>
      </div>
    </PageLayout>
  )
}
