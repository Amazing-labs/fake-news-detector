import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { apiRequest, toApiErrorMessage } from '../../shared/api/http'
import {
  DarkButton,
  DarkFormCard,
  DarkInput,
  DarkTextArea,
} from '../../shared/ui/dark-form'
import { MediaFields } from '../../shared/ui/media-fields'
import {
  normalizeMediaDrafts,
  type MediaDraft,
} from '../../shared/ui/media-fields.model'

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

  return (
    <DarkFormCard
      title="Soumettre une preuve vigie"
      description="Formulaire citoyen pour enrichir une enquête ouverte."
    >
      <form
        className="mt-6 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
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
        <div>
          <DarkButton type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Envoi...' : 'Envoyer la preuve'}
          </DarkButton>
        </div>
      </form>
    </DarkFormCard>
  )
}
