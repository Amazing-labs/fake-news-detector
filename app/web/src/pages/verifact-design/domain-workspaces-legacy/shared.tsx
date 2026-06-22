import { BadgeCheck, FilePlus2, Loader2, X } from 'lucide-react'
import {
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type ReactNode,
} from 'react'
import { toast } from 'sonner'
import {
  deleteFilesFromSupabase,
  flushOrphanedUploads,
  isSupabaseUploadConfigured,
  trackPendingUpload,
  untrackPendingUploads,
  uploadFileToSupabase,
} from '@shared/lib/supabase'
import { cn } from '@shared/lib/utils'
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

const fieldControlClassName =
  'border-input bg-background ring-offset-background focus-visible:ring-ring h-10 w-full rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'

const sourceTypeOptions = [
  ['OFFICIAL_DECREE', 'Décision officielle'],
  ['ORIGINAL_RETRACTION', 'Rectificatif original'],
  ['DIRECT_EVIDENCE', 'Preuve directe'],
  ['MEDIA_CROSSCHECK', 'Recoupement média'],
  ['AUTHORITY_STATEMENT', "Déclaration d'autorité"],
]

const mediaTypeOptions = [
  ['IMAGE', 'Image'],
  ['VIDEO', 'Vidéo'],
  ['DOCUMENT', 'Document'],
  ['AUDIO', 'Audio'],
  ['TEXT', 'Texte'],
  ['LINK', 'Lien'],
]

