import { useNavigate } from '@tanstack/react-router'
import { Megaphone, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@shared/ui/shadcn/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/ui/shadcn/card'
import { Input } from '@shared/ui/shadcn/input'
import { Label } from '@shared/ui/shadcn/label'
import { Textarea } from '@shared/ui/shadcn/textarea'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '../../app-layout'
import { domainLabel } from '../../workspace-labels'
import { EmptyState, MetaCell } from '../../workspace-ui'
import {
  createPublicationCorrection,
  getPublication,
  listPublications,
  publicationQueryKeys,
} from '@entities/publication/api'
import { toApiErrorMessage } from '@shared/api/http'
import { evidenceSummary } from './format'

export function PublicationCorrectionsWorkspacePage({
  publicationId,
}: {
  publicationId?: string
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isPublicationLocked = Boolean(publicationId)

  const listQuery = useQuery({
    queryKey: publicationQueryKeys.list(),
    queryFn: () => listPublications(),
    enabled: !isPublicationLocked,
  })
  const options = listQuery.data?.items ?? []

  const [selectedPublicationId, setSelectedPublicationId] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  // No implicit first-option default: keep the select in sync with the actual
  // state so the placeholder shows until the director explicitly picks one.
  const activePublicationId = publicationId ?? selectedPublicationId

  const targetQuery = useQuery({
    queryKey: publicationQueryKeys.detail(activePublicationId),
    queryFn: () => getPublication(activePublicationId),
    enabled: Boolean(activePublicationId),
  })
  const publication = targetQuery.data

  const mutation = useMutation({
    mutationFn: () =>
      createPublicationCorrection(activePublicationId, {
        title: title.trim(),
        content: content.trim(),
      }),
    onSuccess: () => {
      toast.success('Correctif publié.')
      void queryClient.invalidateQueries({ queryKey: ['publications'] })
      void navigate({
        to: '/publications/$publicationId',
        params: { publicationId: activePublicationId },
      })
    },
    onError: (error) => toast.error(toApiErrorMessage(error)),
  })

  const canSubmit =
    Boolean(publication) && title.trim() !== '' && content.trim() !== ''

  function handleSubmit() {
    if (!publication) {
      toast.error('Sélectionne une publication cible.')
      return
    }
    if (!title.trim()) {
      toast.error('Le titre du correctif est obligatoire.')
      return
    }
    if (!content.trim()) {
      toast.error('Le contenu du correctif est obligatoire.')
      return
    }
    mutation.mutate()
  }

  return (
    <AppLayout actor="director" page="publications">
      <Card>
        <CardHeader>
          <CardTitle>Créer un correctif</CardTitle>
          <CardDescription>
            {publication
              ? 'Le correctif sera rattaché directement à cette publication.'
              : 'Sélectionne une publication pour créer un correctif.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {!isPublicationLocked && (
            <Label className="grid gap-2">
              Publication cible
              <select
                className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                value={activePublicationId}
                onChange={(event) =>
                  setSelectedPublicationId(event.target.value)
                }
              >
                <option value="">Sélectionnez une publication…</option>
                {options.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title ?? item.id}
                  </option>
                ))}
              </select>
            </Label>
          )}
          {publication ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <MetaCell
                label="Publication cible"
                value={publication.title ?? publication.id}
              />
              <MetaCell
                label="Verdict"
                value={`${domainLabel(publication.finalVerdict)} · ${evidenceSummary(publication)}`}
              />
            </div>
          ) : (
            <EmptyState
              icon={Megaphone}
              title="Aucune publication sélectionnée"
              description="Choisissez une publication dans la liste pour préparer le correctif."
              className="p-6"
            />
          )}
          <Label className="grid gap-2">
            Titre du correctif
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Titre de la correction publiée"
              disabled={!publication}
            />
          </Label>
          <Label className="grid gap-2">
            Correction
            <Textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Formuler le correctif à publier"
              disabled={!publication}
            />
          </Label>
          <Button
            className="w-fit"
            onClick={handleSubmit}
            disabled={!canSubmit}
            loading={mutation.isPending}
          >
            {!mutation.isPending && <RotateCcw />}
            Publier le correctif
          </Button>
        </CardContent>
      </Card>
    </AppLayout>
  )
}
