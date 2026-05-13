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

export function PublishCorrectionForm() {
  const queryClient = useQueryClient()
  const [publicationId, setPublicationId] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      apiRequest<{ correctionId: string }>(
        `/api/publications/${publicationId}/corrections`,
        {
          method: 'POST',
          body: JSON.stringify({ title, content }),
        },
      ),
    onSuccess: () => {
      setPublicationId('')
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
          label="ID publication"
          value={publicationId}
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
          <Notice tone="success">Correction publiee.</Notice>
        ) : null}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Publication...' : 'Publier la correction'}
        </Button>
      </form>
    </SectionCard>
  )
}
