// Typed API error (guide §1.13). Every rejected API call in the app is an ApiError:
// decide by `code` / `detailCode`, never by `message` text.
import type { AxiosError } from 'axios'
import type { ApiErrorDto, ErrorCode } from './types'

export type ApiErrorCode = ErrorCode | 'NETWORK'

export interface ApiErrorDetailObject {
  reason?: string
  method?: 'password' | 'otp'
  retryAt?: string
  cycleId?: string
  attemptsLeft?: number
}

const NETWORK_MESSAGE = 'No pudimos conectar con el servidor'

export class ApiError extends Error {
  /** HTTP status; 0 = network error / no response. */
  readonly status: number
  readonly code: ApiErrorCode
  readonly requestId?: string
  /** `details[0].code` when details is an array. */
  readonly detailCode?: string
  /** `details[]` → `{ field: message }`. */
  readonly fieldErrors: Record<string, string>
  /** `details` when it is an object (`{ reason }`, `{ method }`, `{ retryAt }`, `{ cycleId }`, `{ attemptsLeft }`). */
  readonly detailObj?: ApiErrorDetailObject
  readonly retryAfterMs?: number
  readonly isNetwork: boolean

  constructor(init: {
    status: number
    code: ApiErrorCode
    message: string
    requestId?: string
    detailCode?: string
    fieldErrors?: Record<string, string>
    detailObj?: ApiErrorDetailObject
    retryAfterMs?: number
  }) {
    super(init.message)
    this.name = 'ApiError'
    this.status = init.status
    this.code = init.code
    this.requestId = init.requestId
    this.detailCode = init.detailCode
    this.fieldErrors = init.fieldErrors ?? {}
    this.detailObj = init.detailObj
    this.retryAfterMs = init.retryAfterMs
    this.isNetwork = init.status === 0
  }

  /** True for `409 CONFLICT` with `details[0].code === 'retry'` (guide §2.13). */
  get isConflictRetry() {
    return this.code === 'CONFLICT' && this.detailCode === 'retry'
  }
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError
}

function headerValue(headers: unknown, name: string): string | undefined {
  if (!headers)
    return undefined
  const h = headers as { get?: (n: string) => unknown } & Record<string, unknown>
  const v = typeof h.get === 'function' ? h.get(name) : h[name] ?? h[name.toLowerCase()]

  return v == null ? undefined : String(v)
}

export function toApiError(e: unknown): ApiError {
  if (e instanceof ApiError)
    return e

  const ax = e as AxiosError<{ error?: ApiErrorDto }>
  const response = ax?.response

  if (!response) {
    return new ApiError({ status: 0, code: 'NETWORK', message: NETWORK_MESSAGE })
  }

  const env = response.data?.error
  const details = env?.details as unknown
  const list = Array.isArray(details) ? details as { field?: string; code?: string; message?: string }[] : []
  const retryAfter = Number(headerValue(response.headers, 'retry-after'))

  return new ApiError({
    status: response.status,

    // A response without our envelope (proxy, HTML error page…) is treated as an internal error
    code: env?.code ?? (response.status >= 500 ? 'INTERNAL_ERROR' : 'NETWORK'),
    message: env?.message ?? (response.status >= 500 ? 'Ocurrió un error inesperado' : NETWORK_MESSAGE),
    requestId: env?.requestId ?? headerValue(response.headers, 'x-request-id'),
    detailCode: list[0]?.code,
    fieldErrors: Object.fromEntries(list.filter(d => d.field).map(d => [d.field as string, d.message ?? ''])),
    detailObj: details && !Array.isArray(details) && typeof details === 'object' ? details as ApiErrorDetailObject : undefined,
    retryAfterMs: Number.isFinite(retryAfter) ? retryAfter * 1000 : undefined,
  })
}
