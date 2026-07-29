import { expect, test } from 'bun:test'
import { filterPublicationsByVerdict } from './publication-filters'

test('filters publications by the requested verdict', () => {
  const items = [
    { id: '1', finalVerdict: 'TRUE', isCorrection: false },
    { id: '2', finalVerdict: 'FALSE', isCorrection: false },
    { id: '3', finalVerdict: 'MISLEADING', isCorrection: false },
    { id: '4', finalVerdict: 'UNVERIFIABLE', isCorrection: false },
  ] as Array<{ id: string; finalVerdict: string; isCorrection: boolean }>

  expect(filterPublicationsByVerdict(items, 'TRUE')).toEqual([items[0]])
  expect(filterPublicationsByVerdict(items, 'FALSE')).toEqual([items[1]])
  expect(filterPublicationsByVerdict(items, 'all')).toEqual(items)
})
