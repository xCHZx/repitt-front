// Single-flight refresh of the access token (guide §2.2–§2.3).
// - One refresh in flight per tab (shared promise) and across tabs (navigator.locks).
// - A 409 from refresh means another tab is rotating the cookie: wait 300 ms and retry ONCE.
// - Uses a bare axios call: the refresh never goes through the app interceptors.
import axios from 'axios'
import { toApiError } from './errors'
import type { ApiError } from './errors'
import type { AccessToken } from './types'

export type RefreshOutcome =
  | { ok: true; token: AccessToken }
  | { ok: false; error: ApiError }

const LOCK_NAME = 'repitt-refresh'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

let inflight: Promise<RefreshOutcome> | null = null

async function doRefresh(baseURL: string, retried = false): Promise<RefreshOutcome> {
  try {
    const { data } = await axios.post<{ data: AccessToken }>(`${baseURL}/auth/refresh`, undefined, { withCredentials: true })

    return { ok: true, token: data.data }
  }
  catch (e) {
    const error = toApiError(e)
    if (error.status === 409 && !retried) {
      await sleep(300)

      return doRefresh(baseURL, true)
    }

    return { ok: false, error }
  }
}

export function refreshAccessToken(baseURL: string): Promise<RefreshOutcome> {
  if (!inflight) {
    const locks = typeof navigator !== 'undefined' ? navigator.locks : undefined

    const run = locks
      ? locks.request(LOCK_NAME, () => doRefresh(baseURL))
      : doRefresh(baseURL)

    inflight = run.finally(() => {
      inflight = null
    })
  }

  return inflight
}
