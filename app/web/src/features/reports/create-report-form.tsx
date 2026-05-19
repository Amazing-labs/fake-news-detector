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

export function CreateReportForm() {
  const queryClient = useQueryClient()
  const [theme, setTheme] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [media, setMedia] = useState<MediaDraft[]>([])
  const [message, setMessage] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () =>
      apiRequest<{ id: string }>('/api/reports', {
        method: 'POST',
        body: JSON.stringify({
          theme,
          title,
          content,
          media: normalizeMediaDrafts(media),
        }),
      }),
    onSuccess: () => {
      setTheme('')
      setTitle('')
      setContent('')
      setMedia([])
      setMessage('Signalement cree.')
      void queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })

  return (
    <SectionCard
      title="Creer un signalement"
      description="Point d'entree citoyen. Le backend ouvre ensuite automatiquement un sujet inbox."
    >
      <form
        className="grid gap-3"
        onSubmit={(event) => {
          event.preventDefault()
          setMessage(null)
          mutation.mutate()
        }}
      >
        <Input
          label="Theme"
          value={theme}
          onChange={(event) => setTheme(event.target.value)}
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
          title="Medias du signalement"
          description="Ajoute des medias via URL pour tester la creation du signalement avec pieces jointes."
          items={media}
          onChange={setMedia}
          addLabel="Ajouter un media au signalement"
        />

        {mutation.isError ? (
          <Notice tone="error">{toApiErrorMessage(mutation.error)}</Notice>
        ) : null}
        {message ? <Notice tone="success">{message}</Notice> : null}

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Envoi...' : 'Envoyer le signalement'}
        </Button>
      </form>
    </SectionCard>
  )
}
