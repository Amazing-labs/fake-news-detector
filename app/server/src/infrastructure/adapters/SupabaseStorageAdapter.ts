// infrastructure/adapters/SupabaseStorageAdapter.ts

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { IMediaStorage, StorageObject } from '../../domain/interfaces'
import { readProcessEnv } from '../../shared'

// Server-side management of bucket objects with the Supabase service-role key,
// which bypasses Storage RLS. The public anon key used by the web client is
// intentionally not allowed to delete, so removing/listing files must go here.
//
// Credentials are read from process.env (SUPABASE_URL /
// SUPABASE_SERVICE_ROLE_KEY), mirroring how the database URL is resolved. When
// they are absent the adapter degrades to a logged no-op so local/dev without
// storage configured still runs.
export class SupabaseStorageAdapter implements IMediaStorage {
  // Read lazily: on Cloudflare Workers process.env is not populated during the
  // top-level module evaluation that constructs this adapter, so an eager read
  // would ignore any SUPABASE_STORAGE_BUCKET override.
  private get bucket(): string {
    return readProcessEnv('SUPABASE_STORAGE_BUCKET') ?? 'fake-news-media'
  }
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
    if (!this.client) {
      console.warn(
        '[storage] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not configured — storage operations are disabled',
      )
    }
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

  toObjectPaths(publicUrls: string[]): string[] {
    return publicUrls.map((url) => this.extractPath(url))
  }

  async deleteByPublicUrls(publicUrls: string[]): Promise<void> {
    if (!publicUrls.length) return
    await this.deleteObjects(this.toObjectPaths(publicUrls))
  }

  async deleteObjects(paths: string[]): Promise<void> {
    if (!paths.length) return
    const client = this.getClient()
    if (!client) return

    const chunkSize = 100
    for (let i = 0; i < paths.length; i += chunkSize) {
      const chunk = paths.slice(i, i + chunkSize)
      const { error } = await client.storage.from(this.bucket).remove(chunk)
      if (error) {
        console.error(
          '[storage] failed to delete bucket objects:',
          error.message,
        )
      }
    }
  }

  async listObjects(prefix: string): Promise<StorageObject[]> {
    const client = this.getClient()
    if (!client) return []

    const results: StorageObject[] = []
    const pageSize = 1000

    // Supabase list() is per-prefix and non-recursive; folders come back as
    // entries with a null id, so we descend into them.
    const walk = async (dir: string): Promise<void> => {
      let offset = 0
      for (;;) {
        const { data, error } = await client.storage
          .from(this.bucket)
          .list(dir, { limit: pageSize, offset })
        if (error) {
          console.error('[storage] list failed:', error.message, dir)
          return
        }
        if (!data || data.length === 0) break

        for (const entry of data) {
          const full = dir ? `${dir}/${entry.name}` : entry.name
          // Folders come back with a null/undefined id; a falsy check is more
          // robust than `=== null` across SDK/API versions.
          if (!entry.id) {
            await walk(full)
          } else {
            results.push({
              path: full,
              createdAt: new Date(
                entry.created_at ?? entry.updated_at ?? Date.now(),
              ),
            })
          }
        }

        if (data.length < pageSize) break
        offset += pageSize
      }
    }

    await walk(prefix)
    return results
  }
}