export function ArbitrationReasonDialog({
  action,
  children,
  tone = 'default',
}: {
  action: string
  children: ReactNode
  tone?: 'default' | 'destructive'
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{action}</DialogTitle>
          <DialogDescription>
            Indique la raison editoriale avant de poursuivre cette action.
          </DialogDescription>
        </DialogHeader>
        <Label className="grid gap-2">
          Raison
          <Textarea
            required
            placeholder="Explique la raison de cette decision..."
          />
        </Label>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          <Button variant={tone === 'destructive' ? 'destructive' : 'default'}>
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function PublishInvestigationDialog({
  children,
}: {
  children: ReactNode
}) {
  const [withEvidence, setWithEvidence] = useState(false)

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) setWithEvidence(false)
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Publier le dossier</DialogTitle>
          <DialogDescription>
            Voulez-vous ajouter des preuves supplementaires pour renforcer la
            publication future ?
          </DialogDescription>
        </DialogHeader>

        {withEvidence ? (
          <div className="grid gap-6">
            <section className="grid gap-3">
              <div>
                <p className="text-sm font-medium">Lien vérifié</p>
                <p className="text-muted-foreground text-sm">
                  Ajoute seulement les liens déjà publics.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Label className="grid gap-2 sm:col-span-2">
                  URL
                  <Input placeholder="https://source-officielle.example" />
                </Label>
                <Label className="grid gap-2">
                  Source d'autorité
                  <Input placeholder="Nom de la source" />
                </Label>
                <Label className="grid gap-2">
                  Type de source
                  <select className={fieldControlClassName}>
                    {sourceTypeOptions.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </Label>
              </div>
            </section>

            <section className="grid gap-3 border-t pt-5">
              <div>
                <p className="text-sm font-medium">Média vérifié</p>
                <p className="text-muted-foreground text-sm">
                  Upload un fichier, puis qualifie sa nature et sa source.
                </p>
              </div>
              <MediaDropzone
                inputId="publication-proof-media"
                description="Images, vidéos, audio, PDF ou documents qui renforcent la publication."
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Label className="grid gap-2">
                  Type de média
                  <select className={fieldControlClassName}>
                    {mediaTypeOptions.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </Label>
                <Label className="grid gap-2">
                  Source rattachée
                  <select className={fieldControlClassName}>
                    {sourceTypeOptions.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </Label>
              </div>
            </section>
          </div>
        ) : null}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          {withEvidence ? (
            <Button>
              <BadgeCheck />
              Publier avec preuves
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setWithEvidence(true)}>
                Oui, ajouter des preuves
              </Button>
              <Button>
                <BadgeCheck />
                Non, publier
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function WatcherContributeDialog({ children }: { children: ReactNode }) {
  return (
    <Dialog>
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
            <Input placeholder="Source locale, image, lien..." />
          </Label>
          <Label className="grid gap-2">
            Observation
            <Textarea placeholder="Ce que la preuve confirme ou écarte" />
          </Label>
          <MediaDropzone
            inputId="watcher-contribute-media"
            description="Images, vidéos, audio, PDF ou documents utiles au dossier."
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          <Button>
            <FilePlus2 />
            Ajouter la preuve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const MAX_MEDIA = 6

type UploadEntry = {
  url: string
  name: string
  size: number
  isImage: boolean
  previewUrl: string | null
}

export function MediaDropzone({
  inputId = 'media-upload',
  description = 'Images, vidéos, audio, PDF ou documents utiles au desk.',
}: {
  inputId?: string
  description?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [entries, setEntries] = useState<UploadEntry[]>([])
  const uploadedUrlsRef = useRef<string[]>([])
  const previewUrlsRef = useRef<string[]>([])
  const canUpload = isSupabaseUploadConfigured()

  // Flush orphans from previous sessions on mount
  useEffect(() => {
    void flushOrphanedUploads()
  }, [])

  // Cleanup on unmount: delete pending uploads + revoke object URLs
  useEffect(() => {
    return () => {
      if (uploadedUrlsRef.current.length > 0) {
        void deleteFilesFromSupabase(uploadedUrlsRef.current)
        untrackPendingUploads(uploadedUrlsRef.current)
      }
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  async function addFiles(fileList: FileList | null) {
    if (!fileList?.length || isUploading) return
    const slots = MAX_MEDIA - entries.length
    if (slots <= 0) return
    const files = Array.from(fileList).slice(0, slots)
    setIsUploading(true)

    for (const file of files) {
      const isImage = file.type.startsWith('image/')
      const previewUrl = isImage ? URL.createObjectURL(file) : null

      if (canUpload) {
        try {
          const result = await uploadFileToSupabase(file)
          const entry: UploadEntry = {
            url: result.url,
            name: file.name,
            size: file.size,
            isImage,
            previewUrl,
          }
          if (previewUrl) previewUrlsRef.current.push(previewUrl)
          setEntries((prev) => [...prev, entry])
          uploadedUrlsRef.current.push(result.url)
          trackPendingUpload(result.url)
          toast.success(`${file.name} uploadé.`)
        } catch {
          toast.error(`Échec upload : ${file.name}`)
          if (previewUrl) URL.revokeObjectURL(previewUrl)
        }
      } else {
        const localUrl = `#local:${crypto.randomUUID()}`
        if (previewUrl) previewUrlsRef.current.push(previewUrl)
        setEntries((prev) => [
          ...prev,
          {
            url: localUrl,
            name: file.name,
            size: file.size,
            isImage,
            previewUrl,
          },
        ])
        toast.success(`${file.name} ajouté (aperçu local).`)
      }
    }

    setIsUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  function removeEntry(url: string, previewUrl: string | null) {
    setEntries((prev) => prev.filter((e) => e.url !== url))
    uploadedUrlsRef.current = uploadedUrlsRef.current.filter((u) => u !== url)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      previewUrlsRef.current = previewUrlsRef.current.filter(
        (u) => u !== previewUrl,
      )
    }
    if (!url.startsWith('#local:')) {
      void deleteFilesFromSupabase([url])
      untrackPendingUploads([url])
    }
  }

  const isFull = entries.length >= MAX_MEDIA

  return (
    <div className="grid gap-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-muted-foreground text-sm">{description}</p>
        <span className="text-muted-foreground shrink-0 text-xs">
          {entries.length} / {MAX_MEDIA}
        </span>
      </div>

      {/* Uploaded entries */}
      {entries.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {entries.map((entry) => (
            <div key={entry.url} className="group relative">
              {entry.isImage && entry.previewUrl ? (
                <div className="bg-muted aspect-square overflow-hidden rounded-lg border">
                  <img
                    src={entry.previewUrl}
                    alt={entry.name}
                    className="size-full object-cover"
                  />
                </div>
              ) : (
                <div className="bg-muted/50 flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border px-2 text-center">
                  <FilePlus2 className="text-muted-foreground size-5 shrink-0" />
                  <span className="text-muted-foreground line-clamp-2 text-[10px]">
                    {entry.name}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeEntry(entry.url, entry.previewUrl)}
                className="bg-background/80 absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full border opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                aria-label={`Retirer ${entry.name}`}
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Dropzone */}
      {!isFull && (
        <Label
          htmlFor={inputId}
          onDragEnter={(e: DragEvent<HTMLLabelElement>) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragOver={(e: DragEvent<HTMLLabelElement>) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e: DragEvent<HTMLLabelElement>) => {
            e.preventDefault()
            setIsDragging(false)
            void addFiles(e.dataTransfer.files)
          }}
          className={cn(
            'border-border bg-background/40 hover:bg-muted/40 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-5 text-center transition-colors',
            isDragging && 'border-primary bg-primary/10',
            isUploading && 'pointer-events-none opacity-60',
          )}
        >
          {isUploading ? (
            <Loader2 className="text-muted-foreground pointer-events-none size-5 animate-spin" />
          ) : (
            <FilePlus2 className="text-muted-foreground pointer-events-none size-5" />
          )}
          <span className="pointer-events-none mt-2 text-sm font-medium">
            {isUploading ? 'Upload en cours…' : 'Glisse les médias ici'}
          </span>
          <span className="text-muted-foreground pointer-events-none mt-1 text-xs">
            {canUpload
              ? `ou clique · max ${MAX_MEDIA} fichiers`
              : 'Supabase non configuré'}
          </span>
          <Input
            ref={inputRef}
            id={inputId}
            type="file"
            multiple
            accept="image/*,video/*,audio/*,application/pdf,text/plain"
            className="sr-only"
            disabled={isUploading}
            onChange={(event) => void addFiles(event.target.files)}
          />
        </Label>
      )}
    </div>
  )
}
