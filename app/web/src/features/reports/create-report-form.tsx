import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { createReport, reportQueryKeys } from '@entities/report/api'
import { toApiErrorMessage } from '@shared/api/http'
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

export function CreateReportForm() {
  const queryClient = useQueryClient()
  const [theme, setTheme] = useState<VerificationTheme>(
    defaultVerificationTheme,
  )
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [media, setMedia] = useState<MediaDraft[]>([])

  const mutation = useMutation({
    mutationFn: () => {
      const normalizedMedia = normalizeMediaDrafts(media)
      return createReport({
        theme,
        title: title.trim(),
        content: content.trim(),
        media: normalizedMedia,
      })
    },
    onSuccess: () => {
      untrackPendingUploads(media.map((m) => m.url))
      setTheme(defaultVerificationTheme)
      setTitle('')
      setContent('')
      setMedia([])
      toast.success('Signalement envoyé.')
      void queryClient.invalidateQueries({ queryKey: reportQueryKeys.all })
    },
    onError: (error) => {
      toast.error(toApiErrorMessage(error))
    },
  })

  function handleSubmit() {
    const normalizedMedia = normalizeMediaDrafts(media)

    if (normalizedMedia.length === 0) {
      toast.error('Au moins un média est requis pour envoyer un signalement.')
      return
    }

    mutation.mutate()
  }

  return (
    <DarkFormCard
      title="Nouveau signalement"
      description="Décris la rumeur, ajoute les messages ou médias reçus, puis envoie le tout au desk."
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
          label="Rumeur à vérifier"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="min-h-16"
          placeholder="Décris la rumeur et le contexte connu"
        />
        <DarkTextArea
          label="Message reçu"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="min-h-20"
          placeholder="Colle ici le message, la publication ou le texte reçu"
        />
        <MediaFields
          title="Médias"
          description="Images, captures d'écran, vidéos, notes audio ou documents reçus avec la rumeur."
          items={media}
          onChange={setMedia}
          variant="dark"
        />
        {normalizeMediaDrafts(media).length === 0 && (
          <p className="text-xs text-red-400">
            Au moins un média est requis pour envoyer un signalement.
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <DarkButton
            type="submit"
            disabled={normalizeMediaDrafts(media).length === 0}
            loading={mutation.isPending}
          >
            Envoyer le signalement
          </DarkButton>
          <Link
            to="/reports"
            className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Retour aux signalements
          </Link>
        </div>
      </form>
    </DarkFormCard>
  )
}
