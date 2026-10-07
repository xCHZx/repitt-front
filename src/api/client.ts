// HTTP client for the Repitt API v1.
//
// - `request(method, '/v1/...', opts)` is typed from the generated contract: path params, query,
//   body and the success body are inferred from `paths` (no hand-written API types).
// - Every rejection is an `ApiError` (see errors.ts).
// - Interceptors implement the cross-cutting rules of the integration guide:
//   §2.3 refresh on TOKEN_EXPIRED (single flight), session end, suspended account,
//   §2.8/§2.9 step-up / reauthentication then retry (same Idempotency-Key),
//   §2.13 one automatic retry on `409 CONFLICT retry` (except OTP verify flows),
//   §1.10 short `Retry-After` waits on safe reads.
// The app wires session/router/dialog behaviour through `configureApiClient` (see stores/session.ts).
import axios, { AxiosHeaders } from 'axios'
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'
import { ApiError, toApiError } from './errors'
import { refreshAccessToken } from './refresh'
import type { AccessToken, paths } from './types'

// ---------------------------------------------------------------------------------------------
// Configuration

export const apiBaseUrl = String(import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')

export type ReauthMethod = 'password' | 'otp'

export interface ApiClientHooks {
  getAccessToken: () => string | null
  setAccessToken: (token: AccessToken) => void

  /** 401 UNAUTHENTICATED / SESSION_REVOKED, or a refresh that failed: clear the session and go to login. */
  onSessionEnded: () => void

  /** 403 ACCOUNT_SUSPENDED anywhere: fixed suspended-account screen. */
  onAccountSuspended: () => void

  /** Show the step-up / reauthentication dialog. Resolves true when the original request can be retried. */
  requestReauth: (method: ReauthMethod) => Promise<boolean>

  /** PASSWORD_REQUIRED is only solvable by step-up when the user has a password and is not a cashier of the active business (§1.12). */
  canStepUpWithPassword: () => boolean
}

const noopHooks: ApiClientHooks = {
  getAccessToken: () => null,
  setAccessToken: () => {},
  onSessionEnded: () => {},
  onAccountSuspended: () => {},
  requestReauth: async () => false,
  canStepUpWithPassword: () => false,
}

let hooks: ApiClientHooks = noopHooks

export function configureApiClient(next: Partial<ApiClientHooks>) {
  hooks = { ...hooks, ...next }
}

/** Per-request switches, set through `request(..., { meta })`. */
export interface ApiRequestMeta {

  /** Do not open step-up / reauth dialogs nor redirect on session end (auth forms, the dialogs themselves). */
  noAuthHandling?: boolean

  /** Do not auto-retry `409 CONFLICT retry` (OTP verify flows must restart from the code request, §2.13). */
  noConflictRetry?: boolean
}

interface RetryState {
  _refreshed?: boolean
  _reauthed?: boolean
  _conflictRetried?: boolean
  _rateRetried?: boolean
}

type InternalConfig = InternalAxiosRequestConfig & RetryState & { meta?: ApiRequestMeta }

// ---------------------------------------------------------------------------------------------
// Axios instance + interceptors

export const http = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
})

http.interceptors.request.use(cfg => {
  const token = hooks.getAccessToken()
  if (token)
    cfg.headers.Authorization = `Bearer ${token}`
  else
    delete cfg.headers.Authorization

  return cfg
})

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const MAX_AUTO_RATE_WAIT_MS = 5000

http.interceptors.response.use(undefined, async (raw: unknown) => {
  // AbortController cancellations keep axios' CanceledError (callers check axios.isCancel)
  if (axios.isCancel(raw))
    throw raw

  const err = toApiError(raw)
  const cfg = (raw as { config?: InternalConfig })?.config
  if (!cfg)
    throw err

  const meta = cfg.meta ?? {}
  const hadSession = Boolean(cfg.headers?.Authorization)

  switch (err.code) {
    case 'TOKEN_EXPIRED': {
      if (!cfg._refreshed) {
        cfg._refreshed = true

        const outcome = await refreshAccessToken(apiBaseUrl)
        if (outcome.ok) {
          hooks.setAccessToken(outcome.token)

          return http.request(cfg)
        }
        if (outcome.error.code === 'ACCOUNT_SUSPENDED')
          hooks.onAccountSuspended()
        else
          hooks.onSessionEnded()
      }
      else {
        hooks.onSessionEnded()
      }
      break
    }

    case 'UNAUTHENTICATED':
    case 'SESSION_REVOKED':
      if (hadSession && !meta.noAuthHandling)
        hooks.onSessionEnded()
      break

    case 'ACCOUNT_SUSPENDED':
      hooks.onAccountSuspended()
      break

    case 'PASSWORD_REQUIRED':
      if (!meta.noAuthHandling && !cfg._reauthed && hooks.canStepUpWithPassword()) {
        cfg._reauthed = true
        if (await hooks.requestReauth('password'))
          return http.request(cfg)
      }
      break

    case 'REAUTH_REQUIRED':
      if (!meta.noAuthHandling && !cfg._reauthed) {
        cfg._reauthed = true
        if (await hooks.requestReauth(err.detailObj?.method ?? 'password'))
          return http.request(cfg)
      }
      break

    case 'CONFLICT':
      // "Nothing was applied": retry the very same request once (same body, same Idempotency-Key)
      if (err.isConflictRetry && !meta.noConflictRetry && !cfg._conflictRetried) {
        cfg._conflictRetried = true
        await sleep(150)

        return http.request(cfg)
      }
      break

    case 'RATE_LIMITED':
      // Only safe reads wait automatically; writes surface the error so the UI can show a countdown
      if (cfg.method === 'get' && !cfg._rateRetried && (err.retryAfterMs ?? Infinity) <= MAX_AUTO_RATE_WAIT_MS) {
        cfg._rateRetried = true
        await sleep(err.retryAfterMs ?? 1000)

        return http.request(cfg)
      }
      break
  }

  throw err
})

