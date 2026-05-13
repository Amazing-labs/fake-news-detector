export type ApiSuccess<T> = {
  success: true
  data: T
  message?: string
}

export type ApiFailure = {
  success: false
  error: string
  details?: Array<{
    path: string
    message: string
  }>
}

export class ApiClientError extends Error {
  readonly status: number
  readonly details?: ApiFailure['details']

  constructor(
    message: string,
    status: number,
    details?: ApiFailure['details'],
  ) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.details = details
  }
}

async function readResponse(response: Response) {
  const contentType = response.headers.get('content-type') ?? ''

  if (response.status === 204) {
    return null
  }

  if (contentType.includes('application/json')) {
    return response.json()
  }

  return response.text()
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T | null> {
  const response = await fetch(path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  const payload = await readResponse(response)

  if (!response.ok) {
    const errorPayload =
      payload && typeof payload === 'object' && 'error' in payload
        ? (payload as ApiFailure)
        : null

    throw new ApiClientError(
      errorPayload?.error ?? `Request failed with status ${response.status}`,
      response.status,
      errorPayload?.details,
    )
  }

  if (payload === null) {
    return null
  }

  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiSuccess<T>).data
  }

  return payload as T
}

export function toApiErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Une erreur inattendue est survenue.'
}
