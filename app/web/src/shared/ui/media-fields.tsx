import { useRef, useState } from 'react'
import {
  isSupabaseUploadConfigured,
  uploadFileToSupabase,
} from '../lib/supabase'
import { Button, Input, Notice, Select, SectionCard } from './primitives'
import {
  createEmptyMediaDraft,
  mediaTypes,
  type MediaDraft,
} from './media-fields.model'

export function MediaFields(props: {
  title?: string
  description?: string
  items: MediaDraft[]
  onChange: (items: MediaDraft[]) => void
  addLabel?: string
  variant?: 'default' | 'dark'
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [uploadMessage, setUploadMessage] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const isDark = props.variant === 'dark'
  const canUploadToSupabase = isSupabaseUploadConfigured()

  async function handleFiles(files: FileList | null) {
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

  function addUrlDraft() {
    props.onChange([...props.items, createEmptyMediaDraft()])
  }

  function handleDarkMediaEntry() {
    if (canUploadToSupabase) {
      fileInputRef.current?.click()
      return
    }

    addUrlDraft()
  }

  if (isDark) {
    return (
      <section className="grid gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white">
            {props.title ?? 'Médias'}
          </h2>
          <p className="mt-1 text-sm text-white/65">
            {props.description ??
              'Ajoute un ou plusieurs médias via leur URL pour tester le backend.'}
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(event) => {
            void handleFiles(event.target.files)
          }}
        />

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

        <button
          type="button"
          disabled={isUploading}
          onClick={handleDarkMediaEntry}
          className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/15 bg-black/25 px-4 py-8 text-center transition hover:bg-black/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="text-sm font-semibold">Glisse les médias ici</span>
          <span className="mt-2 text-sm text-white/65">
            {canUploadToSupabase
              ? 'ou clique pour les sélectionner'
              : 'ou clique pour ajouter une URL'}
          </span>
        </button>

        {uploadMessage ? <Notice tone="success">{uploadMessage}</Notice> : null}
        {uploadError ? <Notice tone="error">{uploadError}</Notice> : null}
      </section>
    )
  }

  return (
    <SectionCard
      title={props.title ?? 'Médias'}
      description={
        props.description ??
        'Ajoute un ou plusieurs médias via leur URL pour tester le backend.'
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
        <div>
          <Button variant="secondary" onClick={addUrlDraft}>
            {props.addLabel ?? 'Ajouter un média'}
          </Button>
        </div>
        <div className="grid gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(event) => {
              void handleFiles(event.target.files)
            }}
          />
          <Button
            variant="secondary"
            disabled={!canUploadToSupabase || isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? 'Upload en cours...' : 'Uploader un fichier'}
          </Button>
          {!canUploadToSupabase ? (
            <Notice tone="info">
              Configure Supabase côté frontend pour activer l'upload de
              fichiers.
            </Notice>
          ) : null}
          {uploadMessage ? (
            <Notice tone="success">{uploadMessage}</Notice>
          ) : null}
          {uploadError ? <Notice tone="error">{uploadError}</Notice> : null}
        </div>
      </div>
    </SectionCard>
  )
}
