import { apiRequest } from './http'

// Asks the server to delete not-yet-submitted uploads the current actor owns.
// The server only removes objects under the caller's own `uploads/<actorId>/`
// prefix, so passing another actor's URL is a no-op. Best-effort: anything left
// behind (network failure, closed tab) is reclaimed by the reconciliation sweep.
export function cleanupMedia(urls: string[]) {
  if (!urls.length) return Promise.resolve(null)
  return apiRequest<{ requested: number; deleted: number }>(
    '/api/media/cleanup',
    {
      method: 'POST',
      body: JSON.stringify({ urls }),
    },
  )
}
