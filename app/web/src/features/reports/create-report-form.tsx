import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { createReport, reportQueryKeys } from '@entities/report/api'
import { toApiErrorMessage } from '@shared/api/http'
import { useAppSession } from '@entities/session/model'
import { DarkButton, DarkFormCard, DarkIconSelect } from '@shared/ui/dark-form'
import { Textarea } from '@shared/ui/shadcn/textarea'
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
import {
  BookOpenIcon,
  CpuIcon,
  Globe2Icon,
  GavelIcon,
  HeartPulseIcon,
  ActivityIcon,
  InfoIcon,
  LeafIcon,
  MoreHorizontalIcon,
  ShieldIcon,
  TrendingUpIcon,
  UsersIcon,
} from 'lucide-react'

function ReportTextareaGroup(props: {
  label: string
  value: string
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder: string
  maxLength: number
}) {
  const { label, value, onChange, placeholder, maxLength } = props

  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <div className="bg-background rounded-lg shadow-sm">
        <Textarea
          className="focus-visible:border-primary/70 focus-visible:ring-primary/20 min-h-24 w-full resize-none rounded-t-lg border-none! px-3 py-2.5"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
        />
        <div className="text-muted-foreground flex items-center justify-between gap-2 rounded-b-lg px-3 py-2 text-xs">
          <span>
            {value.length}/{maxLength} caractères
          </span>
          <InfoIcon className="h-4 w-4" />
        </div>
      </div>
    </label>
  )
}

const verificationThemeOptions: Array<{
  value: VerificationTheme
  label: string
  icon: ReactNode
}> = [
  {
    value: 'Santé',
    label: 'Santé',
    icon: <HeartPulseIcon className="text-muted-foreground h-4 w-4" />,
  },
  {
    value: 'Sécurité',
    label: 'Sécurité',
    icon: <ShieldIcon className="text-muted-foreground h-4 w-4" />,
  },
  {
    value: 'Économie',
    label: 'Économie',
    icon: <TrendingUpIcon className="text-muted-foreground h-4 w-4" />,
  },
  {
    value: 'Éducation',
    label: 'Éducation',
    icon: <BookOpenIcon className="text-muted-foreground h-4 w-4" />,
  },
  {
    value: 'Politique',
    label: 'Politique',
    icon: <GavelIcon className="text-muted-foreground h-4 w-4" />,
  },
  {
    value: 'Environnement',
    label: 'Environnement',
    icon: <LeafIcon className="text-muted-foreground h-4 w-4" />,
  },
  {
    value: 'Technologie',
    label: 'Technologie',
    icon: <CpuIcon className="text-muted-foreground h-4 w-4" />,
  },
  {
    value: 'Société',
    label: 'Société',
    icon: <UsersIcon className="text-muted-foreground h-4 w-4" />,
  },
  {
    value: 'Sport',
    label: 'Sport',
    icon: <ActivityIcon className="text-muted-foreground h-4 w-4" />,
  },
  {
    value: 'International',
    label: 'International',
    icon: <Globe2Icon className="text-muted-foreground h-4 w-4" />,
  },
  {
    value: 'Autre',
    label: 'Autre',
    icon: <MoreHorizontalIcon className="text-muted-foreground h-4 w-4" />,
  },
]

export function CreateReportForm() {
  const queryClient = useQueryClient()
  const [theme, setTheme] = useState<VerificationTheme>(
    defaultVerificationTheme,
  )
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [media, setMedia] = useState<MediaDraft[]>([])
  const { session } = useAppSession()
  const ownerId = session?.user.actorId ?? ''

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
        <DarkIconSelect
          label="Thème"
          value={theme}
          onChange={(value) => setTheme(value)}
          options={verificationThemeOptions}
        />
        <ReportTextareaGroup
          label="Rumeur à vérifier"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Décris ta rumeur et le contexte connu"
          maxLength={140}
        />
        <ReportTextareaGroup
          label="Message reçu"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Colle ici le message, la publication ou le texte reçu"
          maxLength={140}
        />
        <MediaFields
          title="Médias"
          description="Images, captures d'écran, vidéos, notes audio ou documents reçus avec la rumeur."
          items={media}
          onChange={setMedia}
          ownerId={ownerId}
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
            className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition"
          >
            Retour aux signalements
          </Link>
        </div>
      </form>
    </DarkFormCard>
  )
}
