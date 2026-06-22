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

const PENDING_UPLOADS_KEY = 'fnd:pending-uploads'

function extractPath(publicUrl: string): string {
  const marker = `/object/public/${storageBucket}/`
  const idx = publicUrl.indexOf(marker)
  return idx !== -1 ? publicUrl.slice(idx + marker.length) : publicUrl
}

export async function deleteFilesFromSupabase(
  publicUrls: string[],
): Promise<void> {
  if (!publicUrls.length || !isSupabaseUploadConfigured()) return
  const client = getSupabaseClient()
  const paths = publicUrls.map(extractPath)
  await client.storage.from(storageBucket).remove(paths)
}

export function getPendingUploads(): string[] {
  try {
    const raw = localStorage.getItem(PENDING_UPLOADS_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed)
      ? parsed.filter((v): v is string => typeof v === 'string')
      : []
  } catch {
    return []
  }
}

export function trackPendingUpload(url: string) {
  const pending = getPendingUploads()
  if (pending.includes(url)) return
  localStorage.setItem(PENDING_UPLOADS_KEY, JSON.stringify([...pending, url]))
}

export function untrackPendingUploads(urls: string[]) {
  if (!urls.length) return
  const pending = getPendingUploads()
  localStorage.setItem(
    PENDING_UPLOADS_KEY,
    JSON.stringify(pending.filter((u) => !urls.includes(u))),
  )
}

export async function flushOrphanedUploads(): Promise<void> {
  const pending = getPendingUploads()
  if (!pending.length) return
  await deleteFilesFromSupabase(pending)
  localStorage.removeItem(PENDING_UPLOADS_KEY)
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
