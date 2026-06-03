import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { apiRequest, toApiErrorMessage } from '../../shared/api/http'
import {
  DarkButton,
  DarkFormCard,
  DarkSelect,
  DarkTextArea,
} from '../../shared/ui/dark-form'
import {
  defaultVerificationTheme,
  verificationThemes,
} from '../../shared/domain/themes'
import { MediaFields } from '../../shared/ui/media-fields'
import {
  normalizeMediaDrafts,
  type MediaDraft,
} from '../../shared/ui/media-fields.model'
import { Notice } from '../../shared/ui/primitives'

export function CreateDirectorInboxSubjectForm() {
  const queryClient = useQueryClient()
  const [theme, setTheme] = useState<string>(defaultVerificationTheme)
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
      setTheme(defaultVerificationTheme)
      setDescription('')
      setMedia([])
      void queryClient.invalidateQueries({ queryKey: ['inbox-subjects'] })
    },
  })

  return (
    <DarkFormCard
      title="Créer un sujet directeur"
      description="Flux manuel d'ouverture d'un sujet hors signalement."
    >
      <form
        className="mt-6 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          mutation.mutate()
        }}
      >
        <DarkSelect
          label="Thème"
          value={theme}
          onChange={(event) => setTheme(event.target.value)}
          options={verificationThemes}
        />
        <DarkTextArea
          label="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <MediaFields
          title="Médias du sujet"
          description="Ajoute les médias d'origine quand le sujet est ouvert directement par le directeur."
          items={media}
          onChange={setMedia}
          addLabel="Ajouter un média au sujet"
          variant="dark"
        />
        {mutation.isError ? (
          <Notice tone="error">{toApiErrorMessage(mutation.error)}</Notice>
        ) : null}
        {mutation.isSuccess ? (
          <Notice tone="success">Sujet créé.</Notice>
        ) : null}
        <div>
          <DarkButton type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Création...' : 'Créer le sujet'}
          </DarkButton>
        </div>
      </form>
    </DarkFormCard>
  )
}
