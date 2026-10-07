import { describe, expect, it } from 'vitest'
import { ApiError } from '../errors'
import { describeError, errorMessage } from '../messages'

const err = (init: ConstructorParameters<typeof ApiError>[0]) => new ApiError(init)

describe('error catalog', () => {
  it('shows the backend message by default', () => {
    expect(errorMessage(err({ status: 409, code: 'PHONE_TAKEN', message: 'Ese teléfono ya está registrado' }))).toBe('Ese teléfono ya está registrado')
  })

  it('prefers detail-code texts (409 CONFLICT details)', () => {
    expect(errorMessage(err({ status: 409, code: 'CONFLICT', message: 'x', detailCode: 'noPublishedCard' }))).toBe('Publica una tarjeta primero.')
  })

  it('prefers the detail message over the generic CONFLICT message', () => {
    expect(errorMessage(err({ status: 409, code: 'CONFLICT', message: 'El recurso entra en conflicto con el estado actual', detailCode: 'someNewCode', detailMessage: 'Texto útil' }))).toBe('Texto útil')
    expect(errorMessage(err({ status: 400, code: 'VALIDATION_FAILED', message: 'Datos inválidos', detailCode: 'maxLength', detailMessage: 'Muy largo' }))).toBe('Datos inválidos')
  })

  it('hides front bugs behind a generic text', () => {
    expect(errorMessage(err({ status: 409, code: 'IDEMPOTENCY_MISMATCH', message: 'raw' }))).not.toContain('raw')
  })

  it('formats rate limits with the Retry-After wait', () => {
    expect(errorMessage(err({ status: 429, code: 'RATE_LIMITED', message: 'x', retryAfterMs: 30_000 }))).toContain('30 s')
    expect(errorMessage(err({ status: 429, code: 'RATE_LIMITED', message: 'x', retryAfterMs: 600_000 }))).toContain('10 min')
  })

  it('describes errors with request id and field errors', () => {
    const d = describeError(err({ status: 400, code: 'VALIDATION_FAILED', message: 'Datos inválidos', requestId: 'r9', fieldErrors: { name: 'Requerido' } }))

    expect(d).toMatchObject({ message: 'Datos inválidos', requestId: 'r9', fieldErrors: { name: 'Requerido' } })
  })
})
