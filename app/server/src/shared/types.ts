// shared/types.ts
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export type StatusReason =
  | 'SPAM'
  | 'ABUSE'
  | 'FRAUD'
  | 'INACTIVITY'
  | 'USER_REQUEST'
  | 'OTHER'

export type ActorStatus = 'ACTIVE' | 'DISABLED' | 'BANNED'
export type ActorRole = 'EDITORIAL_DIRECTOR' | 'JOURNALIST' | 'CITIZEN'
