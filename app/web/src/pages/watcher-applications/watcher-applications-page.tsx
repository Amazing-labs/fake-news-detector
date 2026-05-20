import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
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

type WatcherApplicationFilter = 'pending' | 'history'

const watcherApplicationFilters = [
  {
    value: 'pending',
    label: 'Candidatures',
    title: 'Candidatures a traiter',
    emptyTitle: 'Aucune candidature',
    emptyDescription: "La file d'attente vigie est vide.",
  },
  {
    value: 'history',
    label: 'Historique',
    title: 'Historique des decisions',
    emptyTitle: 'Historique vide',
    emptyDescription: "Aucune decision n'a encore ete prise.",
  },
] as const satisfies readonly {
  value: WatcherApplicationFilter
  label: string
  title: string
  emptyTitle: string
  emptyDescription: string
}[]

export function WatcherApplicationsPage() {
  const { session } = useAppSession()
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<WatcherApplicationFilter>('pending')
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

  const activeFilterMeta =
    watcherApplicationFilters.find((item) => item.value === filter) ??
    watcherApplicationFilters[0]
  const filteredApplications =
    query.data?.items.filter((item) =>
      filter === 'pending'
        ? item.status === 'PENDING'
        : item.status !== 'PENDING',
    ) ?? []

  return (
    <PageLayout
      title="Vigie"
      description="Suivi des candidatures vigies et de leur historique editorial."
      actions={
        canReview ? (
          <div className="flex rounded-full border border-[#e7e2dc] bg-[#faf8f5] p-1">
            {watcherApplicationFilters.map((item) => {
              const active = item.value === filter
              return (
                <button
                  key={item.value}
                  type="button"
                  className={`rounded-full px-4 py-2 text-sm font-black transition ${
                    active
                      ? 'bg-[#171514] text-white shadow-[0_10px_24px_rgba(23,21,20,0.16)]'
                      : 'text-[#706a63] hover:bg-white hover:text-[#171514]'
                  }`}
                  onClick={() => setFilter(item.value)}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        ) : null
      }
    >
      {canApply && !canReview ? (
        <WatcherApplicationForm />
      ) : (
        <SectionCard title={activeFilterMeta.title}>
          {canReview ? (
            filteredApplications.length ? (
              <div className="grid gap-3">
                {filteredApplications.map((item, index) => (
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
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#eee9e2] pt-3">
                      <p className="text-xs font-bold text-[#918a83]">
                        Cree le {formatDateTime(item.createdAt)} | MAJ{' '}
                        {formatDateTime(item.updatedAt)}
                      </p>
                      {filter === 'pending' ? (
                        <div className="flex gap-2">
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
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title={activeFilterMeta.emptyTitle}
                description={activeFilterMeta.emptyDescription}
              />
            )
          ) : (
            <EmptyState
              title="Acces reserve au directeur"
              description="La liste complete des candidatures n'est visible que cote direction editoriale."
            />
          )}
        </SectionCard>
      )}
    </PageLayout>
  )
}
