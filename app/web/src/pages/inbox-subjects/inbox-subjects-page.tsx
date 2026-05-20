import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { InboxSubjectList } from '../../entities/inbox-subject/model'
import type { ReportList } from '../../entities/report/model'
import {
  hasRole,
  useAppSession,
  type UserRole,
} from '../../entities/session/model'
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

type InboxSubjectFilter = 'global' | 'create' | 'reports'

const inboxFilters = [
  {
    value: 'global',
    label: 'Global',
    roles: ['JOURNALIST', 'EDITORIAL_DIRECTOR'],
  },
  {
    value: 'create',
    label: 'Creation',
    roles: ['EDITORIAL_DIRECTOR'],
  },
  {
    value: 'reports',
    label: 'Signalements',
    roles: ['JOURNALIST', 'EDITORIAL_DIRECTOR'],
  },
] as const satisfies readonly {
  value: InboxSubjectFilter
  label: string
  roles: readonly UserRole[]
}[]

export function InboxSubjectsPage() {
  const { session } = useAppSession()
  const [filter, setFilter] = useState<InboxSubjectFilter>('global')
  const visibleFilters = inboxFilters.filter((item) =>
    hasRole(session, item.roles),
  )
  const activeFilter = visibleFilters.some((item) => item.value === filter)
    ? filter
    : (visibleFilters[0]?.value ?? 'global')

  return (
    <PageLayout
      title="Inbox sujets"
      description="Une seule file de travail, filtree selon le type de sujet."
      actions={
        <div className="flex rounded-full border border-[#e7e2dc] bg-[#faf8f5] p-1">
          {visibleFilters.map((item) => {
            const active = item.value === activeFilter
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
      }
    >
      {activeFilter === 'create' ? <InboxSubjectCreatePanel /> : null}
      {activeFilter === 'global' ? <InboxSubjectGlobalPanel /> : null}
      {activeFilter === 'reports' ? <InboxSubjectReportsPanel /> : null}
    </PageLayout>
  )
}

function InboxSubjectCreatePanel() {
  return <CreateDirectorInboxSubjectForm />
}

function InboxSubjectGlobalPanel() {
  const { session } = useAppSession()
  const queryClient = useQueryClient()
  const canPick = hasRole(session, ['JOURNALIST'])

  const listQuery = useQuery({
    queryKey: ['inbox-subjects'],
    queryFn: () => apiRequest<InboxSubjectList>('/api/inbox-subjects'),
    enabled: !!session,
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
    <SectionCard title="Sujets ouverts">
      {listQuery.data?.items.length ? (
        <div className="grid gap-3">
          {listQuery.data.items.map((item) => (
            <div
              key={item.id}
              className="rounded-[1.15rem] border border-[#eee9e2] bg-[#fbfaf8] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-black tracking-[-0.015em] text-[#171514]">
                    {item.theme}
                  </p>
                  <p className="text-sm leading-6 text-[#706a63]">
                    Origine {item.origin} | Signalement {item.reportId ?? 'N/A'}
                  </p>
                </div>
                <StatusBadge value={item.status} />
              </div>
              <p className="mt-2 text-sm leading-6 text-[#706a63]">
                {item.description}
              </p>
              <p className="mt-3 text-xs font-bold text-[#918a83]">
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
  )
}

function InboxSubjectReportsPanel() {
  const { session } = useAppSession()
  const canManage = hasRole(session, ['EDITORIAL_DIRECTOR'])
  const canPick = hasRole(session, ['JOURNALIST'])

  const reportInboxQuery = useQuery({
    queryKey: ['report-inbox'],
    queryFn: () => apiRequest<ReportList>('/api/inbox-subjects/report-inbox'),
    enabled: canPick || canManage,
  })

  return (
    <SectionCard title="Signalements ouverts">
      {reportInboxQuery.data?.items.length ? (
        <div className="grid gap-3">
          {reportInboxQuery.data.items.map((report) => (
            <div
              key={report.id}
              className="rounded-[1.15rem] border border-[#eee9e2] bg-[#fbfaf8] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]"
            >
              <p className="font-black tracking-[-0.015em] text-[#171514]">
                {report.theme}
              </p>
              <p className="text-sm leading-6 text-[#706a63]">
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
  )
}
