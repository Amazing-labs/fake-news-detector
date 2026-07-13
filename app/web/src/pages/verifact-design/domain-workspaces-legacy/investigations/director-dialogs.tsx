import { BadgeCheck } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  approveInvestigation,
  archiveInvestigation,
  cancelInvestigation,
  rejectInvestigation,
} from '@entities/investigation/api'
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
import type { SourceType } from '@entities/investigation/schemas'
import { SELECT_CLASS, SOURCE_TYPE_OPTIONS } from './config'

// One dialog for the three reason-bearing arbitration actions. `kind` selects
// the endpoint: reject = send the dossier back to the journalist "à corriger",
// cancel = definitive cancellation, archive = close an unverifiable dossier.
export function ArbitrationReasonDialog({
  investigationId,
  kind,
  action,
  children,
  tone = 'default',
}: {
  investigationId: string
  kind: 'reject' | 'cancel' | 'archive'
  action: string
  children: ReactNode
  tone?: 'default' | 'destructive'
}) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')

  const mutation = useMutation({
    mutationFn: () => {
      const trimmed = reason.trim()
      if (kind === 'reject') {
        return rejectInvestigation(investigationId, { reason: trimmed })
      }
      if (kind === 'cancel') {
        return cancelInvestigation(investigationId, { reason: trimmed })
      }
      return archiveInvestigation(investigationId, { comment: trimmed })
    },
    onSuccess: () => {
      setOpen(false)
      setReason('')
      void queryClient.invalidateQueries({ queryKey: ['investigations'] })
      void queryClient.invalidateQueries({ queryKey: ['decisions'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success(`${action} — effectué.`)
      void navigate({ to: '/investigations' })
    },
    onError: (error) => toast.error(toApiErrorMessage(error)),
  })

  const canConfirm = reason.trim() !== ''

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (mutation.isPending) return
        setOpen(next)
        if (!next) setReason('')
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{action}</DialogTitle>
          <DialogDescription>
            Indiquez la raison éditoriale avant de poursuivre cette action.
          </DialogDescription>
        </DialogHeader>
        <Label className="grid gap-2">
          Raison
          <Textarea
            required
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Expliquez la raison de cette décision…"
          />
        </Label>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={mutation.isPending}>
              Annuler
            </Button>
          </DialogClose>
          <Button
            variant={tone === 'destructive' ? 'destructive' : 'default'}
            onClick={() => mutation.mutate()}
            disabled={!canConfirm}
            loading={mutation.isPending}
          >
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function PublishInvestigationDialog({
  investigationId,
  children,
}: {
  investigationId: string
  children: ReactNode
}) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [withEvidence, setWithEvidence] = useState(false)

  const [linkUrl, setLinkUrl] = useState('')
  const [linkAuthorityName, setLinkAuthorityName] = useState('')
  const [linkAuthorityType, setLinkAuthorityType] =
    useState<SourceType>('OFFICIAL_DECREE')
  const [media, setMedia] = useState<MediaDraft[]>([])
  const { session } = useAppSession()
  const ownerId = session?.user.actorId ?? ''

  // Publishing is hard to walk back: a director who asked to attach evidence
  // must not publish an empty payload by clicking through.
  const hasEvidence =
    linkUrl.trim() !== '' || normalizeMediaDrafts(media).length > 0

  function resetEvidence() {
    setWithEvidence(false)
    setLinkUrl('')
    setLinkAuthorityName('')
    setLinkAuthorityType('OFFICIAL_DECREE')
    setMedia([])
  }

  const mutation = useMutation({
    mutationFn: () => {
      const trimmedLink = linkUrl.trim()
      const trimmedAuthority = linkAuthorityName.trim()
      const verifiedLinks = trimmedLink
        ? [
            {
              url: trimmedLink,
              authoritySource: trimmedAuthority
                ? { name: trimmedAuthority, type: linkAuthorityType }
                : undefined,
            },
          ]
        : []
      return approveInvestigation(investigationId, {
        verifiedLinks,
        verifiedMedia: normalizeMediaDrafts(media),
      })
    },
    onSuccess: () => {
      setOpen(false)
      resetEvidence()
      void queryClient.invalidateQueries({ queryKey: ['investigations'] })
      void queryClient.invalidateQueries({ queryKey: ['publications'] })
      void queryClient.invalidateQueries({ queryKey: ['decisions'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Dossier publié.')
      void navigate({ to: '/publications/list' })
    },
    onError: (error) => toast.error(toApiErrorMessage(error)),
  })

  function handlePublish() {
    const trimmedLink = linkUrl.trim()
    if (trimmedLink) {
      try {
        new URL(trimmedLink)
      } catch {
        toast.error('Le lien vérifié doit être une URL valide (ex: https://…).')
        return
      }
    }
    mutation.mutate()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (mutation.isPending) return
        setOpen(next)
        if (!next) resetEvidence()
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Publier le dossier</DialogTitle>
          <DialogDescription>
            Voulez-vous ajouter des preuves supplémentaires pour renforcer la
            publication ?
          </DialogDescription>
        </DialogHeader>

        {withEvidence ? (
          <div className="grid gap-6">
            <section className="grid gap-3">
              <div>
                <p className="text-sm font-medium">Lien vérifié</p>
                <p className="text-muted-foreground text-sm">
                  Ajoutez seulement les liens déjà publics.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Label className="grid gap-2 sm:col-span-2">
                  URL
                  <Input
                    type="url"
                    value={linkUrl}
                    onChange={(event) => setLinkUrl(event.target.value)}
                    placeholder="https://source-officielle.example"
                  />
                </Label>
                <Label className="grid gap-2">
                  Source d'autorité
                  <Input
                    value={linkAuthorityName}
                    onChange={(event) =>
                      setLinkAuthorityName(event.target.value)
                    }
                    placeholder="Nom de la source"
                  />
                </Label>
                <Label className="grid gap-2">
                  Type de source
                  <select
                    className={SELECT_CLASS}
                    value={linkAuthorityType}
                    onChange={(event) =>
                      setLinkAuthorityType(event.target.value as SourceType)
                    }
                  >
                    {SOURCE_TYPE_OPTIONS.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </Label>
              </div>
            </section>

            <section className="grid gap-3 border-t pt-5">
              <MediaFields
                title="Médias vérifiés"
                description="Uploadez les fichiers qui renforcent la publication — le type est détecté automatiquement."
                items={media}
                onChange={setMedia}
                ownerId={ownerId}
                disabled={mutation.isPending}
              />
            </section>
          </div>
        ) : null}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={mutation.isPending}>
              Annuler
            </Button>
          </DialogClose>
          {withEvidence ? (
            <Button
              onClick={handlePublish}
              disabled={!hasEvidence}
              loading={mutation.isPending}
            >
              {!mutation.isPending && <BadgeCheck />}
              Publier avec preuves
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setWithEvidence(true)}
                disabled={mutation.isPending}
              >
                Oui, ajouter des preuves
              </Button>
              <Button onClick={handlePublish} loading={mutation.isPending}>
                {!mutation.isPending && <BadgeCheck />}
                Non, publier
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
