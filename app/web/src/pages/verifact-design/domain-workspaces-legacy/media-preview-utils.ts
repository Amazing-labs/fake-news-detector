import { domainLabel } from '../workspace-labels'

// Display-ready media for the preview card. Shared by the inbox-subject detail
// and the citizen report history so both render/download attachments the same
// way.
export type PreviewMedia = {
  name: string
  type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'LINK' | 'TEXT'
  url: string
  imageUrl?: string
  alt?: string
  videoUrl?: string
  posterUrl?: string
  audioUrl?: string
  size?: string
}

function mediaName(url: string, type: string): string {
  try {
    const last = new URL(url).pathname.split('/').pop()
    if (last) return decodeURIComponent(last)
  } catch {
    // not a parseable URL — fall back to the type label
  }
  return domainLabel(type)
}

// Maps a raw media row ({ url, type }) — as returned by the report or
// inbox-subject media endpoints — into the display-ready preview shape.
export function toPreviewMedia(item: {
  url: string
  type: string
}): PreviewMedia {
  const type = item.type as PreviewMedia['type']
  return {
    name: mediaName(item.url, item.type),
    type,
    url: item.url,
    imageUrl: type === 'IMAGE' ? item.url : undefined,
    videoUrl: type === 'VIDEO' ? item.url : undefined,
    audioUrl: type === 'AUDIO' ? item.url : undefined,
  }
}
