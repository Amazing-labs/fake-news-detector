import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { apiRequest, toApiErrorMessage } from '../../shared/api/http'
import { Button, Input, Notice, SectionCard } from '../../shared/ui/primitives'
import { MediaFields } from '../../shared/ui/media-fields'
import {
  type MediaDraft,
  normalizeMediaDrafts,
} from '../../shared/ui/media-fields.model'

export function ApproveInvestigationForm() {
  const queryClient = useQueryClient()
  const [investigationId, setInvestigationId] = useState('')
  const [verifiedLink, setVerifiedLink] = useState('')
  const [verifiedMedia, setVerifiedMedia] = useState<MediaDraft[]>([])

  const mutation = useMutation({
    mutationFn: () =>
      apiRequest<{ publicationId: string }>(
        `/api/investigations/${investigationId}/approve`,
        {
          method: 'POST',
          body: JSON.stringify({
            verifiedLinks: verifiedLink ? [{ url: verifiedLink }] : [],
            verifiedMedia: normalizeMediaDrafts(verifiedMedia),
          }),
        },
      ),
    onSuccess: () => {
      setInvestigationId('')
      setVerifiedLink('')
      setVerifiedMedia([])
      void queryClient.invalidateQueries({ queryKey: ['investigations'] })
      void queryClient.invalidateQueries({ queryKey: ['publications'] })
    },
  })

  return (
    <SectionCard
      title="Approuver une enquete"
      description="Formulaire directeur minimal pour tester la publication."
    >
      <form
        className="grid gap-3"
        onSubmit={(event) => {
          event.preventDefault()
          mutation.mutate()
        }}
      >
        <Input
          label="ID enquete"
          value={investigationId}
          onChange={(event) => setInvestigationId(event.target.value)}
        />
        <Input
          label="Lien verifie (optionnel)"
          value={verifiedLink}
          onChange={(event) => setVerifiedLink(event.target.value)}
        />
        <MediaFields
          title="Médias vérifiés"
          description="Le directeur peut uploader un média, obtenir son URL publique Supabase, puis l’envoyer au backend."
          items={verifiedMedia}
          onChange={setVerifiedMedia}
          addLabel="Ajouter un média vérifié"
        />
        {mutation.isError ? (
          <Notice tone="error">{toApiErrorMessage(mutation.error)}</Notice>
        ) : null}
        {mutation.isSuccess ? (
          <Notice tone="success">Enquete approuvee.</Notice>
        ) : null}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Publication...' : 'Approuver'}
        </Button>
      </form>
    </SectionCard>
  )
}
