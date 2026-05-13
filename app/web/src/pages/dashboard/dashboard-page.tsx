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
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
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
              {dashboard.pendingReviews.map((item) => (
                <div
                  key={item.id}
                  className="rounded-md border border-slate-200 p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-950">{item.id}</p>
                      <p className="text-sm text-slate-600">
                        Inbox {item.inboxSubjectId} | Journaliste{' '}
                        {item.journalistId}
                      </p>
                    </div>
                    <StatusBadge value={item.status} />
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
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