// ---------------------------------------------------------------------------------------------
// Typed request over the generated contract

export type HttpMethod = 'get' | 'post' | 'patch' | 'delete'

type Op<P extends keyof paths, M extends HttpMethod> = NonNullable<paths[P][M]>

export type PathsFor<M extends HttpMethod> = {
  [P in keyof paths]: [NonNullable<paths[P][M]>] extends [never] ? never : P
}[keyof paths]

type ContentOf<C> =
  C extends { 'application/json': infer J } ? J
    : C extends { 'multipart/form-data': unknown } ? FormData
      : never

type BodyOf<O> = O extends { requestBody?: infer RB }
  ? NonNullable<RB> extends { content: infer C } ? ContentOf<C> : never
  : never

type PathPart<O> = O extends { parameters: { path: infer X } } ? { path: X } : { path?: undefined }

type QueryPart<O> = O extends { parameters: { query?: infer Q } }
  ? [NonNullable<Q>] extends [never] ? { query?: undefined } : { query?: NonNullable<Q> }
  : { query?: undefined }

type BodyPart<O> = O extends { requestBody: unknown }
  ? { body: BodyOf<O> }
  : [BodyOf<O>] extends [never] ? { body?: undefined } : { body?: BodyOf<O> }

export type RequestOptions<O> = PathPart<O> & QueryPart<O> & BodyPart<O> & {
  headers?: Record<string, string>
  signal?: AbortSignal
  meta?: ApiRequestMeta
}

type JsonOf<R> = R extends { content: { 'application/json': infer T } } ? T : undefined

/** Success body (200/201/202/204) of an operation; `undefined` for 204. */
export type SuccessOf<O> = O extends { responses: infer R }
  ? JsonOf<R[Extract<keyof R, 200 | 201 | 202 | 204>]>
  : never

type Args<O> = object extends RequestOptions<O> ? [opts?: RequestOptions<O>] : [opts: RequestOptions<O>]

function buildUrl(path: string, params?: Record<string, unknown>) {
  return path
    .replace(/^\/v1(?=\/|$)/, '')
    .replace(/\{(\w+)\}/g, (_, key: string) => {
      const value = params?.[key]
      if (value === undefined || value === null || value === '')
        throw new Error(`Missing path param "${key}" for ${path}`)

      return encodeURIComponent(String(value))
    })
}

interface LooseOptions {
  path?: Record<string, unknown>
  query?: Record<string, unknown>
  body?: unknown
  headers?: Record<string, string>
  signal?: AbortSignal
  meta?: ApiRequestMeta
}

export function request<M extends HttpMethod, P extends PathsFor<M>>(
  method: M,
  path: P,
  ...args: Args<Op<P, M>>
): Promise<SuccessOf<Op<P, M>>>
export async function request(method: HttpMethod, path: string, ...args: unknown[]): Promise<unknown> {
  const o = (args[0] ?? {}) as LooseOptions

  const headers = new AxiosHeaders(o.headers)

  // Body-less routes are called with no body and no Content-Type (§1.7). Axios would otherwise
  // default POST/PATCH to x-www-form-urlencoded on some adapters, which /v1/auth/* rejects (jsonRequired).
  if (o.body === undefined)
    headers.set('Content-Type', false)

  const config: AxiosRequestConfig & { meta?: ApiRequestMeta } = {
    method,
    url: buildUrl(path, o.path),
    params: o.query,
    data: o.body,
    headers,
    signal: o.signal,
    meta: o.meta,
  }

  const res = await http.request(config)

  // 204 / empty body
  return res.status === 204 || res.data === '' ? undefined : res.data
}

/** `{ data }` → data */
export function unwrap<T>(envelope: { data: T }): T {
  return envelope.data
}

export { ApiError }
