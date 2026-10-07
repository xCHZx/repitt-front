import { AxiosError, AxiosHeaders, CanceledError } from 'axios'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { describe, expect, it } from 'vitest'
import { ApiError, toApiError } from '../errors'

function axiosErr(status: number, data: unknown, headers: Record<string, string> = {}) {
  const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig
  const response = { status, data, headers: new AxiosHeaders(headers), config, statusText: '' } as AxiosResponse

  return new AxiosError('x', 'ERR_BAD_RESPONSE', config, null, response)
}

describe('toApiError', () => {
  it('maps a validation envelope with details[] to fieldErrors and detailCode', () => {
    const err = toApiError(axiosErr(400, {
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Los datos enviados no son válidos',
        requestId: 'r1',
        details: [
          { field: 'business.categoryId', code: 'categoryUnavailable', message: 'La categoría no existe' },
          { field: 'name', code: 'maxLength', message: 'Muy largo' },
        ],
      },
    }))

    expect(err).toBeInstanceOf(ApiError)
    expect(err.status).toBe(400)
    expect(err.code).toBe('VALIDATION_FAILED')
    expect(err.detailCode).toBe('categoryUnavailable')
    expect(err.fieldErrors).toEqual({ 'business.categoryId': 'La categoría no existe', 'name': 'Muy largo' })
    expect(err.detailObj).toBeUndefined()
    expect(err.requestId).toBe('r1')
    expect(err.isNetwork).toBe(false)
  })

  it('keeps object details (402 reason, REAUTH method, retryAt…) in detailObj', () => {
    const err = toApiError(axiosErr(402, { error: { code: 'ENTITLEMENT_REQUIRED', message: 'm', details: { reason: 'trial_expired' } } }))

    expect(err.detailObj).toEqual({ reason: 'trial_expired' })
    expect(err.detailCode).toBeUndefined()
    expect(err.fieldErrors).toEqual({})
  })

  it('reads Retry-After in seconds', () => {
    const err = toApiError(axiosErr(429, { error: { code: 'RATE_LIMITED', message: 'm' } }, { 'Retry-After': '7' }))

    expect(err.retryAfterMs).toBe(7000)
  })

  it('treats a missing response as a network error', () => {
    const err = toApiError(new AxiosError('Network Error', 'ERR_NETWORK'))

    expect(err.status).toBe(0)
    expect(err.code).toBe('NETWORK')
    expect(err.isNetwork).toBe(true)
  })

  it('classifies non-HTTP exceptions as CLIENT (never retriable)', () => {
    const err = toApiError(new TypeError('Cannot read properties of undefined'))

    expect(err.code).toBe('CLIENT')
    expect(err.isNetwork).toBe(false)
  })

  it('classifies aborted requests as CANCELED', () => {
    const err = toApiError(new CanceledError())

    expect(err.code).toBe('CANCELED')
    expect(err.isNetwork).toBe(false)
  })

  it('treats a 5xx without envelope as INTERNAL_ERROR', () => {
    const err = toApiError(axiosErr(502, '<html>Bad gateway</html>'))

    expect(err.code).toBe('INTERNAL_ERROR')
    expect(err.isNetwork).toBe(false)
  })

  it('flags 409 CONFLICT retry', () => {
    const err = toApiError(axiosErr(409, { error: { code: 'CONFLICT', message: 'm', details: [{ code: 'retry', message: 'm' }] } }))

    expect(err.isConflictRetry).toBe(true)
  })

  it('is idempotent on ApiError', () => {
    const a = new ApiError({ status: 404, code: 'NOT_FOUND', message: 'm' })

    expect(toApiError(a)).toBe(a)
  })
})
