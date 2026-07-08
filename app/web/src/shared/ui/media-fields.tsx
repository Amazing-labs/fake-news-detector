import {
  File,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  Music,
  Video,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useRef, useState, type DragEvent } from 'react'
import { toast } from 'sonner'
import {
  isSupabaseUploadConfigured,
  uploadFileToSupabase,
} from '../lib/supabase'
import { cleanupMedia } from '../api/media'
import { cn } from '../lib/utils'
import { Button, Input, Select, SectionCard } from './primitives'
import { mediaTypes, type MediaDraft } from './media-fields.model'

const MAX_MEDIA = 6

// Per-type icon fallback for non-image tiles.
const mediaTypeIcon: Record<MediaDraft['type'], LucideIcon> = {
  IMAGE: ImageIcon,
  VIDEO: Video,
  AUDIO: Music,
  DOCUMENT: FileText,
  TEXT: FileText,
  LINK: LinkIcon,
}

const acceptedMediaFileTypes = [
  'image/*',
  'video/*',
  'audio/*',
  'application/pdf',
  'text/plain',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.odt',
  '.ods',
  '.odp',
].join(',')

const dropzoneBase =
  'flex min-h-36 flex-col items-center justify-center rounded-lg border border-dashed border-input bg-background px-4 py-8 text-center transition hover:border-ring hover:bg-accent/50 focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]'

