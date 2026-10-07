import axios, { AxiosError } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { businessIdOfUrl, configureApiClient, http, request } from '../client'
import type { ApiClientHooks } from '../client'
import { createBusiness } from '../endpoints/businesses'
import * as loyalty from '../endpoints/loyalty'
import * as me from '../endpoints/me'
import { withIdempotency } from '../idempotency'
import { errorBody, fakeAdapter } from './helpers'
import type { FakeReply } from './helpers'

const meBody = { data: { id: 'u1', firstName: 'Ana' } }

let token: string | null
let hooks: { [K in keyof ApiClientHooks]: ReturnType<typeof vi.fn> }

function useApi(reply: (cfg: InternalAxiosRequestConfig, n: number) => FakeReply | Error) {
  const fake = fakeAdapter(reply)

  http.defaults.adapter = fake.adapter

  return fake.calls
}

function useRefresh(reply: (cfg: InternalAxiosRequestConfig, n: number) => FakeReply | Error) {
  const fake = fakeAdapter(reply)

  axios.defaults.adapter = fake.adapter

  return fake.calls
}

beforeEach(() => {
  token = 'old-token'
  hooks = {
    getAccessToken: vi.fn(() => token),
    setAccessToken: vi.fn((t: { accessToken: string }) => {
      token = t.accessToken
    }),
    onSessionEnded: vi.fn(),
    onAccountSuspended: vi.fn(),
    requestReauth: vi.fn(async () => true),
    canStepUpWithPassword: vi.fn(() => true),
  }
  configureApiClient(hooks as unknown as ApiClientHooks)
})

describe('request()', () => {
  it('builds the url under the /v1 base, sends the bearer and cookies, returns the envelope', async () => {
    const calls = useApi(() => ({ status: 200, data: meBody }))

    await expect(me.getMe()).resolves.toEqual(meBody.data)
    expect(calls[0].url).toBe('/me')
    expect(calls[0].headers.Authorization).toBe('Bearer old-token')
    expect(http.defaults.baseURL).toBe('http://api.test/v1')
    expect(http.defaults.withCredentials).toBe(true)
  })

  it('encodes path params and resolves 204 to undefined', async () => {
    const calls = useApi(() => ({ status: 204 }))

    await expect(request('delete', '/v1/businesses/{businessId}/members/{memberId}', { path: { businessId: 'b 1', memberId: 'm/2' } })).resolves.toBeUndefined()
    expect(calls[0].url).toBe('/businesses/b%201/members/m%2F2')
  })

  it('sends DELETE /v1/me with an empty JSON object body', async () => {
    const calls = useApi(() => ({ status: 204 }))

    await me.deleteAccount()
    expect(calls[0].data).toBe('{}')
  })

  it('sends body-less routes without body and without Content-Type (§1.7)', async () => {
    const calls = useApi(() => ({ status: 204 }))

    await request('post', '/v1/auth/logout')
    expect(calls[0].data).toBeUndefined()
    expect(calls[0].headers['Content-Type']).toBeUndefined()
  })

  it('omits the Authorization header without a session', async () => {
    token = null

    const calls = useApi(() => ({ status: 200, data: { data: [] } }))

    await request('get', '/v1/public/categories')
    expect(calls[0].headers.Authorization).toBeUndefined()
  })
})

