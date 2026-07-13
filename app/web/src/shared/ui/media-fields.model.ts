export type MediaDraft = {
  url: string
  type: 'AUDIO' | 'LINK' | 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT'
  // Display-only (under the thumbnail); not sent to the server.
  name?: string
}

export function normalizeMediaDrafts(items: MediaDraft[]) {
  return items
    .map((item, index) => ({
      url: item.url.trim(),
      type: item.type,
      order: index,
    }))
    .filter((item) => item.url.length > 0)
}
