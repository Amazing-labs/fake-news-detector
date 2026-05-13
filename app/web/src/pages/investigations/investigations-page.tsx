import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { InvestigationList } from '../../entities/investigation/model'
import { hasRole, useAppSession } from '../../entities/session/model'
import { ApproveInvestigationForm } from '../../features/investigations/approve-investigation-form'
import { SubmitWatcherEvidenceForm } from '../../features/investigations/submit-watcher-evidence-form'
import { apiRequest } from '../../shared/api/http'
import { formatDateTime, formatLabel } from '../../shared/lib/format'
import {
  Button,
  EmptyState,
  Input,
  PageLayout,
  SectionCard,
  Select,
  StatusBadge,
} from '../../shared/ui/primitives'

type InvestigationScope = 'pending-review' | 'published' | 'journalist'

export function InvestigationsPage() {
  const { session } = useAppSession()
  const queryClient = useQueryClient()
  const [scope, setScope] = useState<InvestigationScope>('pending-review')
  const canReview = hasRole(session, ['JOURNALIST'])
  const canApprove = hasRole(session, ['EDITORIAL_DIRECTOR'])
  const canSubmitWatcherEvidence =
    session?.user.actorRole === 'CITIZEN' &&
    session.user.citizenType === 'WATCHER'

  const query = useQuery({
    queryKey: ['investigations', scope, session?.user.actorId ?? null],
    queryFn: () => {
      if (scope === 'journalist' && session?.user.actorId) {
        return apiRequest<InvestigationList>(
          `/api/investigations?journalistId=${session.user.actorId}`,
        )
      }

      return apiRequest<InvestigationList>(`/api/investigations?scope=${scope}`)
    },
    enabled: !!session,
  })

  const reviewMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest<null>(`/api/investigations/${id}/review`, {
        method: 'POST',
        body: JSON.stringify({}),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['investigations'] })
    },
  })

  const reasonMutation = useMutation({
    mutationFn: ({
      id,
      action,
      reason,
    }: {
      id: string
      action: 'reject' | 'cancel'
      reason: string
    }) =>
      apiRequest<null>(`/api/investigations/${id}/${action}`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['investigations'] })
    },
  })

  const archiveMutation = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) =>
      apiRequest<null>(`/api/investigations/${id}/archive`, {
        method: 'POST',
        body: JSON.stringify({ comment }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['investigations'] })
    },
  })

  return (
    <PageLayout
      title="Enquetes"
      description="Vue centrale journaliste/directeur, avec les actions minimales pour soumettre, approuver et corriger le cycle metier."
      actions={
        <Select
          label="Vue"
          value={scope}
          onChange={(event) =>
            setScope(event.target.value as InvestigationScope)
          }
        >
          <option value="pending-review">En attente</option>
          <option value="published">Publiees</option>
          <option value="journalist">Par journaliste</option>
        </Select>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="grid gap-6">
          {canSubmitWatcherEvidence ? (
            <SubmitWatcherEvidenceForm />
          ) : session?.user.actorRole === 'CITIZEN' ? (
            <SectionCard title="Soumission de preuves vigie">
              <EmptyState
                title="Reserve aux vigies"
                description="Un citoyen lambda ne peut pas soumettre de preuves. Il doit d'abord etre approuve comme vigie."
              />
            </SectionCard>
          ) : null}
          {canApprove ? <ApproveInvestigationForm /> : null}
        </div>

        <SectionCard title="Liste des enquetes">
          {query.data?.items.length ? (
            <div className="grid gap-3">
              {query.data.items.map((item) => (
                <InvestigationRow
                  key={item.id}
                  item={item}
                  canReview={canReview}
                  canApprove={canApprove}
                  onSubmitForReview={() => reviewMutation.mutate(item.id)}
                  onReject={(reason) =>
                    reasonMutation.mutate({
                      id: item.id,
                      action: 'reject',
                      reason,
                    })
                  }
                  onCancel={(reason) =>
                    reasonMutation.mutate({
                      id: item.id,
                      action: 'cancel',
                      reason,
                    })
                  }
                  onArchive={(comment) =>
                    archiveMutation.mutate({
                      id: item.id,
                      comment,
                    })
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Aucune enquete"
              description="Aucune ligne n'est remontee pour la vue selectionnee."
            />
          )}
        </SectionCard>
      </div>
    </PageLayout>
  )
}

function InvestigationRow(props: {
  item: InvestigationList['items'][number]
  canReview: boolean
  canApprove: boolean
  onSubmitForReview: () => void
  onReject: (reason: string) => void
  onCancel: (reason: string) => void
  onArchive: (comment: string) => void
}) {
  const [reason, setReason] = useState('')
  const [comment, setComment] = useState('')

  return (
    <div className="rounded-md border border-slate-200 p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium text-slate-950">{props.item.id}</p>
          <p className="text-sm text-slate-600">
            Inbox {props.item.inboxSubjectId} | Journaliste{' '}
            {props.item.journalistId}
          </p>
        </div>
        <StatusBadge value={props.item.status} />
      </div>

      <div className="mt-2 text-sm text-slate-700">
        <p>Verdict: {formatLabel(props.item.draftVerdict)}</p>
        <p>Categorie media: {formatLabel(props.item.mediaCategory)}</p>
        <p>Tentatives: {props.item.attemptCount}</p>
        <p>MAJ: {formatDateTime(props.item.updatedAt)}</p>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <Input
          label="Raison / Commentaire"
          value={props.canApprove ? comment : reason}
          onChange={(event) => {
            if (props.canApprove) {
              setComment(event.target.value)
            } else {
              setReason(event.target.value)
            }
          }}
        />
        <div className="flex flex-wrap gap-2">
          {props.canReview ? (
            <Button onClick={props.onSubmitForReview}>
              Soumettre pour revue
            </Button>
          ) : null}
          {props.canApprove ? (
            <>
              <Button
                variant="danger"
                onClick={() => props.onReject(reason || 'Rejet manuel')}
              >
                Rejeter
              </Button>
              <Button
                variant="danger"
                onClick={() => props.onCancel(reason || 'Annulation manuelle')}
              >
                Annuler
              </Button>
              <Button
                variant="secondary"
                onClick={() => props.onArchive(comment)}
              >
                Archiver
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
