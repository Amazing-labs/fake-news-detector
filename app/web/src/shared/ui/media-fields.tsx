import { useRef, useState, type DragEvent } from 'react'
import {
  isSupabaseUploadConfigured,
  uploadFileToSupabase,
} from '../lib/supabase'
import { Button, Input, Notice, Select, SectionCard } from './primitives'
import { mediaTypes, type MediaDraft } from './media-fields.model'

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

export function MediaFields(props: {
  title?: string
  description?: string
  items: MediaDraft[]
  onChange: (items: MediaDraft[]) => void
  variant?: 'default' | 'dark'
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [uploadMessage, setUploadMessage] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const isDark = props.variant === 'dark'
  const canUploadToSupabase = isSupabaseUploadConfigured()

  async function handleFiles(files: FileList | null) {
    if (isUploading) {
      return
    }

    if (!files?.length) {
      return
    }

    setUploadError(null)
    setUploadMessage(null)
    setIsUploading(true)

    try {
      const uploaded: MediaDraft[] = []
      for (const file of Array.from(files)) {
        const result = await uploadFileToSupabase(file)
        uploaded.push({
          url: result.url,
          type: result.type,
        })
      }
      props.onChange([...props.items, ...uploaded])
      setUploadMessage(
        `${uploaded.length} média${uploaded.length > 1 ? 's ajoutés' : ' ajouté'}.`,
      )
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : 'Upload impossible.',
      )
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault()
    if (isUploading || !event.dataTransfer) {
      return
    }

    void handleFiles(event.dataTransfer.files)
  }

  function preventDragNavigation(event: DragEvent<HTMLElement>) {
    event.preventDefault()
  }

  if (isDark) {
    return (
      <section className="grid gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white">
            {props.title ?? 'Médias'}
          </h2>
          <p className="mt-1 text-sm text-white/65">
            {props.description ?? 'Ajoute un ou plusieurs médias via upload.'}
          </p>
        </div>

        {props.items.map((item, index) => (
          <div
            key={`${index}-${item.type}`}
            className="grid gap-3 rounded-lg border border-white/10 bg-black/70 p-4"
          >
            <label className="grid gap-2 text-sm font-medium text-white">
              {`URL média ${index + 1}`}
              <input
                value={item.url}
                onChange={(event) => {
                  const next = [...props.items]
                  next[index] = { ...item, url: event.target.value }
                  props.onChange(next)
                }}
                className="rounded-lg border border-white/15 bg-black px-3 py-2.5 text-white transition outline-none placeholder:text-white/55 focus:border-white/45"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-white">
              Type
              <select
                value={item.type}
                onChange={(event) => {
                  const next = [...props.items]
                  next[index] = {
                    ...item,
                    type: event.target.value as MediaDraft['type'],
                  }
                  props.onChange(next)
                }}
                className="rounded-lg border border-white/15 bg-black px-3 py-2.5 text-white transition outline-none focus:border-white/45"
              >
                {mediaTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <div>
              <button
                type="button"
                onClick={() => {
                  props.onChange(props.items.filter((_, i) => i !== index))
                }}
                className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-black px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Retirer ce média
              </button>
            </div>
          </div>
        ))}

        <label
          onDragEnter={preventDragNavigation}
          onDragOver={preventDragNavigation}
          onDrop={handleDrop}
          className={`flex min-h-36 flex-col items-center justify-center rounded-lg border border-dashed border-white/15 bg-black/25 px-4 py-8 text-center transition hover:bg-black/40 ${
            isUploading
              ? 'pointer-events-none cursor-not-allowed opacity-50'
              : 'cursor-pointer'
          }`}
        >
          <span className="text-sm font-semibold">Glisse les médias ici</span>
          <span className="mt-2 text-sm text-white/65">
            {canUploadToSupabase
              ? 'ou clique pour les sélectionner'
              : 'configure Supabase pour activer l’upload'}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedMediaFileTypes}
            className="hidden"
            disabled={isUploading}
            onChange={(event) => {
              void handleFiles(event.target.files)
            }}
          />
        </label>

        {uploadMessage ? <Notice tone="success">{uploadMessage}</Notice> : null}
        {uploadError ? <Notice tone="error">{uploadError}</Notice> : null}
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
        {props.items.length ? (
          props.items.map((item, index) => (
            <div
              key={`${index}-${item.type}`}
              className="grid gap-3 rounded-[1.15rem] border border-[#eee9e2] bg-[#fbfaf8] p-4"
            >
              <Input
                label={`URL média ${index + 1}`}
                value={item.url}
                onChange={(event) => {
                  const next = [...props.items]
                  next[index] = { ...item, url: event.target.value }
                  props.onChange(next)
                }}
              />
              <Select
                label="Type"
                value={item.type}
                onChange={(event) => {
                  const next = [...props.items]
                  next[index] = {
                    ...item,
                    type: event.target.value as MediaDraft['type'],
                  }
                  props.onChange(next)
                }}
              >
                {mediaTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
              <div>
                <Button
                  variant="secondary"
                  onClick={() => {
                    props.onChange(props.items.filter((_, i) => i !== index))
                  }}
                >
                  Retirer ce média
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-[#706a63]">
            Aucun média ajouté pour l'instant.
          </p>
        )}

        <label
          onDragEnter={preventDragNavigation}
          onDragOver={preventDragNavigation}
          onDrop={handleDrop}
          className={`flex min-h-40 flex-col items-center justify-center rounded-[1.15rem] border border-dashed border-[#d8d0c7] bg-[#fbfaf8] px-4 py-8 text-center transition hover:border-[#171514] hover:bg-white ${
            isUploading
              ? 'pointer-events-none cursor-not-allowed opacity-50'
              : 'cursor-pointer'
          }`}
        >
          <span className="text-sm font-black text-[#171514]">
            {isUploading ? 'Upload en cours...' : 'Glisse les fichiers ici'}
          </span>
          <span className="mt-2 text-sm text-[#706a63]">
            {canUploadToSupabase
              ? 'ou clique pour uploader une image, vidéo, audio ou document'
              : 'configure Supabase pour activer l’upload de fichiers'}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedMediaFileTypes}
            className="hidden"
            disabled={isUploading}
            onChange={(event) => {
              void handleFiles(event.target.files)
            }}
          />
        </label>

        {uploadMessage ? <Notice tone="success">{uploadMessage}</Notice> : null}
        {uploadError ? <Notice tone="error">{uploadError}</Notice> : null}
      </div>
    </SectionCard>
  )
}
