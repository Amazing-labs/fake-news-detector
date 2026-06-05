import { BadgeCheck, FilePlus2 } from 'lucide-react'
import { useRef, useState, type DragEvent, type ReactNode } from 'react'
import { cn } from '../../../shared/lib/utils'
import { Badge } from '../../../shared/ui/shadcn/badge'
import { Button } from '../../../shared/ui/shadcn/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../shared/ui/shadcn/dialog'
import { Input } from '../../../shared/ui/shadcn/input'
import { Label } from '../../../shared/ui/shadcn/label'
import { Textarea } from '../../../shared/ui/shadcn/textarea'

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

export function MediaDropzone({
  inputId = 'media-upload',
  description = 'Images, videos, audio, PDF ou documents utiles au desk.',
}: {
  inputId?: string
  description?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])

  const addFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return
    setFiles((currentFiles) => [...currentFiles, ...Array.from(fileList)])
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setIsDragging(false)
    addFiles(event.dataTransfer.files)
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">{description}</p>
        {files.length ? (
          <Badge variant="secondary" className="shrink-0 rounded-full">
            {files.length} fichier{files.length > 1 ? 's' : ''}
          </Badge>
        ) : null}
      </div>

      <Label
        htmlFor={inputId}
        onDragEnter={(event: DragEvent<HTMLLabelElement>) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragOver={(event: DragEvent<HTMLLabelElement>) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'border-border bg-background/40 hover:bg-muted/40 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-5 text-center transition-colors',
          isDragging && 'border-primary bg-primary/10',
        )}
      >
        <FilePlus2 className="text-muted-foreground pointer-events-none size-6" />
        <span className="pointer-events-none mt-3 text-sm font-medium">
          Glisse les medias ici
        </span>
        <span className="text-muted-foreground pointer-events-none mt-1 text-sm">
          ou clique pour les selectionner
        </span>
        <Input
          ref={inputRef}
          id={inputId}
          type="file"
          multiple
          accept="image/*,video/*,audio/*,application/pdf,text/plain"
          className="sr-only"
          onChange={(event) => addFiles(event.target.files)}
        />
      </Label>

      {files.length ? (
        <div className="grid gap-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${file.size}-${index}`}
              className="bg-muted/30 flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm"
            >
              <span className="truncate">{file.name}</span>
              <span className="text-muted-foreground shrink-0">
                {Math.max(1, Math.round(file.size / 1024))} Ko
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
