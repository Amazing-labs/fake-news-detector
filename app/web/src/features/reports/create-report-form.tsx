import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { createReport, reportQueryKeys } from '../../entities/report/api'
import { toApiErrorMessage } from '../../shared/api/http'
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
import { Notice } from '../../shared/ui/primitives'

export function CreateReportForm() {
  const queryClient = useQueryClient()
  const [theme, setTheme] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [media, setMedia] = useState<MediaDraft[]>([])
  const [message, setMessage] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () =>
      createReport({
        theme,
        title,
        content,
        media: normalizeMediaDrafts(media),
      }),
    onSuccess: () => {
      setTheme('')
      setTitle('')
      setContent('')
      setMedia([])
      setMessage('Signalement créé.')
      void queryClient.invalidateQueries({ queryKey: reportQueryKeys.all })
    },
  })

  return (
    <DarkFormCard
      title="Nouveau signalement"
      description="Décris la rumeur, ajoute les messages ou médias reçus, puis envoie le tout au desk."
    >
      <form
        className="mt-6 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          setMessage(null)
          mutation.mutate()
        }}
      >
        <DarkInput
          label="Thème"
          value={theme}
          onChange={(event) => setTheme(event.target.value)}
          placeholder="Ex. santé, sécurité, économie"
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
          addLabel="Ajouter un média"
          variant="dark"
        />

        {mutation.isError ? (
          <Notice tone="error">{toApiErrorMessage(mutation.error)}</Notice>
        ) : null}
        {message ? <Notice tone="success">{message}</Notice> : null}

        <div className="flex flex-wrap gap-2">
          <DarkButton type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Envoi...' : 'Envoyer le signalement'}
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
