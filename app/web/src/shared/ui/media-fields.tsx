import { useRef, useState } from 'react'
import { uploadFileToSupabase, isSupabaseUploadConfigured } from '../lib/supabase'
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
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [uploadMessage, setUploadMessage] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

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
        `${uploaded.length} media${uploaded.length > 1 ? 's ajoutes' : ' ajoute'}.`,
      )
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload impossible.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <SectionCard
      title={props.title ?? 'Medias'}
      description={
        props.description ??
        "Ajoute un ou plusieurs médias via leur URL pour tester le backend."
      }
    >
      <div className="grid gap-3">
        {props.items.length ? (
          props.items.map((item, index) => (
            <div
              key={`${index}-${item.type}`}
              className="grid gap-3 rounded-md border border-slate-200 p-3"
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
          <p className="text-sm text-slate-600">
            Aucun média ajouté pour l'instant.
          </p>
        )}
        <div>
          <Button
            variant="secondary"
            onClick={() =>
              props.onChange([...props.items, createEmptyMediaDraft()])
            }
          >
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
            disabled={!isSupabaseUploadConfigured() || isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? 'Upload en cours...' : 'Uploader un fichier'}
          </Button>
          {!isSupabaseUploadConfigured() ? (
            <Notice tone="info">
              Configure Supabase côté frontend pour activer l’upload de fichiers.
            </Notice>
          ) : null}
          {uploadMessage ? <Notice tone="success">{uploadMessage}</Notice> : null}
          {uploadError ? <Notice tone="error">{uploadError}</Notice> : null}
        </div>
      </div>
    </SectionCard>
  )
}
