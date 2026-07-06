// infrastructure/adapters/SupabaseStorageAdapter.ts

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { IMediaStorage } from '../../domain/interfaces'
import { readProcessEnv } from '../../shared'

// Server-side deletion of bucket objects with the Supabase service-role key,
// which bypasses Storage RLS. The public anon key used by the web client is
// intentionally not allowed to delete, so removing files must go through here.
//
// The credentials are read from process.env (SUPABASE_URL /
// SUPABASE_SERVICE_ROLE_KEY), mirroring how the database URL is resolved. When
// they are absent the adapter degrades to a logged no-op so local/dev without
// storage configured still runs.
export class SupabaseStorageAdapter implements IMediaStorage {
  private readonly bucket =
    readProcessEnv('SUPABASE_STORAGE_BUCKET') ?? 'fake-news-media'
  private client: SupabaseClient | null | undefined

  private getClient(): SupabaseClient | null {
    if (this.client !== undefined) return this.client
    const url = readProcessEnv('SUPABASE_URL')
    const serviceRoleKey = readProcessEnv('SUPABASE_SERVICE_ROLE_KEY')
    this.client =
      url && serviceRoleKey
        ? createClient(url, serviceRoleKey, {
            auth: { persistSession: false },
          })
        : null
    return this.client
  }

  // Maps a Supabase public URL back to its object path inside the bucket, e.g.
  // https://<ref>.supabase.co/storage/v1/object/public/<bucket>/uploads/x.png
  // -> uploads/x.png
  private extractPath(publicUrl: string): string {
    const marker = `/object/public/${this.bucket}/`
    const idx = publicUrl.indexOf(marker)
    return idx !== -1 ? publicUrl.slice(idx + marker.length) : publicUrl
  }

  async deleteByPublicUrls(publicUrls: string[]): Promise<void> {
    if (!publicUrls.length) return
    const client = this.getClient()
    if (!client) {
      console.warn(
        '[storage] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not configured — skipping bucket cleanup for',
        publicUrls.length,
        'file(s)',
      )
      return
    }

    const paths = publicUrls.map((url) => this.extractPath(url))
    const { error } = await client.storage.from(this.bucket).remove(paths)
    if (error) {
      console.error('[storage] failed to delete bucket objects:', error.message)
    }
  }
}
