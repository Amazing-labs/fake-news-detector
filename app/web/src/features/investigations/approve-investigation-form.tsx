import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { apiRequest, toApiErrorMessage } from '@shared/api/http'
import {
  DarkButton,
  DarkFormCard,
  DarkInput,
  DarkTextArea,
} from '@shared/ui/dark-form'

type CommentAction = 'reject' | 'archive'

export function ApproveInvestigationForm(props: { investigationId?: string }) {
  const queryClient = useQueryClient()
  const [draftInvestigationId, setDraftInvestigationId] = useState('')
  const [verifiedLink, setVerifiedLink] = useState('')
  const [commentAction, setCommentAction] = useState<CommentAction | null>(null)
  const [comment, setComment] = useState('')
  const investigationId = props.investigationId ?? draftInvestigationId
  const fixedInvestigation = !!props.investigationId

  const publishMutation = useMutation({
    mutationFn: () =>
      apiRequest<{ publicationId: string }>(
        `/api/investigations/${investigationId}/approve`,
        {
          method: 'POST',
          body: JSON.stringify({
            verifiedLinks: verifiedLink ? [{ url: verifiedLink }] : [],
            verifiedMedia: [],
          }),
        },
      ),
    onSuccess: () => {
      if (!fixedInvestigation) {
        setDraftInvestigationId('')
      }
      setVerifiedLink('')
      void queryClient.invalidateQueries({ queryKey: ['investigations'] })
      void queryClient.invalidateQueries({ queryKey: ['publications'] })
      toast.success('Enquête publiée.')
    },
    onError: (error) => {
      toast.error(toApiErrorMessage(error))
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (reason: string) =>
      apiRequest<null>(`/api/investigations/${investigationId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    onSuccess: () => {
      closeCommentModal()
      if (!fixedInvestigation) {
        setDraftInvestigationId('')
      }
      void queryClient.invalidateQueries({ queryKey: ['investigations'] })
      toast.success('Enquête refusée.')
    },
    onError: (error) => {
      toast.error(toApiErrorMessage(error))
    },
  })

  const archiveMutation = useMutation({
    mutationFn: (archiveComment: string) =>
      apiRequest<null>(`/api/investigations/${investigationId}/archive`, {
        method: 'POST',
        body: JSON.stringify({ comment: archiveComment }),
      }),
    onSuccess: () => {
      closeCommentModal()
      if (!fixedInvestigation) {
        setDraftInvestigationId('')
      }
      void queryClient.invalidateQueries({ queryKey: ['investigations'] })
      toast.success('Enquête archivée.')
    },
    onError: (error) => {
      toast.error(toApiErrorMessage(error))
    },
  })

  const activeCommentMutation =
    commentAction === 'reject' ? rejectMutation : archiveMutation
  const isPending =
    publishMutation.isPending ||
    rejectMutation.isPending ||
    archiveMutation.isPending

  function closeCommentModal() {
    setCommentAction(null)
    setComment('')
  }

  function openCommentModal(action: CommentAction) {
    if (!investigationId.trim()) {
      toast.error("La référence d'enquête est obligatoire.")
      return
    }

    setComment('')
    setCommentAction(action)
  }

  function submitCommentAction() {
    const cleanComment = comment.trim()

    if (!cleanComment) {
      toast.error('Commentaire obligatoire.')
      return
    }

    if (commentAction === 'reject') {
      rejectMutation.mutate(cleanComment)
      return
    }

    archiveMutation.mutate(cleanComment)
  }

  return (
    <>
      <DarkFormCard
        title="Validation éditoriale"
        description="Publier, refuser ou archiver une enquête en revue."
      >
        <form
          className="mt-6 grid gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            if (!investigationId.trim()) {
              toast.error("La référence d'enquête est obligatoire.")
              return
            }
            if (verifiedLink.trim()) {
              try {
                new URL(verifiedLink.trim())
              } catch {
                toast.error('Le lien vérifié doit être une URL valide (ex: https://…).')
                return
              }
            }
            publishMutation.mutate()
          }}
        >
          {fixedInvestigation ? (
            <div className="rounded-lg border border-white/15 bg-black px-3 py-2.5 text-sm">
              <span className="block font-medium text-white">
                Référence enquête
              </span>
              <span className="mt-1 block truncate text-white/65">
                {investigationId}
              </span>
            </div>
          ) : (
            <DarkInput
              label="Référence enquête"
              value={draftInvestigationId}
              required
              onChange={(event) => setDraftInvestigationId(event.target.value)}
            />
          )}
          <DarkInput
            label="Lien vérifié (optionnel)"
            type="url"
            value={verifiedLink}
            onChange={(event) => setVerifiedLink(event.target.value)}
          />

          <div className="rounded-lg border border-white/10 bg-black/35 px-3 py-2.5 text-sm text-white/70">
            Commentaire requis uniquement pour le refus ou l'archivage.
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <DarkButton type="submit" disabled={isPending}>
              {publishMutation.isPending ? 'Publication...' : 'Publier'}
            </DarkButton>
            <DarkButton
              type="button"
              variant="secondary"
              disabled={isPending}
              onClick={() => openCommentModal('reject')}
            >
              Refuser
            </DarkButton>
            <DarkButton
              type="button"
              variant="secondary"
              disabled={isPending}
              onClick={() => openCommentModal('archive')}
            >
              Archiver
            </DarkButton>
          </div>
        </form>
      </DarkFormCard>

      {commentAction ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#151515] p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-semibold">
                  {commentAction === 'reject'
                    ? "Refuser l'enquête"
                    : "Archiver l'enquête"}
                </h2>
                <p className="mt-1 text-sm leading-6 text-white/65">
                  Le commentaire est obligatoire pour garder une trace
                  éditoriale claire.
                </p>
              </div>
              <button
                type="button"
                className="rounded-full px-3 py-1 text-lg font-semibold text-white/65 hover:bg-white/10 hover:text-white"
                onClick={closeCommentModal}
                aria-label="Fermer"
              >
                x
              </button>
            </div>
            <div className="mt-4 grid gap-4">
              <DarkTextArea
                label="Commentaire obligatoire"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
              />
              <div className="flex flex-wrap justify-end gap-2">
                <DarkButton
                  type="button"
                  variant="secondary"
                  onClick={closeCommentModal}
                  disabled={activeCommentMutation.isPending}
                >
                  Annuler
                </DarkButton>
                <DarkButton
                  type="button"
                  onClick={submitCommentAction}
                  disabled={activeCommentMutation.isPending}
                >
                  {activeCommentMutation.isPending
                    ? 'Envoi...'
                    : commentAction === 'reject'
                      ? 'Confirmer le refus'
                      : "Confirmer l'archivage"}
                </DarkButton>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
