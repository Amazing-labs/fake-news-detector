import { apiRequest } from '@shared/api/http'
import type { ContributionList } from './schemas'

export type { Contribution, ContributionList } from './schemas'

export const contributionQueryKeys = {
  all: ['contributions'] as const,
  mine: () => ['contributions', 'mine'] as const,
}

// The connected actor's own contributions (watcher evidence), newest first.
export function listMyContributions() {
  return apiRequest<ContributionList>('/api/me/contributions')
}