export function MediaFields(props: {
  title?: string
  description?: string
  items: MediaDraft[]
  onChange: (items: MediaDraft[]) => void
  variant?: 'default' | 'dark'
  /** Current actor id; uploads are stored under `uploads/<ownerId>/`. */
  ownerId: string
  /** Locks all controls (e.g. during submit). */
  disabled?: boolean
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const sessionUploadsRef = useRef<string[]>([])
  const isDark = props.variant === 'dark'
  const canUpload = isSupabaseUploadConfigured()
  const isFull = props.items.length >= MAX_MEDIA
  // Locked while uploading or when the parent disables the field.
  const inputsDisabled = isUploading || (props.disabled ?? false)

  async function handleFiles(files: FileList | null) {
    if (props.disabled || isUploading || !files?.length || !canUpload) return
    const slots = MAX_MEDIA - props.items.length
    if (slots <= 0) return

    setIsUploading(true)
    const filesToAdd = Array.from(files).slice(0, slots)
    const uploaded: MediaDraft[] = []

    for (const file of filesToAdd) {
      try {
        const result = await uploadFileToSupabase(file, props.ownerId)
        uploaded.push({ url: result.url, type: result.type, name: result.name })
        sessionUploadsRef.current.push(result.url)
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : `Échec : ${file.name}`,
        )
      }
    }

    if (uploaded.length > 0) {
      props.onChange([...props.items, ...uploaded])
      toast.success(
        `${uploaded.length} média${uploaded.length > 1 ? 's ajoutés' : ' ajouté'}.`,
      )
    }

    setIsUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault()
    if (!props.disabled && !isUploading && canUpload && event.dataTransfer) {
      void handleFiles(event.dataTransfer.files)
    }
  }

  function removeItem(index: number) {
    if (props.disabled) return
    const url = props.items[index]?.url
    if (url) {
      // Only delete files this session uploaded, never an already-submitted URL.
      if (sessionUploadsRef.current.includes(url)) {
        void cleanupMedia([url])
      }
      sessionUploadsRef.current = sessionUploadsRef.current.filter(
        (u) => u !== url,
      )
    }
    props.onChange(props.items.filter((_, i) => i !== index))
  }

  function updateItem(index: number, patch: Partial<MediaDraft>) {
    if (props.disabled) return
    const next = [...props.items]
    next[index] = { ...next[index], ...patch }
    props.onChange(next)
  }

  if (isDark) {
    return (
      <section className="grid gap-3">
        <div>
          <h2 className="text-foreground text-sm font-semibold">
            {props.title ?? 'Médias'}
          </h2>
          <div className="mt-0.5 flex items-center justify-between gap-2">
            <p className="text-muted-foreground text-sm">
              {props.description ?? 'Ajoute un ou plusieurs médias via upload.'}
            </p>
            <span className="text-muted-foreground shrink-0 text-xs">
              {props.items.length} / {MAX_MEDIA}
            </span>
          </div>
        </div>

        {props.items.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {props.items.map((item, index) => {
              const Icon = mediaTypeIcon[item.type] ?? File
              return (
                <div
                  key={`${index}-${item.type}`}
                  className="group relative min-w-0"
                >
                  {item.type === 'IMAGE' && item.url ? (
                    <div className="border-border aspect-square overflow-hidden rounded-lg border">
                      <img
                        src={item.url}
                        alt={`Média ${index + 1}`}
                        className="size-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="border-border bg-muted flex aspect-square flex-col items-center justify-center gap-1.5 rounded-lg border px-2 text-center">
                      <Icon className="text-muted-foreground size-6 shrink-0" />
                      <span className="text-muted-foreground line-clamp-2 text-[10px] font-medium">
                        {item.type}
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={props.disabled}
                    className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full border border-white/20 bg-black/80 opacity-0 shadow-sm transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none disabled:cursor-not-allowed"
                    aria-label={`Retirer le média ${index + 1}`}
                  >
                    <X className="size-3 text-white" />
                  </button>
                  {item.name ? (
                    <p
                      className="text-muted-foreground mt-1 truncate text-[10px]"
                      title={item.name}
                    >
                      {item.name}
                    </p>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}

        {!isFull && (
          <label
            onDragEnter={(e) => e.preventDefault()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={cn(
              dropzoneBase,
              inputsDisabled
                ? 'pointer-events-none cursor-not-allowed opacity-50'
                : 'cursor-pointer',
            )}
          >
            {isUploading ? (
              <Loader2 className="text-muted-foreground size-5 animate-spin" />
            ) : null}
            <span className="text-foreground text-sm font-semibold">
              {isUploading ? 'Upload en cours...' : 'Glisse les médias ici'}
            </span>
            <span className="text-muted-foreground mt-2 text-sm">
              {canUpload
                ? `ou clique pour les sélectionner · max ${MAX_MEDIA}`
                : "configure Supabase pour activer l'upload"}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedMediaFileTypes}
              className="hidden"
              disabled={inputsDisabled}
              onChange={(e) => void handleFiles(e.target.files)}
            />
          </label>
        )}
      </section>
    )
  }

  return (
    <SectionCard
      title={props.title ?? 'Médias'}
      description={
        props.description ?? 'Ajoute un ou plusieurs médias via upload.'
      }
    >
      <div className="grid gap-3">
        {/* Image thumbnails grid */}
        {props.items.some((i) => i.type === 'IMAGE') && (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {props.items
              .map((item, idx) => ({ item, idx }))
              .filter(({ item }) => item.type === 'IMAGE' && item.url)
              .map(({ item, idx }) => (
                <div
                  key={idx}
                  className="aspect-square overflow-hidden rounded-lg border"
                >
                  <img
                    src={item.url}
                    alt={`Média ${idx + 1}`}
                    className="size-full object-cover"
                  />
                </div>
              ))}
          </div>
        )}

        {props.items.length ? (
          props.items.map((item, index) => (
            <div
              key={`${index}-${item.type}`}
              className="grid gap-3 rounded-[1.15rem] border border-[#eee9e2] bg-[#fbfaf8] p-4"
            >
              <Input
                label={`URL média ${index + 1}`}
                value={item.url}
                onChange={(e) => updateItem(index, { url: e.target.value })}
              />
              <Select
                label="Type"
                value={item.type}
                onChange={(e) =>
                  updateItem(index, {
                    type: e.target.value as MediaDraft['type'],
                  })
                }
              >
                {mediaTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
              <Button
                variant="secondary"
                disabled={props.disabled}
                onClick={() => removeItem(index)}
              >
                Retirer ce média
              </Button>
            </div>
          ))
        ) : (
          <p className="text-sm text-[#706a63]">
            Aucun média ajouté pour l'instant.
          </p>
        )}

        {!isFull && (
          <label
            onDragEnter={(e) => e.preventDefault()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={cn(
              dropzoneBase,
              'min-h-40',
              inputsDisabled
                ? 'pointer-events-none cursor-not-allowed opacity-50'
                : 'cursor-pointer',
            )}
          >
            {isUploading ? (
              <Loader2 className="text-muted-foreground size-5 animate-spin" />
            ) : null}
            <span className="text-foreground text-sm font-black">
              {isUploading ? 'Upload en cours...' : 'Glisse les fichiers ici'}
            </span>
            <span className="text-muted-foreground mt-2 text-sm">
              {canUpload
                ? `ou clique pour uploader · max ${MAX_MEDIA}`
                : "configure Supabase pour activer l'upload de fichiers"}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedMediaFileTypes}
              className="hidden"
              disabled={inputsDisabled}
              onChange={(e) => void handleFiles(e.target.files)}
            />
          </label>
        )}
      </div>
    </SectionCard>
  )
}
