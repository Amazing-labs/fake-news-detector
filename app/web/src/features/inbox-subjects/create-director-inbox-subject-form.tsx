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
import { MediaFields } from '../../shared/ui/media-fields'
import {
  normalizeMediaDrafts,
  type MediaDraft,
} from '../../shared/ui/media-fields.model'

export function CreateDirectorInboxSubjectForm() {
  const queryClient = useQueryClient()
  const [theme, setTheme] = useState('')
  const [description, setDescription] = useState('')
  const [media, setMedia] = useState<MediaDraft[]>([])

  const mutation = useMutation({
    mutationFn: () =>
      apiRequest<{ id: string }>('/api/inbox-subjects', {
        method: 'POST',
        body: JSON.stringify({
          theme,
          description,
          media: normalizeMediaDrafts(media),
        }),
      }),
    onSuccess: () => {
      setTheme('')
      setDescription('')
      setMedia([])
      void queryClient.invalidateQueries({ queryKey: ['inbox-subjects'] })
    },
  })

  return (
    <SectionCard
      title="Creer un sujet directeur"
      description="Flux manuel d'ouverture d'un sujet hors signalement."
    >
      <form
        className="grid gap-3"
        onSubmit={(event) => {
          event.preventDefault()
          mutation.mutate()
        }}
      >
        <Input
          label="Theme"
          value={theme}
          onChange={(event) => setTheme(event.target.value)}
        />
        <TextArea
          label="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <MediaFields
          title="Medias du sujet"
          description="Ajoute les medias d'origine quand le sujet est ouvert directement par le directeur."
          items={media}
          onChange={setMedia}
          addLabel="Ajouter un media au sujet"
        />
        {mutation.isError ? (
          <Notice tone="error">{toApiErrorMessage(mutation.error)}</Notice>
        ) : null}
        {mutation.isSuccess ? (
          <Notice tone="success">Sujet cree.</Notice>
        ) : null}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Creation...' : 'Creer le sujet'}
        </Button>
      </form>
    </SectionCard>
  )
}
