import type { PublicationItem } from '@entities/publication/model'

/** "2 lien(s) · 3 média(s)" — the evidence weight of a publication at a glance. */
export function evidenceSummary(
  publication: Pick<PublicationItem, 'verifiedLinks' | 'verifiedMedia'>,
) {
  const linkCount = publication.verifiedLinks.length
  const mediaCount = publication.verifiedMedia.length
  return `${linkCount} lien(s) · ${mediaCount} média(s)`
}
