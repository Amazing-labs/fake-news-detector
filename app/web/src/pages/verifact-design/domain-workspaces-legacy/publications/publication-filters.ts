import type { Verdict } from '@entities/investigation/schemas'
import type { PublicationItem } from '@entities/publication/model'

export type PublicationVerdictFilter = 'all' | Verdict

export const publicationVerdictFilters: Array<{
  value: PublicationVerdictFilter
  label: string
}> = [
  { value: 'all', label: 'Tous' },
  { value: 'TRUE', label: 'Vrai' },
  { value: 'FALSE', label: 'Faux' },
  { value: 'MISLEADING', label: 'Trompeur' },
  { value: 'UNVERIFIABLE', label: 'Non vérifiable' },
]

export function filterPublicationsByVerdict<T extends Pick<PublicationItem, 'finalVerdict'>>(
  items: T[],
  verdict: PublicationVerdictFilter,
): T[] {
  if (verdict === 'all') {
    return items
  }

  return items.filter((item) => item.finalVerdict === verdict)
}

export function getPublicationVerdictCounts<T extends Pick<PublicationItem, 'finalVerdict'>>(
  items: T[],
): Record<PublicationVerdictFilter, number> {
  return publicationVerdictFilters.reduce(
    (counts, filter) => {
      counts[filter.value] =
        filter.value === 'all'
          ? items.length
          : items.filter((item) => item.finalVerdict === filter.value).length

      return counts
    },
    {} as Record<PublicationVerdictFilter, number>,
  )
}
