import { useQuery } from '@tanstack/react-query'
import type { DirectorDashboard } from '../../entities/dashboard/model'
import { hasRole, useAppSession } from '../../entities/session/model'
import { apiRequest } from '../../shared/api/http'
import { formatDateTime } from '../../shared/lib/format'
import {
  DataList,
  EmptyState,
  PageLayout,
  SectionCard,
  StatusBadge,
} from '../../shared/ui/primitives'

export function DashboardPage() {
  const { session } = useAppSession()
  const enabled = hasRole(session, ['EDITORIAL_DIRECTOR'])

  const query = useQuery({
    queryKey: ['director-dashboard'],
    queryFn: () => apiRequest<DirectorDashboard>('/api/director/dashboard'),
    enabled,
  })

  if (!enabled) {
    return (
      <PageLayout
        title="Dashboard directeur"
        description="Page dediee au pilotage editorial."
      >
        <EmptyState
          title="Acces reserve au directeur"
          description="Cette page ne sert qu'a tester le dashboard metier directeur."
        />
      </PageLayout>
    )
  }

  const dashboard = query.data

  return (
    <PageLayout
      title="Dashboard directeur"
      description="Vue synthetique minimale des enquetes en attente et de l'activite de publication."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.5fr)]">
        <SectionCard title="Indicateurs">
          <DataList
            items={[
              {
                label: 'Publications',
                value: dashboard?.publishedCount ?? 0,
              },
              {
                label: 'Notifications',
                value: dashboard?.totalNotifications ?? 0,
              },
              {
                label: 'Enquetes en attente',
                value: dashboard?.pendingReviews.length ?? 0,
              },
            ]}
          />
        </SectionCard>

        <SectionCard title="Enquetes en attente">
          {dashboard?.pendingReviews.length ? (
            <div className="grid gap-3">
              {dashboard.pendingReviews.map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-[1.15rem] border border-[#eee9e2] bg-[#fbfaf8] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-black tracking-[-0.015em] text-[#171514]">
                        Enquete en revue #{index + 1}
                      </p>
                      <p className="text-sm leading-6 text-[#706a63]">
                        Sujet priorise avec journaliste assigne
                      </p>
                    </div>
                    <StatusBadge value={item.status} />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#706a63]">
                    Derniere mise a jour: {formatDateTime(item.updatedAt)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Aucune enquete en attente"
              description="Le dashboard directeur est vide pour le moment."
            />
          )}
        </SectionCard>
      </div>
    </PageLayout>
  )
}
