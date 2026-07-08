import { apiRequest } from './http'

// Asks the server to delete the current actor's own unsubmitted uploads (best-effort).
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
