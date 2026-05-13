import { createClient } from '@supabase/supabase-js'
import type { MediaDraft } from '../ui/media-fields.model'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const storageBucket =
  import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'fake-news-media'

export function isSupabaseUploadConfigured() {
  return !!supabaseUrl && !!supabaseAnonKey
}

function getSupabaseClient() {
  if (!isSupabaseUploadConfigured()) {
    throw new Error(
      'L’upload Supabase n’est pas configuré. Ajoute VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY et VITE_SUPABASE_STORAGE_BUCKET.',
    )
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

export function inferMediaType(file: File): MediaDraft['type'] {
  if (file.type.startsWith('image/')) return 'IMAGE'
  if (file.type.startsWith('video/')) return 'VIDEO'
  if (file.type.startsWith('audio/')) return 'AUDIO'
  if (file.type === 'text/plain') return 'TEXT'
  return 'DOCUMENT'
}

export async function uploadFileToSupabase(file: File) {
  const client = getSupabaseClient()
  const extension = file.name.includes('.')
    ? file.name.split('.').pop()
    : undefined
  const filename = `${crypto.randomUUID()}${extension ? `.${extension}` : ''}`
  const path = `uploads/${filename}`

  const { error } = await client.storage
    .from(storageBucket)
    .upload(path, file, {
      upsert: false,
      cacheControl: '3600',
    })

  if (error) {
    throw new Error(error.message)
  }

  const { data } = client.storage.from(storageBucket).getPublicUrl(path)

  return {
    url: data.publicUrl,
    type: inferMediaType(file),
    name: file.name,
  }
}
