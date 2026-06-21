import { FilePlus2, Loader2, X } from 'lucide-react'
import { useEffect, useRef, useState, type DragEvent } from 'react'
import { toast } from 'sonner'
import {
  deleteFilesFromSupabase,
  flushOrphanedUploads,
  isSupabaseUploadConfigured,
  trackPendingUpload,
  untrackPendingUploads,
  uploadFileToSupabase,
} from '../lib/supabase'
import { cn } from '../lib/utils'
import { Button, Input, Select, SectionCard } from './primitives'
import { mediaTypes, type MediaDraft } from './media-fields.model'

const MAX_MEDIA = 6

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
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const sessionUploadsRef = useRef<string[]>([])
  const isDark = props.variant === 'dark'
  const canUpload = isSupabaseUploadConfigured()
  const isFull = props.items.length >= MAX_MEDIA

  // Clean up orphans from previous sessions on mount
  useEffect(() => {
    void flushOrphanedUploads()
  }, [])

  // On unmount: delete session uploads still pending (form not submitted)
  useEffect(() => {
    return () => {
      const pending: string[] = JSON.parse(
        localStorage.getItem('fnd:pending-uploads') ?? '[]',
      )
      const toDelete = sessionUploadsRef.current.filter((url) =>
        pending.includes(url),
      )
      if (toDelete.length > 0) {
        void deleteFilesFromSupabase(toDelete)
        untrackPendingUploads(toDelete)
      }
    }
  }, [])

  async function handleFiles(files: FileList | null) {
    if (isUploading || !files?.length) return
    const slots = MAX_MEDIA - props.items.length
    if (slots <= 0) return

    setIsUploading(true)
    const filesToAdd = Array.from(files).slice(0, slots)

    try {
      const uploaded: MediaDraft[] = []
      for (const file of filesToAdd) {
        const result = await uploadFileToSupabase(file)
        uploaded.push({ url: result.url, type: result.type })
        trackPendingUpload(result.url)
        sessionUploadsRef.current.push(result.url)
      }
      props.onChange([...props.items, ...uploaded])
      toast.success(
        `${uploaded.length} média${uploaded.length > 1 ? 's ajoutés' : ' ajouté'}.`,
      )
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload impossible.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault()
    if (!isUploading && event.dataTransfer) {
      void handleFiles(event.dataTransfer.files)
    }
  }

  function removeItem(index: number) {
    const url = props.items[index]?.url
    if (url) {
      untrackPendingUploads([url])
      sessionUploadsRef.current = sessionUploadsRef.current.filter(
        (u) => u !== url,
      )
    }
    props.onChange(props.items.filter((_, i) => i !== index))
  }

  function updateItem(index: number, patch: Partial<MediaDraft>) {
    const next = [...props.items]
    next[index] = { ...next[index], ...patch }
    props.onChange(next)
  }

  if (isDark) {
    return (
      <section className="grid gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white">
            {props.title ?? 'Médias'}
          </h2>
          <div className="mt-0.5 flex items-center justify-between gap-2">
            <p className="text-sm text-white/65">
              {props.description ?? 'Ajoute un ou plusieurs médias via upload.'}
            </p>
            <span className="shrink-0 text-xs text-white/40">
              {props.items.length} / {MAX_MEDIA}
            </span>
          </div>
        </div>

        {props.items.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {props.items.map((item, index) => (
              <div key={`${index}-${item.type}`} className="group relative">
                {item.type === 'IMAGE' && item.url ? (
                  <div className="aspect-square overflow-hidden rounded-lg border border-white/10">
                    <img
                      src={item.url}
                      alt={`Média ${index + 1}`}
                      className="size-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 text-center">
                    <FilePlus2 className="size-5 shrink-0 text-white/40" />
                    <span className="line-clamp-2 text-[10px] text-white/50">
                      {item.type}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full border border-white/20 bg-black/80 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                  aria-label={`Retirer le média ${index + 1}`}
                >
                  <X className="size-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {!isFull && (
          <label
            onDragEnter={(e) => e.preventDefault()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={cn(
              dropzoneBase,
              isUploading
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
              disabled={isUploading}
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
              <Button variant="secondary" onClick={() => removeItem(index)}>
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
              isUploading
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
              disabled={isUploading}
              onChange={(e) => void handleFiles(e.target.files)}
            />
          </label>
        )}
      </div>
    </SectionCard>
  )
}
