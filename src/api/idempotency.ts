// Idempotency-Key helper for the four counter writes (guide §1.8):
// stamps, counter enroll, redeem and void.
//
// One logical attempt (one tap of "Sellar", one enroll, one redeem, one void) = one key.
// Every retry of that attempt reuses the SAME key and must send the SAME body.
// Retriable: network error/timeout (incl. a bare gateway 502/503/504, see errors.ts),
// 429 (wait Retry-After), 409 CONFLICT retry.
// Anything else is final for that attempt; a new user attempt gets a new key.
import { toApiError } from './errors'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/** Longest Retry-After we wait for silently inside one attempt. Longer waits surface as RATE_LIMITED. */
const MAX_SILENT_WAIT_MS = 10_000

export function newIdempotencyKey(): string {
  return crypto.randomUUID()
}

export async function withIdempotency<T>(
  send: (key: string) => Promise<T>,
  options: { maxRetries?: number; key?: string } = {},
): Promise<T> {
  const { maxRetries = 2 } = options
  const key = options.key ?? newIdempotencyKey()

  for (let attempt = 0; ; attempt++) {
    try {
      return await send(key)
    }
    catch (e) {
      const err = toApiError(e)
      const wait = err.retryAfterMs ?? 500

      const retriable
        = err.isNetwork
        || (err.code === 'RATE_LIMITED' && wait <= MAX_SILENT_WAIT_MS)
        || err.isConflictRetry

      if (!retriable || attempt >= maxRetries)
        throw err

      await sleep(wait)
    }
  }
}