describe('refresh on TOKEN_EXPIRED', () => {
  it('refreshes once and retries with the new token', async () => {
    const calls = useApi((cfg, n) => n === 0 ? { status: 401, data: errorBody('TOKEN_EXPIRED') } : { status: 200, data: meBody })
    const refreshCalls = useRefresh(() => ({ status: 200, data: { data: { accessToken: 'new-token', expiresIn: 900, amr: 'pwd' } } }))

    await expect(me.getMe()).resolves.toEqual(meBody.data)
    expect(refreshCalls).toHaveLength(1)
    expect(refreshCalls[0].url).toBe('http://api.test/v1/auth/refresh')
    expect(refreshCalls[0].data).toBeUndefined()
    expect(hooks.setAccessToken).toHaveBeenCalledWith({ accessToken: 'new-token', expiresIn: 900, amr: 'pwd' })
    expect(calls[1].headers.Authorization).toBe('Bearer new-token')
  })

  it('shares a single refresh between concurrent requests', async () => {
    useApi(cfg => String(cfg.headers.Authorization) === 'Bearer old-token'
      ? { status: 401, data: errorBody('TOKEN_EXPIRED') }
      : { status: 200, data: meBody })

    let resolveRefresh!: () => void

    const gate = new Promise<void>(resolve => {
      resolveRefresh = resolve
    })

    const refreshCalls: number[] = []

    axios.defaults.adapter = async cfg => {
      refreshCalls.push(1)
      await gate

      return { status: 200, statusText: '', headers: {}, config: cfg, data: { data: { accessToken: 'new-token', expiresIn: 900, amr: 'pwd' } } }
    }

    const all = Promise.all([me.getMe(), me.getMe(), me.getMe()])

    await new Promise(resolve => setTimeout(resolve, 10))
    resolveRefresh()

    await expect(all).resolves.toHaveLength(3)
    expect(refreshCalls).toHaveLength(1)
  })

  it('retries the refresh once after 409 (another tab rotating)', async () => {
    useApi((cfg, n) => n === 0 ? { status: 401, data: errorBody('TOKEN_EXPIRED') } : { status: 200, data: meBody })

    const refreshCalls = useRefresh((cfg, n) => n === 0
      ? { status: 409, data: errorBody('CONFLICT') }
      : { status: 200, data: { data: { accessToken: 'new-token', expiresIn: 900, amr: 'otp' } } })

    await expect(me.getMe()).resolves.toEqual(meBody.data)
    expect(refreshCalls).toHaveLength(2)
  })

  it('ends the session when the refresh fails and rethrows the original error', async () => {
    useApi(() => ({ status: 401, data: errorBody('TOKEN_EXPIRED') }))
    useRefresh(() => ({ status: 401, data: errorBody('SESSION_REVOKED') }))

    await expect(me.getMe()).rejects.toMatchObject({ code: 'TOKEN_EXPIRED' })
    expect(hooks.onSessionEnded).toHaveBeenCalledTimes(1)
  })

  it('never refreshes on INVALID_CREDENTIALS', async () => {
    useApi(() => ({ status: 401, data: errorBody('INVALID_CREDENTIALS') }))

    const refreshCalls = useRefresh(() => ({ status: 200, data: {} }))

    await expect(me.changePassword({ currentPassword: 'a', newPassword: 'b' })).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' })
    expect(refreshCalls).toHaveLength(0)
    expect(hooks.onSessionEnded).not.toHaveBeenCalled()
  })
})

describe('session end and suspension', () => {
  it('SESSION_REVOKED on an authenticated request ends the session', async () => {
    useApi(() => ({ status: 401, data: errorBody('SESSION_REVOKED') }))

    await expect(me.getMe()).rejects.toMatchObject({ code: 'SESSION_REVOKED' })
    expect(hooks.onSessionEnded).toHaveBeenCalled()
  })

  it('ACCOUNT_SUSPENDED goes to the suspended screen', async () => {
    useApi(() => ({ status: 403, data: errorBody('ACCOUNT_SUSPENDED') }))

    await expect(me.getMe()).rejects.toMatchObject({ code: 'ACCOUNT_SUSPENDED' })
    expect(hooks.onAccountSuspended).toHaveBeenCalled()
  })
})

describe('step-up and reauthentication', () => {
  it('REAUTH_REQUIRED asks for the given method and retries with the same Idempotency-Key and body', async () => {
    const calls = useApi((cfg, n) => n === 0
      ? { status: 403, data: errorBody('REAUTH_REQUIRED', { details: { method: 'otp' } }) }
      : { status: 200, data: { data: { event: { id: 'e2' } } } })

    await withIdempotency(key => loyalty.voidEvent('b1', 'e1', { reason: 'Sello por error' }, key))

    expect(hooks.requestReauth).toHaveBeenCalledWith('otp')
    expect(calls).toHaveLength(2)
    expect(calls[1].headers['Idempotency-Key']).toBe(calls[0].headers['Idempotency-Key'])
    expect(calls[1].data).toBe(calls[0].data)
  })

  it('PASSWORD_REQUIRED opens the password step-up only when allowed', async () => {
    hooks.canStepUpWithPassword.mockReturnValue(false)
    useApi(() => ({ status: 403, data: errorBody('PASSWORD_REQUIRED') }))

    await expect(request('get', '/v1/businesses/{businessId}/members', { path: { businessId: 'b1' } })).rejects.toMatchObject({ code: 'PASSWORD_REQUIRED' })
    expect(hooks.requestReauth).not.toHaveBeenCalled()
  })

  it('PASSWORD_REQUIRED asks about the business of the request, not the active one', async () => {
    useApi(() => ({ status: 403, data: errorBody('PASSWORD_REQUIRED') }))
    hooks.requestReauth.mockResolvedValue(false)

    await expect(request('get', '/v1/businesses/{businessId}/members', { path: { businessId: 'b1' } })).rejects.toMatchObject({ code: 'PASSWORD_REQUIRED' })
    expect(hooks.canStepUpWithPassword).toHaveBeenLastCalledWith('b1')
  })

  it('PASSWORD_REQUIRED on POST /v1/businesses (no business) offers the step-up and retries', async () => {
    const calls = useApi((cfg, n) => n === 0
      ? { status: 403, data: errorBody('PASSWORD_REQUIRED') }
      : { status: 201, data: { data: { id: 'b2' } } })

    await expect(createBusiness({ name: 'Café' } as Parameters<typeof createBusiness>[0])).resolves.toEqual({ id: 'b2' })
    expect(hooks.canStepUpWithPassword).toHaveBeenCalledWith(null)
    expect(hooks.requestReauth).toHaveBeenCalledWith('password')
    expect(calls).toHaveLength(2)
  })

  it('businessIdOfUrl reads the business from /businesses/{id} routes only', () => {
    expect(businessIdOfUrl('/businesses/b%201/members')).toBe('b 1')
    expect(businessIdOfUrl('/businesses/b1')).toBe('b1')
    expect(businessIdOfUrl('/businesses')).toBeNull()
    expect(businessIdOfUrl('/me/password')).toBeNull()
    expect(businessIdOfUrl(undefined)).toBeNull()
  })

  it('a cancelled dialog rejects with the original error', async () => {
    hooks.requestReauth.mockResolvedValue(false)
    useApi(() => ({ status: 403, data: errorBody('PASSWORD_REQUIRED') }))

    await expect(request('get', '/v1/businesses/{businessId}/members', { path: { businessId: 'b1' } })).rejects.toMatchObject({ code: 'PASSWORD_REQUIRED' })
    expect(hooks.requestReauth).toHaveBeenCalledWith('password')
  })
})

