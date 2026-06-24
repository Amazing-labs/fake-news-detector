import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { apiRequest, toApiErrorMessage } from '@shared/api/http'
import { untrackPendingUploads } from '@shared/lib/supabase'
import {
  DarkButton,
  DarkFormCard,
  DarkInput,
  DarkTextArea,
} from '@shared/ui/dark-form'
import { MediaFields } from '@shared/ui/media-fields'
import {
  normalizeMediaDrafts,
  type MediaDraft,
} from '@shared/ui/media-fields.model'

export function SubmitWatcherEvidenceForm() {
  const queryClient = useQueryClient()
  const [investigationId, setInvestigationId] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [media, setMedia] = useState<MediaDraft[]>([])

  const mutation = useMutation({
    mutationFn: () =>
      apiRequest<{ id: string }>(
        `/api/investigations/${investigationId}/evidence`,
        {
          method: 'POST',
          body: JSON.stringify({
            title,
            content,
            media: normalizeMediaDrafts(media),
          }),
        },
      ),
    onSuccess: () => {
      untrackPendingUploads(media.map((m) => m.url))
      setInvestigationId('')
      setTitle('')
      setContent('')
      setMedia([])
      toast.success('Preuve envoyée.')
      void queryClient.invalidateQueries({ queryKey: ['investigations'] })
    },
    onError: (error) => {
      toast.error(toApiErrorMessage(error))
    },
  })

  const validMedia = normalizeMediaDrafts(media)
  const canSubmit =
    investigationId.trim() !== '' &&
    title.trim() !== '' &&
    content.trim() !== '' &&
    validMedia.length > 0

  return (
    <DarkFormCard
      title="Soumettre une preuve vigie"
      description="Formulaire citoyen pour enrichir une enquête ouverte."
    >
      <form
        className="mt-6 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          if (!investigationId.trim()) {
            toast.error("La référence d'enquête est obligatoire.")
            return
          }
          if (!title.trim()) {
            toast.error('Le titre est obligatoire.')
            return
          }
          if (!content.trim()) {
            toast.error('Le contenu est obligatoire.')
            return
          }
          if (validMedia.length === 0) {
            toast.error('Au moins un média est requis.')
            return
          }
          mutation.mutate()
        }}
      >
        <DarkInput
          label="Référence enquête"
          value={investigationId}
          onChange={(event) => setInvestigationId(event.target.value)}
        />
        <DarkInput
          label="Titre"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <DarkTextArea
          label="Contenu"
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
        <MediaFields
          title="Médias de la preuve"
          description="Ajoute les images ou documents qui renforcent la vérification."
          items={media}
          onChange={setMedia}
          variant="dark"
        />
        {media.length === 0 && (
          <p className="text-xs text-red-400">
            Au moins un média est requis pour soumettre une preuve.
          </p>
        )}
        <div>
          <DarkButton type="submit" disabled={mutation.isPending || !canSubmit}>
            {mutation.isPending ? 'Envoi...' : 'Envoyer la preuve'}
          </DarkButton>
        </div>
      </form>
    </DarkFormCard>
  )
}
