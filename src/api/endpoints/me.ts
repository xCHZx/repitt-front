// /v1/me/* (guide §2.12, §4.C)
import { request, unwrap } from '../client'
import type { components } from '../types'

type S = components['schemas']

export const getMe = () =>
  request('get', '/v1/me').then(unwrap)

/** Names (any session) and email (reauth, §2.9). `phone` is not accepted here. */
export const updateMe = (body: S['MeUpdateDto']) =>
  request('patch', '/v1/me', { body }).then(unwrap)

/** 401 INVALID_CREDENTIALS here is a field error (current password), never a session problem. */
export const changePassword = (body: S['PasswordChangeDto']) =>
  request('post', '/v1/me/password', { body })

// Phone change: code goes to the NEW number; `409 retry` on verify restarts from request (§2.13)
export const phoneChangeRequest = (body: S['PhoneChangeRequestDto']) =>
  request('post', '/v1/me/phone/request', { body }).then(unwrap)

export const phoneChangeVerify = (body: S['ChallengeVerifyDto']) =>
  request('post', '/v1/me/phone/verify', { body, meta: { noConflictRetry: true } }).then(unwrap)

/** Requires a reauthenticated session: step up BEFORE calling (a 403 counts toward 3/h, §4.C.6). */
export const exportMyData = () =>
  request('get', '/v1/me/export').then(unwrap)

/** Account deletion: body must be `{}` (§4.C.7). On 204 drop tokens and go home; do not call logout/refresh. */
export const deleteAccount = () =>
  request('delete', '/v1/me', { body: {} })

// Wallet (§4.C.2) and activity (§4.C.3)
export const listMyCards = () =>
  request('get', '/v1/me/cards').then(unwrap)

export const getMyCard = (cycleId: string) =>
  request('get', '/v1/me/cards/{cycleId}', { path: { cycleId } }).then(unwrap)

export const listMyActivity = (query: { cursor?: string; limit?: number } = {}) =>
  request('get', '/v1/me/activity', { query })

// Businesses holding my data (§4.C.4)
export const listMyBusinesses = () =>
  request('get', '/v1/me/businesses').then(unwrap)

export const revokeMyBusiness = (businessId: string) =>
  request('delete', '/v1/me/businesses/{businessId}', { path: { businessId } })
