import { FilePlus2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { submitWatcherEvidence } from '@entities/investigation/api'
import { toApiErrorMessage } from '@shared/api/http'
import { useAppSession } from '@entities/session/model'
import { MediaFields } from '@shared/ui/media-fields'
import {
  normalizeMediaDrafts,
  type MediaDraft,
} from '@shared/ui/media-fields.model'
import { Button } from '@shared/ui/shadcn/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@shared/ui/shadcn/dialog'
import { Input } from '@shared/ui/shadcn/input'
import { Label } from '@shared/ui/shadcn/label'
import { Textarea } from '@shared/ui/shadcn/textarea'

export function WatcherContributeDialog({
  investigationId,
  children,
}: {
  investigationId: string
  children: ReactNode
}) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [media, setMedia] = useState<MediaDraft[]>([])
  const { session } = useAppSession()
  const ownerId = session?.user.actorId ?? ''

  const validMedia = normalizeMediaDrafts(media)
  const canSubmit =
    title.trim() !== '' && content.trim() !== '' && validMedia.length > 0

  function reset() {
    setTitle('')
    setContent('')
    setMedia([])
  }

  const mutation = useMutation({
    mutationFn: () =>
      submitWatcherEvidence(investigationId, {
        title: title.trim(),
        content: content.trim(),
        media: validMedia,
      }),
    onSuccess: () => {
      setOpen(false)
      reset()
      void queryClient.invalidateQueries({ queryKey: ['investigations'] })
      toast.success('Preuve envoyée.')
    },
    onError: (error) => toast.error(toApiErrorMessage(error)),
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (mutation.isPending) return
        setOpen(next)
        if (!next) reset()
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Soumettre une preuve</DialogTitle>
          <DialogDescription>
            Les médias seront classés par le journaliste avant la revue
            éditoriale.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <Label className="grid gap-2">
            Titre
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Source locale, image, lien…"
            />
          </Label>
          <Label className="grid gap-2">
            Observation
            <Textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Ce que la preuve confirme ou écarte"
            />
          </Label>
          <MediaFields
            title="Médias de la preuve"
            description="Images, vidéos, audio, PDF ou documents utiles au dossier."
            items={media}
            onChange={setMedia}
            ownerId={ownerId}
            disabled={mutation.isPending}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={mutation.isPending}>
              Annuler
            </Button>
          </DialogClose>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!canSubmit}
            loading={mutation.isPending}
          >
            {!mutation.isPending && <FilePlus2 />}
            Ajouter la preuve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
