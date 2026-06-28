import { apiRequest } from '@shared/api/http'
import type { DecisionList } from './schemas'

export type { Decision, DecisionList } from './schemas'

export const decisionQueryKeys = {
  all: ['decisions'] as const,
  list: () => ['decisions', 'list'] as const,
}

// Past editorial decisions taken by the connected director, newest first.
export function listDirectorDecisions() {
  return apiRequest<DecisionList>('/api/director/decisions')
}