describe('counter writes: timeout and gateway errors (§1.8)', () => {
  it('counter writes carry a timeout and a timed-out write is retried with the same Idempotency-Key', async () => {
    vi.useFakeTimers()

    const timeouts: (number | undefined)[] = []

    const calls = useApi((cfg, n) => {
      timeouts.push(cfg.timeout)
      if (n === 0)
        throw new AxiosError(`timeout of ${cfg.timeout}ms exceeded`, 'ECONNABORTED', cfg)

      return { status: 201, data: { data: { event: { id: 'e1' } } } }
    })

    const p = withIdempotency(key => loyalty.stamp('b1', { cardId: 'c1', code: 'repitt:u:ABC123' }, key))

    await vi.runAllTimersAsync()
    await expect(p).resolves.toBeDefined()
    expect(calls).toHaveLength(2)
    expect(timeouts).toEqual([loyalty.COUNTER_WRITE_TIMEOUT_MS, loyalty.COUNTER_WRITE_TIMEOUT_MS])
    expect(calls[1].headers['Idempotency-Key']).toBe(calls[0].headers['Idempotency-Key'])

    vi.useRealTimers()
  })

  it('a bare 504 from the gateway is retried with the same Idempotency-Key', async () => {
    vi.useFakeTimers()

    const calls = useApi((cfg, n) => n === 0
      ? { status: 504, data: '<html>Gateway Timeout</html>' }
      : { status: 200, data: { data: { event: { id: 'e2' } } } })

    const p = withIdempotency(key => loyalty.voidEvent('b1', 'e1', { reason: 'Sello por error' }, key))

    await vi.runAllTimersAsync()
    await expect(p).resolves.toBeDefined()
    expect(calls).toHaveLength(2)
    expect(calls[1].headers['Idempotency-Key']).toBe(calls[0].headers['Idempotency-Key'])

    vi.useRealTimers()
  })

  it('reads without an explicit timeout keep axios default (none)', async () => {
    let timeout: number | undefined

    useApi(cfg => {
      timeout = cfg.timeout

      return { status: 200, data: meBody }
    })

    await me.getMe()
    expect(timeout).toBe(0)
  })
})

describe('409 CONFLICT retry', () => {
  const conflict = { status: 409, data: errorBody('CONFLICT', { details: [{ code: 'retry', message: 'm' }] }) }

  it('retries the same request once', async () => {
    const calls = useApi((cfg, n) => n === 0 ? conflict : { status: 200, data: meBody })

    await expect(me.updateMe({ firstName: 'Ana' })).resolves.toEqual(meBody.data)
    expect(calls).toHaveLength(2)
  })

  it('does not auto-retry OTP verify flows (they restart from the code request)', async () => {
    const calls = useApi(() => conflict)

    await expect(me.phoneChangeVerify({ challengeId: 'c', code: '123456' })).rejects.toMatchObject({ code: 'CONFLICT', detailCode: 'retry' })
    expect(calls).toHaveLength(1)
  })
})
