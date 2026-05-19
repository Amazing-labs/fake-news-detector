import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { apiRequest, toApiErrorMessage } from '../../shared/api/http'
import { MediaFields } from '../../shared/ui/media-fields'
import {
  createEmptyMediaDraft,
  normalizeMediaDrafts,
  type MediaDraft,
} from '../../shared/ui/media-fields.model'
import {
  Button,
  Input,
  Notice,
  SectionCard,
  TextArea,
} from '../../shared/ui/primitives'

export function SubmitWatcherEvidenceForm() {
  const queryClient = useQueryClient()
  const [investigationId, setInvestigationId] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [media, setMedia] = useState<MediaDraft[]>([createEmptyMediaDraft()])

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
      setMedia([createEmptyMediaDraft()])
      void queryClient.invalidateQueries({ queryKey: ['investigations'] })
    },
  })

  return (
    <SectionCard
      title="Soumettre une preuve vigie"
      description="Formulaire citoyen pour enrichir une enquete ouverte."
    >
      <form
        className="grid gap-3"
        onSubmit={(event) => {
          event.preventDefault()
          mutation.mutate()
        }}
      >
        <Input
          label="Reference enquete"
          value={investigationId}
          onChange={(event) => setInvestigationId(event.target.value)}
        />
        <Input
          label="Titre"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <TextArea
          label="Contenu"
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
        <MediaFields
          title="Medias de la preuve"
          description="Ajoute les liens, images ou documents qui renforcent la verification."
          items={media}
          onChange={setMedia}
          addLabel="Ajouter un media"
        />
        {mutation.isError ? (
          <Notice tone="error">{toApiErrorMessage(mutation.error)}</Notice>
        ) : null}
        {mutation.isSuccess ? (
          <Notice tone="success">Preuve envoyee.</Notice>
        ) : null}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Envoi...' : 'Envoyer la preuve'}
        </Button>
      </form>
    </SectionCard>
  )
}
