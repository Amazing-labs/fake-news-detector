import { Link } from '@tanstack/react-router'
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

const inboxSections = [
  {
    to: '/inbox-subjects/create',
    title: 'Creation directeur',
    description: 'Ouvrir un sujet manuellement hors signalement.',
  },
  {
    to: '/inbox-subjects/global',
    title: 'Inbox globale',
    description: 'Traiter les sujets exposes par le desk.',
  },
  {
    to: '/inbox-subjects/reports',
    title: 'Inbox signalements',
    description: 'Relire les signalements ouverts avant qualification.',
  },
] as const

export function InboxSubjectsPage() {
  return (
    <PageLayout
      title="Inbox sujets"
      description="Choisis une file de travail. Chaque section vit maintenant dans sa propre sous-page."
    >
      <div className="grid gap-3 md:grid-cols-3">
        {inboxSections.map((section) => (
          <Link
            key={section.to}
            to={section.to}
            className="rounded-[1.35rem] border border-[#eee9e2] bg-white/84 p-5 shadow-[0_16px_45px_rgba(33,28,23,0.055)] transition duration-200 hover:-translate-y-0.5 hover:bg-white"
          >
            <p className="text-sm font-black text-[#171514]">{section.title}</p>
            <p className="mt-2 text-sm leading-6 text-[#706a63]">
              {section.description}
            </p>
          </Link>
        ))}
      </div>
    </PageLayout>
  )
}

export function InboxSubjectCreatePage() {
  const { session } = useAppSession()
  const canManage = hasRole(session, ['EDITORIAL_DIRECTOR'])

  return (
    <PageLayout
      title="Creation directeur"
      description="Ouvrir un sujet directement depuis la redaction."
      actions={<BackToInbox />}
    >
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
    </PageLayout>
  )
}

export function InboxSubjectGlobalPage() {
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
    <PageLayout
      title="Inbox globale"
      description="Les sujets disponibles pour qualification et prise en charge."
      actions={<BackToInbox />}
    >
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
                      Origine {item.origin} | Signalement{' '}
                      {item.reportId ?? 'N/A'}
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
    </PageLayout>
  )
}

export function InboxSubjectReportsPage() {
  const { session } = useAppSession()
  const canManage = hasRole(session, ['EDITORIAL_DIRECTOR'])
  const canPick = hasRole(session, ['JOURNALIST'])

  const reportInboxQuery = useQuery({
    queryKey: ['report-inbox'],
    queryFn: () => apiRequest<ReportList>('/api/inbox-subjects/report-inbox'),
    enabled: canPick || canManage,
  })

  return (
    <PageLayout
      title="Inbox signalements"
      description="Signalements ouverts qui peuvent alimenter la file de sujets."
      actions={<BackToInbox />}
    >
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
    </PageLayout>
  )
}

function BackToInbox() {
  return (
    <Link
      to="/inbox-subjects"
      className="inline-flex rounded-full border border-[#e7e2dc] bg-white px-4 py-2 text-sm font-black text-[#171514] transition hover:bg-[#f7f4ef]"
    >
      Retour inbox
    </Link>
  )
}
