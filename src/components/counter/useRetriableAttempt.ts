// Keeps the Idempotency-Key of a counter write whose last try failed with a retriable error
// (network/timeout, 429, 409 CONFLICT retry — §1.8), so that "Reintentar" — or re-sending the
// very same request (same target, same body) shortly after — repeats the SAME logical attempt
// with the same key and body. If the first request did reach the backend, the retry replays its
// response instead of stamping/redeeming twice. Any success or final error ends the attempt.
// Re-sending an identical request only reuses the key within REUSE_WINDOW_MS of the failure:
// later on it is a new logical attempt (e.g. the same customer scanning the same static QR on
// another visit) and gets a new key, or the backend would replay the old response (§1.8).
import { shallowRef } from 'vue'
import type { ApiError } from '@/api/errors'
import { newIdempotencyKey } from '@/api/idempotency'

export interface IdempotentAttempt<B> {
  key: string

  /** Path ids the write goes to (business, cycle, event…). */
  target: string
  body: B
}

/** How long after the failure an identical request still counts as the same attempt. */
const REUSE_WINDOW_MS = 3 * 60 * 1000

/** §1.8: errors after which the same attempt must be retried with the same key and body. */
export function isSameKeyRetriable(err: ApiError) {
  return err.isNetwork || err.code === 'RATE_LIMITED' || err.isConflictRetry
}

function sameJson(a: unknown, b: unknown): boolean {
  if (a === b)
    return true
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object')
    return false
  const ka = Object.keys(a as object)
  const kb = Object.keys(b as object)

  return ka.length === kb.length
    && ka.every(k => sameJson((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]))
}

export function useRetriableAttempt<B>() {
  const pending = shallowRef<IdempotentAttempt<B> | null>(null)
  let failedAt = 0

  /**
   * Attempt to send: the pending one when it is the same request and it failed recently,
   * otherwise a new key. An explicit "Reintentar" should resend `pending` directly instead.
   */
  function begin(target: string, body: B): IdempotentAttempt<B> {
    const p = pending.value
    if (p && Date.now() - failedAt > REUSE_WINDOW_MS)
      clear()
    else if (p && p.target === target && sameJson(p.body, body))
      return p

    return { key: newIdempotencyKey(), target, body }
  }

  /** Call after the attempt failed: keeps it only if it must be retried with the same key. */
  function fail(attempt: IdempotentAttempt<B>, err: ApiError) {
    pending.value = isSameKeyRetriable(err) ? attempt : null
    failedAt = Date.now()
  }

  function clear() {
    pending.value = null
  }

  return { pending, begin, fail, clear }
}
