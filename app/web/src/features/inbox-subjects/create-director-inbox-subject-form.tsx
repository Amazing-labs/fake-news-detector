import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { apiRequest, toApiErrorMessage } from '@shared/api/http'
import { untrackPendingUploads } from '@shared/lib/supabase'
import {
  DarkButton,
  DarkFormCard,
  DarkSelect,
  DarkTextArea,
} from '@shared/ui/dark-form'
import {
  defaultVerificationTheme,
  verificationThemes,
  type VerificationTheme,
} from '@shared/domain/themes'
import { MediaFields } from '@shared/ui/media-fields'
import {
  normalizeMediaDrafts,
  type MediaDraft,
} from '@shared/ui/media-fields.model'

export function CreateDirectorInboxSubjectForm() {
  const queryClient = useQueryClient()
  const [theme, setTheme] = useState<VerificationTheme>(
    defaultVerificationTheme,
  )
  const [description, setDescription] = useState('')
  const [media, setMedia] = useState<MediaDraft[]>([])

  const mutation = useMutation({
    mutationFn: () => {
      const normalizedMedia = normalizeMediaDrafts(media)
      return apiRequest<{ id: string }>('/api/inbox-subjects', {
        method: 'POST',
        body: JSON.stringify({
          theme,
          description: description.trim(),
          media: normalizedMedia,
        }),
      })
    },
    onSuccess: () => {
      untrackPendingUploads(media.map((m) => m.url))
      setTheme(defaultVerificationTheme)
      setDescription('')
      setMedia([])
      toast.success('Sujet créé.')
      void queryClient.invalidateQueries({ queryKey: ['inbox-subjects'] })
    },
    onError: (error) => {
      toast.error(toApiErrorMessage(error))
    },
  })

  function handleSubmit() {
    if (!description.trim()) {
      toast.error('La description est obligatoire.')
      return
    }
    if (normalizeMediaDrafts(media).length === 0) {
      toast.error('Au moins un média est requis.')
      return
    }

    mutation.mutate()
  }

  return (
    <DarkFormCard
      title="Créer un sujet directeur"
      description="Flux manuel d'ouverture d'un sujet hors signalement."
    >
      <form
        className="mt-6 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          handleSubmit()
        }}
      >
        <DarkSelect
          label="Thème"
          value={theme}
          onChange={(event) =>
            setTheme(event.target.value as VerificationTheme)
          }
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
          variant="dark"
        />
        {media.length === 0 && (
          <p className="text-xs text-red-400">
            Au moins un média est requis pour créer un sujet.
          </p>
        )}
        <div>
          <DarkButton
            type="submit"
            disabled={
              mutation.isPending ||
              !description.trim() ||
              normalizeMediaDrafts(media).length === 0
            }
          >
            {mutation.isPending ? 'Création...' : 'Créer le sujet'}
          </DarkButton>
        </div>
      </form>
    </DarkFormCard>
  )
}
