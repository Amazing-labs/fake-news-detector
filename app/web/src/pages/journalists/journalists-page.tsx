import { Link, Navigate } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import type { JournalistList } from '../../entities/journalist/model'
import { hasRole, useAppSession } from '../../entities/session/model'
import { CreateJournalistForm } from '../../features/journalists/create-journalist-form'
import { apiRequest } from '../../shared/api/http'
import { formatDateTime } from '../../shared/lib/format'
import {
  Button,
  EmptyState,
  Input,
  PageLayout,
  SectionCard,
  Select,
  StatusBadge,
} from '../../shared/ui/primitives'

const journalistSections = [
  {
    to: '/journalists/list',
    title: 'Liste',
    description: 'Voir les journalistes provisionnes.',
  },
  {
    to: '/journalists/create',
    title: 'Creation',
    description: 'Ajouter un journaliste au desk.',
  },
] as const

const journalistStatusReasons = [
  { value: 'SPAM', label: 'Spam' },
  { value: 'ABUSE', label: 'Abus' },
  { value: 'FRAUD', label: 'Fraude' },
  { value: 'INACTIVITY', label: 'Inactivite' },
  { value: 'USER_REQUEST', label: 'Demande utilisateur' },
  { value: 'OTHER', label: 'Autre' },
] as const

export function JournalistsPage() {
  const { session } = useAppSession()
  const canManage = hasRole(session, ['EDITORIAL_DIRECTOR'])

  if (session !== undefined && !canManage) {
    return <Navigate to="/profile" />
  }

  return (
    <PageLayout
      title="Journalistes"
      description="Choisis une vue. La liste reste separee des actions d'administration."
    >
      <div className="grid gap-3 md:grid-cols-2">
        {journalistSections.map((section) => (
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

export function JournalistsListPage() {
  const { session } = useAppSession()
  const canManage = hasRole(session, ['EDITORIAL_DIRECTOR'])

  const query = useQuery({
    queryKey: ['journalists'],
    queryFn: () => apiRequest<JournalistList>('/api/journalists'),
    enabled: canManage,
  })

  if (session !== undefined && !canManage) {
    return <Navigate to="/profile" />
  }

  return (
    <PageLayout
      title="Journalistes"
      description="Liste des journalistes provisionnes dans le desk."
    >
      {canManage && (
        <SectionCard title="Journalistes">
          {query.data?.items.length ? (
            <div className="grid gap-3">
              {query.data.items.map((item) => (
                <article
                  key={item.id}
                  className="rounded-[1.15rem] border border-[#eee9e2] bg-[#fbfaf8] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-black tracking-[-0.015em] text-[#171514]">
                        {item.name}
                      </p>
                      <p className="text-sm leading-6 text-[#706a63]">
                        {item.email}
                      </p>
                    </div>
                    <StatusBadge value={item.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#eee9e2] pt-3">
                    <p className="text-xs font-bold text-[#918a83]">
                      {item.activeInvestigationsCount} dossier(s) actifs | score{' '}
                      {item.engagementScore} | MAJ{' '}
                      {formatDateTime(item.updatedAt)}
                    </p>
                    <Link
                      to="/journalists/status"
                      search={{ journalistId: item.id }}
                      className="text-xs font-black text-[#706a63] underline-offset-4 transition hover:text-[#171514] hover:underline"
                    >
                      Gerer le statut
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Aucun journaliste"
              description="Aucun journaliste n'est encore provisionne."
            />
          )}
        </SectionCard>
      )}
    </PageLayout>
  )
}

export function JournalistCreatePage() {
  const { session } = useAppSession()
  const canManage = hasRole(session, ['EDITORIAL_DIRECTOR'])

  if (session !== undefined && !canManage) {
    return <Navigate to="/profile" />
  }

  return (
    <PageLayout
      title="Creation journaliste"
      description="Provisionner un acteur journaliste."
    >
      {canManage && <CreateJournalistForm />}
    </PageLayout>
  )
}

export function JournalistStatusPage(props: { journalistId?: string }) {
  const { session } = useAppSession()
  const canManage = hasRole(session, ['EDITORIAL_DIRECTOR'])

  if (session !== undefined && !canManage) {
    return <Navigate to="/profile" />
  }

  if (session !== undefined && canManage && !props.journalistId) {
    return <Navigate to="/journalists/list" />
  }

  return (
    <PageLayout
      title="Statut journaliste"
      description="Activer, desactiver ou bannir un journaliste."
    >
      {canManage && (
        <JournalistStatusActions initialJournalistId={props.journalistId} />
      )}
    </PageLayout>
  )
}

function JournalistStatusActions(props: { initialJournalistId?: string }) {
  const [reason, setReason] =
    useState<(typeof journalistStatusReasons)[number]['value']>('OTHER')
  const [details, setDetails] = useState('')
  const currentJournalistId = props.initialJournalistId ?? ''

  const journalistsQuery = useQuery({
    queryKey: ['journalists'],
    queryFn: () => apiRequest<JournalistList>('/api/journalists'),
    enabled: !!currentJournalistId,
  })

  const selectedJournalist = journalistsQuery.data?.items.find(
    (item) => item.id === currentJournalistId,
  )

  const actionMutation = useMutation({
    mutationFn: (action: 'ban' | 'disable' | 'activate') =>
      apiRequest<null>(`/api/journalists/${currentJournalistId}/${action}`, {
        method: 'POST',
        body: JSON.stringify(
          action === 'activate'
            ? {}
            : { reason, details: details || undefined },
        ),
      }),
  })

  return (
    <SectionCard
      title="Actions de statut"
      description="Choisis une action pour le journaliste selectionne depuis la liste."
    >
      <div className="grid gap-3">
        <div className="rounded-[1.15rem] border border-[#eee9e2] bg-[#fbfaf8] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black tracking-[0.08em] text-[#918a83] uppercase">
                Journaliste
              </p>
              <p className="mt-1 font-black tracking-[-0.015em] text-[#171514]">
                {selectedJournalist?.name ?? 'Journaliste selectionne'}
              </p>
              <p className="mt-1 text-sm leading-6 text-[#706a63]">
                {selectedJournalist?.email ??
                  'Les informations du profil sont en cours de chargement.'}
              </p>
            </div>
            {selectedJournalist ? (
              <StatusBadge value={selectedJournalist.status} />
            ) : null}
          </div>
        </div>
        <Select
          label="Raison"
          value={reason}
          onChange={(event) =>
            setReason(
              event.target
                .value as (typeof journalistStatusReasons)[number]['value'],
            )
          }
        >
          {journalistStatusReasons.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </Select>
        <Input
          label="Details"
          value={details}
          onChange={(event) => setDetails(event.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => actionMutation.mutate('activate')}>
            Activer
          </Button>
          <Button
            variant="secondary"
            onClick={() => actionMutation.mutate('disable')}
          >
            Desactiver
          </Button>
          <Button variant="danger" onClick={() => actionMutation.mutate('ban')}>
            Bannir
          </Button>
        </div>
      </div>
    </SectionCard>
  )
}
