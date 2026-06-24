export function triggerBlobDownload(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(objectUrl)
}

export async function downloadFromUrl(url: string, filename: string) {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Download failed: ${response.status}`)
    const blob = await response.blob()
    triggerBlobDownload(blob, filename)
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}
