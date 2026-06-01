import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { apiRequest, toApiErrorMessage } from '../../shared/api/http'
import {
  DarkButton,
  DarkFormCard,
  DarkInput,
  DarkTextArea,
} from '../../shared/ui/dark-form'
import { Notice } from '../../shared/ui/primitives'

export function PublishCorrectionForm(props: {
  initialPublicationId?: string
}) {
  const queryClient = useQueryClient()
  const [publicationId, setPublicationId] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const currentPublicationId = props.initialPublicationId ?? publicationId

  const mutation = useMutation({
    mutationFn: () =>
      apiRequest<{ correctionId: string }>(
        `/api/publications/${currentPublicationId}/corrections`,
        {
          method: 'POST',
          body: JSON.stringify({ title, content }),
        },
      ),
    onSuccess: () => {
      if (!props.initialPublicationId) {
        setPublicationId('')
      }
      setTitle('')
      setContent('')
      void queryClient.invalidateQueries({ queryKey: ['publications'] })
    },
  })

  return (
    <DarkFormCard
      title="Publier une correction"
      description="Flux directeur pour corriger une publication existante."
    >
      <form
        className="mt-6 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          mutation.mutate()
        }}
      >
        <DarkInput
          label="Référence publication"
          value={currentPublicationId}
          readOnly={!!props.initialPublicationId}
          onChange={(event) => setPublicationId(event.target.value)}
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
        {mutation.isError ? (
          <Notice tone="error">{toApiErrorMessage(mutation.error)}</Notice>
        ) : null}
        {mutation.isSuccess ? (
          <Notice tone="success">Correction publiée.</Notice>
        ) : null}
        <div>
          <DarkButton type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Publication...' : 'Publier la correction'}
          </DarkButton>
        </div>
      </form>
    </DarkFormCard>
  )
}
