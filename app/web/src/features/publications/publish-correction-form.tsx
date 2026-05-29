import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { apiRequest, toApiErrorMessage } from '../../shared/api/http'
import {
  Button,
  Input,
  Notice,
  SectionCard,
  TextArea,
} from '../../shared/ui/primitives'

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
    <SectionCard
      title="Publier une correction"
      description="Flux directeur pour corriger une publication existante."
    >
      <form
        className="grid gap-3"
        onSubmit={(event) => {
          event.preventDefault()
          mutation.mutate()
        }}
      >
        <Input
          label="Référence publication"
          value={currentPublicationId}
          readOnly={!!props.initialPublicationId}
          onChange={(event) => setPublicationId(event.target.value)}
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
        {mutation.isError ? (
          <Notice tone="error">{toApiErrorMessage(mutation.error)}</Notice>
        ) : null}
        {mutation.isSuccess ? (
          <Notice tone="success">Correction publiée.</Notice>
        ) : null}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Publication...' : 'Publier la correction'}
        </Button>
      </form>
    </SectionCard>
  )
}
