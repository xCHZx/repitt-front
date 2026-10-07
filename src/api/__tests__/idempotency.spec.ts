import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../errors'
import { withIdempotency } from '../idempotency'

const err = (init: ConstructorParameters<typeof ApiError>[0]) => new ApiError(init)

describe('withIdempotency', () => {
  it('reuses the same key on retriable failures (network, 429, 409 retry)', async () => {
    vi.useFakeTimers()

    const keys: string[] = []

    const failures = [
      err({ status: 0, code: 'NETWORK', message: 'n' }),
      err({ status: 409, code: 'CONFLICT', message: 'c', detailCode: 'retry' }),
    ]

    const p = withIdempotency(async key => {
      keys.push(key)

      const f = failures.shift()
      if (f)
        throw f

      return 'ok'
    })

    await vi.runAllTimersAsync()

    await expect(p).resolves.toBe('ok')
    expect(keys).toHaveLength(3)
    expect(new Set(keys).size).toBe(1)
    expect(keys[0]).toMatch(/^[\da-f-]{36}$/)

    vi.useRealTimers()
  })

  it('does not retry final errors', async () => {
    const send = vi.fn(async () => {
      throw err({ status: 409, code: 'COOLDOWN_ACTIVE', message: 'c' })
    })

    await expect(withIdempotency(send)).rejects.toMatchObject({ code: 'COOLDOWN_ACTIVE' })
    expect(send).toHaveBeenCalledTimes(1)
  })

  it('gives up after maxRetries and rethrows the last error', async () => {
    vi.useFakeTimers()

    const send = vi.fn(async () => {
      throw err({ status: 0, code: 'NETWORK', message: 'n' })
    })

    const p = withIdempotency(send, { maxRetries: 2 })
    const assertion = expect(p).rejects.toMatchObject({ code: 'NETWORK' })

    await vi.runAllTimersAsync()
    await assertion
    expect(send).toHaveBeenCalledTimes(3)

    vi.useRealTimers()
  })

  it('surfaces long Retry-After waits instead of blocking', async () => {
    const send = vi.fn(async () => {
      throw err({ status: 429, code: 'RATE_LIMITED', message: 'r', retryAfterMs: 600_000 })
    })

    await expect(withIdempotency(send)).rejects.toMatchObject({ code: 'RATE_LIMITED' })
    expect(send).toHaveBeenCalledTimes(1)
  })

  it('uses a caller-provided key (step-up retries keep the attempt key)', async () => {
    const send = vi.fn(async (key: string) => key)

    await expect(withIdempotency(send, { key: 'fixed-key' })).resolves.toBe('fixed-key')
  })
})
