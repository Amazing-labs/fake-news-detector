import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import type { InvestigationList } from '../../entities/investigation/model'
import { hasRole, useAppSession } from '../../entities/session/model'
import { ApproveInvestigationForm } from '../../features/investigations/approve-investigation-form'
import { apiRequest } from '../../shared/api/http'
import { formatDateTime, formatLabel } from '../../shared/lib/format'
import {
  EmptyState,
  PlatformBreadcrumb,
  SectionCard,
  StatusBadge,
} from '../../shared/ui/primitives'

export type InvestigationScope = 'pending-review' | 'published'

export function InvestigationScopePage(props: {
  scope: InvestigationScope
  emptyTitle: string
}) {
  const { session } = useAppSession()
  const apiScope =
    props.scope === 'pending-review' ? 'in-progress' : props.scope

  const query = useQuery({
    queryKey: ['investigations', apiScope],
    queryFn: () =>
      apiRequest<InvestigationList>(`/api/investigations?scope=${apiScope}`),
    enabled: !!session,
  })

  return (
    <div className="grid gap-6">
      <PlatformBreadcrumb section="investigations" />
      <SectionCard title="Liste des enquetes">
        {query.data?.items.length ? (
          <div className="grid gap-3">
            {query.data.items.map((item, index) => (
              <InvestigationRow key={item.id} index={index} item={item} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={props.emptyTitle}
            description="Aucun dossier n'est remonte pour cette vue."
          />
        )}
      </SectionCard>
    </div>
  )
}

export function InvestigationDetailPage(props: { investigationId: string }) {
  const { session } = useAppSession()
  const canApprove = hasRole(session, ['EDITORIAL_DIRECTOR'])

  const inProgressQuery = useQuery({
    queryKey: ['investigations', 'in-progress'],
    queryFn: () =>
      apiRequest<InvestigationList>('/api/investigations?scope=in-progress'),
    enabled: !!session,
  })

  const pendingReviewQuery = useQuery({
    queryKey: ['investigations', 'pending-review'],
    queryFn: () =>
      apiRequest<InvestigationList>('/api/investigations?scope=pending-review'),
    enabled: !!session,
  })

  const publishedQuery = useQuery({
    queryKey: ['investigations', 'published'],
    queryFn: () =>
      apiRequest<InvestigationList>('/api/investigations?scope=published'),
    enabled: !!session,
  })

  const items = [
    ...(inProgressQuery.data?.items ?? []),
    ...(pendingReviewQuery.data?.items ?? []),
    ...(publishedQuery.data?.items ?? []),
  ]
  const investigation = items.find((item) => item.id === props.investigationId)

  if (!investigation) {
    return (
      <EmptyState
        title="Enquete introuvable"
        description="Cette enquete n'est pas presente dans les vues accessibles."
        linkTo="/investigations/pending-review"
        linkLabel="Retour aux enquetes"
      />
    )
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
      <div className="xl:col-span-2">
        <PlatformBreadcrumb section="investigations" />
      </div>
      <article className="rounded-[1.65rem] border border-[#ece7df] bg-white p-5 shadow-[0_14px_38px_rgba(33,28,23,0.055)]">
        <div className="flex items-center justify-between gap-4 border-b border-[#eee9e2] pb-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#fff5d6] to-[#ffe8ef] text-sm font-black text-[#171514] ring-1 ring-[#e8e2da]">
              EQ
            </div>
            <div className="min-w-0">
              <h1 className="truncate font-black tracking-[-0.02em] text-[#171514]">
                Dossier de verification
              </h1>
              <p className="text-sm text-[#7b7671]">
                Sujet qualifie avec journaliste assigne
              </p>
            </div>
          </div>
          <StatusBadge value={investigation.status} />
        </div>

        <div className="mt-5 grid gap-3 text-sm leading-6 text-[#706a63] sm:grid-cols-2">
          <p className="rounded-2xl bg-[#faf8f5] px-3 py-2">
            <span className="block text-xs font-black text-[#918a83] uppercase">
              Verdict
            </span>
            {formatLabel(investigation.draftVerdict)}
          </p>
          <p className="rounded-2xl bg-[#faf8f5] px-3 py-2">
            <span className="block text-xs font-black text-[#918a83] uppercase">
              Categorie media
            </span>
            {formatLabel(investigation.mediaCategory)}
          </p>
          <p className="rounded-2xl bg-[#faf8f5] px-3 py-2">
            <span className="block text-xs font-black text-[#918a83] uppercase">
              Tentatives
            </span>
            {investigation.attemptCount}
          </p>
          <p className="rounded-2xl bg-[#faf8f5] px-3 py-2">
            <span className="block text-xs font-black text-[#918a83] uppercase">
              Mise a jour
            </span>
            {formatDateTime(investigation.updatedAt)}
          </p>
        </div>

        <div className="mt-5 rounded-2xl border border-[#eee9e2] bg-[#fbfaf8] p-4 text-sm leading-6 text-[#706a63]">
          <p className="font-black text-[#171514]">Notes d'enquete</p>
          <p className="mt-2">
            {investigation.investigationNotes ??
              'Aucune note detaillee disponible.'}
          </p>
        </div>
      </article>

      {canApprove ? (
        <ApproveInvestigationForm investigationId={props.investigationId} />
      ) : (
        <EmptyState
          title="Actions reservees"
          description="Les actions de publication, refus et archive sont reservees au directeur de publication."
        />
      )}
    </div>
  )
}

function InvestigationRow(props: {
  index: number
  item: InvestigationList['items'][number]
}) {
  return (
    <Link
      to="/investigations/$investigationId"
      params={{ investigationId: props.item.id }}
      className="block rounded-[1.15rem] border border-[#eee9e2] bg-[#fbfaf8] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] transition hover:-translate-y-0.5 hover:border-[#171514]/20 hover:bg-white hover:shadow-[0_16px_42px_rgba(33,28,23,0.08)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-black tracking-[-0.015em] text-[#171514]">
            Dossier de verification #{props.index + 1}
          </p>
          <p className="text-sm leading-6 text-[#706a63]">
            Sujet qualifie avec journaliste assigne
          </p>
        </div>
        <StatusBadge value={props.item.status} />
      </div>

      <div className="mt-2 text-sm leading-6 text-[#706a63]">
        <p>Verdict: {formatLabel(props.item.draftVerdict)}</p>
        <p>Categorie media: {formatLabel(props.item.mediaCategory)}</p>
        <p>Tentatives: {props.item.attemptCount}</p>
        <p>MAJ: {formatDateTime(props.item.updatedAt)}</p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 border-t border-[#eee9e2] pt-4 text-sm font-black text-[#77716b]">
        <span>Ouvrir le dossier</span>
        <span>Details</span>
      </div>
    </Link>
  )
}
