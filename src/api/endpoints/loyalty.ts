// Counter operations (guide §4.B). The four writes carry an Idempotency-Key:
// call them through `withIdempotency(key => stamp(businessId, body, key))` so every retry
// of one logical attempt reuses the same key and the exact same body.
import { request, unwrap } from '../client'
import type { CounterEnroll, StampRequest, components } from '../types'

type S = components['schemas']

const idem = (key: string) => ({ 'Idempotency-Key': key })

export const stamp = (businessId: string, body: StampRequest, key: string) =>
  request('post', '/v1/businesses/{businessId}/stamps', { path: { businessId }, body, headers: idem(key) }).then(unwrap)

export const enrollCustomer = (businessId: string, body: CounterEnroll, key: string) =>
  request('post', '/v1/businesses/{businessId}/customers', { path: { businessId }, body, headers: idem(key) }).then(unwrap)

/** Without body = redeem from the pending list (no code). */
export const redeemCycle = (businessId: string, cycleId: string, key: string, body?: S['RedeemRequestDto']) =>
  request('post', '/v1/businesses/{businessId}/cycles/{cycleId}/redeem', { path: { businessId, cycleId }, body, headers: idem(key) }).then(unwrap)

export const voidEvent = (businessId: string, eventId: string, body: S['VoidRequestDto'], key: string) =>
  request('post', '/v1/businesses/{businessId}/events/{eventId}/void', { path: { businessId, eventId }, body, headers: idem(key) }).then(unwrap)

export const getCycle = (businessId: string, cycleId: string) =>
  request('get', '/v1/businesses/{businessId}/cycles/{cycleId}', { path: { businessId, cycleId } }).then(unwrap)

export const listPendingRedemptions = (businessId: string, query: { cursor?: string; limit?: number } = {}) =>
  request('get', '/v1/businesses/{businessId}/redemptions/pending', { path: { businessId }, query })
