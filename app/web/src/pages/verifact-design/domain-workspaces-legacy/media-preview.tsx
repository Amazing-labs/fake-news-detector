import { Download, FileText } from 'lucide-react'
import { Button } from '@shared/ui/shadcn/button'
import { downloadFromUrl, triggerBlobDownload } from '@shared/lib/download'
import type { PreviewMedia } from './media-preview-utils'

async function downloadMedia(item: PreviewMedia) {
  const contentUrl =
    item.type === 'IMAGE'
      ? item.imageUrl
      : item.type === 'VIDEO'
        ? item.videoUrl
        : item.type === 'AUDIO'
          ? item.audioUrl
          : item.url

  if (!contentUrl || contentUrl.startsWith('#')) {
    if (item.type === 'DOCUMENT') {
      const blob = new Blob(
        [
          `[Fichier de démonstration]\n\n${item.name}\n\nCe fichier est un placeholder.`,
        ],
        { type: 'text/plain' },
      )
      triggerBlobDownload(blob, item.name)
    }
    return
  }

  await downloadFromUrl(contentUrl, item.name)
}

export function MediaPreviewItem({
  item,
  canDownload,
}: {
  item: PreviewMedia
  canDownload: boolean
}) {
  return (
    <div className="overflow-hidden rounded-lg border">
      {item.type === 'IMAGE' && item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.alt ?? item.name}
          className="h-48 w-full object-cover"
        />
      ) : item.type === 'VIDEO' && item.videoUrl ? (
        <video
          src={item.videoUrl}
          poster={item.posterUrl}
          controls
          className="h-48 w-full bg-black object-contain"
        />
      ) : item.type === 'AUDIO' && item.audioUrl ? (
        <div className="bg-muted/40 flex h-24 items-center justify-center px-4">
          <audio src={item.audioUrl} controls className="w-full" />
        </div>
      ) : (
        <div className="bg-muted/40 flex h-24 items-center justify-center gap-3 px-4">
          <FileText className="text-muted-foreground size-8 shrink-0" />
          <p className="text-muted-foreground min-w-0 truncate text-sm">
            {item.name}
          </p>
        </div>
      )}
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{item.name}</p>
          {item.size && (
            <p className="text-muted-foreground text-xs">{item.size}</p>
          )}
        </div>
        {canDownload && (
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground size-8 shrink-0"
            aria-label={`Télécharger ${item.name}`}
            onClick={() => downloadMedia(item)}
          >
            <Download className="size-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
