import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { apiRequest, toApiErrorMessage } from '../../shared/api/http'
import { Button, Input, Notice, TextArea } from '../../shared/ui/primitives'

type CommentAction = 'reject' | 'archive'

export function ApproveInvestigationForm(props: { investigationId?: string }) {
  const queryClient = useQueryClient()
  const [draftInvestigationId, setDraftInvestigationId] = useState('')
  const [verifiedLink, setVerifiedLink] = useState('')
  const [commentAction, setCommentAction] = useState<CommentAction | null>(null)
  const [comment, setComment] = useState('')
  const [formError, setFormError] = useState('')
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
      setFormError('')
      void queryClient.invalidateQueries({ queryKey: ['investigations'] })
      void queryClient.invalidateQueries({ queryKey: ['publications'] })
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
    setFormError('')
  }

  function openCommentModal(action: CommentAction) {
    if (!investigationId.trim()) {
      setFormError("La référence d'enquête est obligatoire.")
      return
    }

    setFormError('')
    setComment('')
    setCommentAction(action)
  }

  function submitCommentAction() {
    const cleanComment = comment.trim()

    if (!cleanComment) {
      setFormError('Commentaire obligatoire.')
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
      <form
        className="mx-auto w-full max-w-[540px] rounded-[1.65rem] border border-[#ece7df] bg-white p-5 shadow-[0_14px_38px_rgba(33,28,23,0.055)]"
        onSubmit={(event) => {
          event.preventDefault()
          setFormError('')
          publishMutation.mutate()
        }}
      >
        <div className="flex items-center justify-between gap-4 border-b border-[#eee9e2] pb-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#fff5d6] to-[#ffe8ef] text-sm font-black text-[#171514] ring-1 ring-[#e8e2da]">
              ED
            </div>
            <div className="min-w-0">
              <h2 className="truncate font-black tracking-[-0.02em] text-[#171514]">
                Validation editoriale
              </h2>
              <p className="text-sm text-[#7b7671]">Enquête en revue</p>
            </div>
          </div>
          <span className="rounded-full bg-[#f7f4ef] px-3 py-1 text-xs font-black text-[#706a63]">
            Directeur
          </span>
        </div>

        <div className="mt-5 grid gap-4">
          {fixedInvestigation ? (
            <div className="rounded-2xl border border-[#e7e2dc] bg-[#faf8f5] px-3 py-2.5 text-sm">
              <span className="block font-bold text-[#171514]">
                Référence enquête
              </span>
              <span className="mt-1 block truncate font-black text-[#706a63]">
                {investigationId}
              </span>
            </div>
          ) : (
            <Input
              label="Référence enquête"
              value={draftInvestigationId}
              required
              onChange={(event) => setDraftInvestigationId(event.target.value)}
            />
          )}
          <Input
            label="Lien vérifié (optionnel)"
            value={verifiedLink}
            onChange={(event) => setVerifiedLink(event.target.value)}
          />
        </div>

        <div className="mt-5 flex items-center justify-between gap-4 border-t border-[#eee9e2] pt-4 text-sm font-black text-[#77716b]">
          <span>Decision editoriale</span>
          <span>Commentaire requis sauf publication</span>
        </div>

        {formError ? <Notice tone="error">{formError}</Notice> : null}
        {publishMutation.isError ? (
          <Notice tone="error">
            {toApiErrorMessage(publishMutation.error)}
          </Notice>
        ) : null}
        {rejectMutation.isError ? (
          <Notice tone="error">
            {toApiErrorMessage(rejectMutation.error)}
          </Notice>
        ) : null}
        {archiveMutation.isError ? (
          <Notice tone="error">
            {toApiErrorMessage(archiveMutation.error)}
          </Notice>
        ) : null}
        {publishMutation.isSuccess ? (
          <Notice tone="success">Enquête publiée.</Notice>
        ) : null}

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <Button type="submit" disabled={isPending}>
            {publishMutation.isPending ? 'Publication...' : 'Publier'}
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={isPending}
            onClick={() => openCommentModal('reject')}
          >
            Refuser
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={isPending}
            onClick={() => openCommentModal('archive')}
          >
            Archiver
          </Button>
        </div>
      </form>

      {commentAction ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#171514]/35 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[1.55rem] border border-[#ece7df] bg-white p-5 shadow-[0_24px_80px_rgba(23,21,20,0.24)]">
            <div className="flex items-start justify-between gap-4 border-b border-[#eee9e2] pb-4">
              <div>
                <h2 className="text-lg font-black tracking-[-0.02em] text-[#171514]">
                  {commentAction === 'reject'
                    ? "Refuser l'enquête"
                    : "Archiver l'enquête"}
                </h2>
                <p className="mt-1 text-sm leading-6 text-[#706a63]">
                  Le commentaire est obligatoire pour garder une trace
                  editoriale claire.
                </p>
              </div>
              <button
                type="button"
                className="rounded-full px-3 py-1 text-lg font-black text-[#706a63] hover:bg-[#f7f4ef] hover:text-[#171514]"
                onClick={closeCommentModal}
                aria-label="Fermer"
              >
                x
              </button>
            </div>
            <div className="mt-4 grid gap-4">
              <TextArea
                label="Commentaire obligatoire"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
              />
              {formError ? <Notice tone="error">{formError}</Notice> : null}
              {activeCommentMutation.isError ? (
                <Notice tone="error">
                  {toApiErrorMessage(activeCommentMutation.error)}
                </Notice>
              ) : null}
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeCommentModal}
                  disabled={activeCommentMutation.isPending}
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  variant={commentAction === 'reject' ? 'danger' : 'primary'}
                  onClick={submitCommentAction}
                  disabled={activeCommentMutation.isPending}
                >
                  {activeCommentMutation.isPending
                    ? 'Envoi...'
                    : commentAction === 'reject'
                      ? 'Confirmer le refus'
                      : "Confirmer l'archivage"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
