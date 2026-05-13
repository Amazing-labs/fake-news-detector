import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { InboxSubjectList } from '../../entities/inbox-subject/model'
import type { ReportList } from '../../entities/report/model'
import { hasRole, useAppSession } from '../../entities/session/model'
import { CreateDirectorInboxSubjectForm } from '../../features/inbox-subjects/create-director-inbox-subject-form'
import { apiRequest } from '../../shared/api/http'
import { formatDateTime } from '../../shared/lib/format'
import {
  Button,
  EmptyState,
  PageLayout,
  SectionCard,
  StatusBadge,
} from '../../shared/ui/primitives'

export function InboxSubjectsPage() {
  const { session } = useAppSession()
  const queryClient = useQueryClient()
  const canManage = hasRole(session, ['EDITORIAL_DIRECTOR'])
  const canPick = hasRole(session, ['JOURNALIST'])

  const listQuery = useQuery({
    queryKey: ['inbox-subjects'],
    queryFn: () => apiRequest<InboxSubjectList>('/api/inbox-subjects'),
    enabled: !!session,
  })

  const reportInboxQuery = useQuery({
    queryKey: ['report-inbox'],
    queryFn: () => apiRequest<ReportList>('/api/inbox-subjects/report-inbox'),
    enabled: canPick || canManage,
  })

  const pickMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/inbox-subjects/${id}/pick`, {
        method: 'POST',
        body: JSON.stringify({}),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['inbox-subjects'] })
      void queryClient.invalidateQueries({ queryKey: ['investigations'] })
    },
  })

  return (
    <PageLayout
      title="Inbox sujets"
      description="File de sujets a traiter, qu'ils proviennent d'un signalement ou d'une creation directeur."
    >
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        {canManage ? (
          <CreateDirectorInboxSubjectForm />
        ) : (
          <SectionCard title="Creation directeur">
            <EmptyState
              title="Acces reserve"
              description="La creation manuelle d'un sujet est reservee au directeur."
            />
          </SectionCard>
        )}

        <div className="grid gap-6">
          <SectionCard title="Inbox globale">
            {listQuery.data?.items.length ? (
              <div className="grid gap-3">
                {listQuery.data.items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-md border border-slate-200 p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-950">
                          {item.theme}
                        </p>
                        <p className="text-sm text-slate-600">
                          Origine {item.origin} | Signalement{' '}
                          {item.reportId ?? 'N/A'}
                        </p>
                      </div>
                      <StatusBadge value={item.status} />
                    </div>
                    <p className="mt-2 text-sm text-slate-700">
                      {item.description}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Cree le {formatDateTime(item.createdAt)}
                    </p>
                    {canPick ? (
                      <div className="mt-3">
                        <Button onClick={() => pickMutation.mutate(item.id)}>
                          Prendre le sujet
                        </Button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Inbox vide"
                description="Aucun sujet n'est actuellement expose par le backend."
              />
            )}
          </SectionCard>

          <SectionCard title="Inbox signalements">
            {reportInboxQuery.data?.items.length ? (
              <div className="grid gap-3">
                {reportInboxQuery.data.items.map((report) => (
                  <div
                    key={report.id}
                    className="rounded-md border border-slate-200 p-3"
                  >
                    <p className="font-medium text-slate-950">{report.theme}</p>
                    <p className="text-sm text-slate-600">
                      {report.title || 'Sans titre'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Aucun signalement ouvert"
                description="Cette vue permet surtout de verifier l'alimentation automatique depuis les signalements."
              />
            )}
          </SectionCard>
        </div>
      </div>
    </PageLayout>
  )
}
