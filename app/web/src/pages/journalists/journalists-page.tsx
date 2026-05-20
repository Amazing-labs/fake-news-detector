import { Link, Navigate } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import type { CitizenList } from '../../entities/citizen/model'
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

const journalistStatusReasons = [
  { value: 'SPAM', label: 'Spam' },
  { value: 'ABUSE', label: 'Abus' },
  { value: 'FRAUD', label: 'Fraude' },
  { value: 'INACTIVITY', label: 'Inactivite' },
  { value: 'USER_REQUEST', label: 'Demande utilisateur' },
  { value: 'OTHER', label: 'Autre' },
] as const

type UserDirectoryFilter = 'journalists' | 'citizens'

const userDirectoryFilters = [
  {
    value: 'journalists',
    label: 'Journalistes',
    title: 'Journalistes',
    emptyTitle: 'Aucun journaliste',
    emptyDescription: "Aucun journaliste n'est encore provisionne.",
  },
  {
    value: 'citizens',
    label: 'Citoyens',
    title: 'Citoyens',
    emptyTitle: 'Aucun citoyen',
    emptyDescription: "Aucun citoyen n'est encore inscrit.",
  },
] as const satisfies readonly {
  value: UserDirectoryFilter
  label: string
  title: string
  emptyTitle: string
  emptyDescription: string
}[]

export function JournalistsListPage() {
  const { session } = useAppSession()
  const canManage = hasRole(session, ['EDITORIAL_DIRECTOR'])
  const [filter, setFilter] = useState<UserDirectoryFilter>('journalists')

  const journalistsQuery = useQuery({
    queryKey: ['journalists'],
    queryFn: () => apiRequest<JournalistList>('/api/journalists'),
    enabled: canManage,
  })

  const citizensQuery = useQuery({
    queryKey: ['director', 'citizens'],
    queryFn: () => apiRequest<CitizenList>('/api/director/citizens'),
    enabled: canManage,
  })

  if (session !== undefined && !canManage) {
    return <Navigate to="/profile" />
  }

  const activeFilterMeta =
    userDirectoryFilters.find((item) => item.value === filter) ??
    userDirectoryFilters[0]

  return (
    <PageLayout
      title="Utilisateurs"
      description="Gestion des comptes citoyens et journalistes du desk."
      actions={
        canManage ? (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-full border border-[#e7e2dc] bg-[#faf8f5] p-1">
              {userDirectoryFilters.map((item) => {
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
            {filter === 'journalists' ? (
              <Link
                to="/journalists/create"
                className="inline-flex items-center justify-center rounded-full bg-[#171514] px-4 py-2.5 text-sm font-black text-white shadow-[0_14px_30px_rgba(23,21,20,0.14)] transition hover:-translate-y-0.5"
              >
                Creation
              </Link>
            ) : null}
          </div>
        ) : null
      }
    >
      {canManage && (
        <SectionCard title={activeFilterMeta.title}>
          {filter === 'journalists' && journalistsQuery.data?.items.length ? (
            <div className="grid gap-3">
              {journalistsQuery.data.items.map((item) => (
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
          ) : null}

          {filter === 'citizens' && citizensQuery.data?.items.length ? (
            <div className="grid gap-3">
              {citizensQuery.data.items.map((item) => (
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
                      {item.citizenType === 'WATCHER' ? 'Vigie' : 'Citoyen'} |{' '}
                      {item.openReportsCount} signalement(s) ouvert(s) | score{' '}
                      {item.engagementScore} | MAJ{' '}
                      {formatDateTime(item.updatedAt)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : null}

          {filter === 'journalists' && !journalistsQuery.data?.items.length ? (
            <EmptyState
              title={activeFilterMeta.emptyTitle}
              description={activeFilterMeta.emptyDescription}
            />
          ) : null}

          {filter === 'citizens' && !citizensQuery.data?.items.length ? (
            <EmptyState
              title={activeFilterMeta.emptyTitle}
              description={activeFilterMeta.emptyDescription}
            />
          ) : null}
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
  const status = selectedJournalist?.status
  const canActivate = status === 'DISABLED' || status === 'BANNED'
  const canDisable = status === 'ACTIVE'
  const canBan = status === 'ACTIVE' || status === 'DISABLED'

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
          {canActivate ? (
            <Button onClick={() => actionMutation.mutate('activate')}>
              Activer
            </Button>
          ) : null}
          {canDisable ? (
            <Button
              variant="secondary"
              onClick={() => actionMutation.mutate('disable')}
            >
              Desactiver
            </Button>
          ) : null}
          {canBan ? (
            <Button
              variant="danger"
              onClick={() => actionMutation.mutate('ban')}
            >
              Bannir
            </Button>
          ) : null}
        </div>
      </div>
    </SectionCard>
  )
}
