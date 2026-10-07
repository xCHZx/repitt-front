// Billing (guide §4.A.10). Owner `pwd`; never 402. Paywall comes from `entitlement`, not `subscription`.
import { request, unwrap } from '../client'

export const getBilling = (businessId: string) =>
  request('get', '/v1/businesses/{businessId}/billing', { path: { businessId } }).then(unwrap)

/** Navigate to `url` right away with `location.assign`; never store it. */
export const createCheckout = (businessId: string) =>
  request('post', '/v1/businesses/{businessId}/billing/checkout', { path: { businessId } }).then(unwrap)

/** Requires password reauth (handled by the interceptor + dialog). */
export const createPortal = (businessId: string) =>
  request('post', '/v1/businesses/{businessId}/billing/portal', { path: { businessId } }).then(unwrap)
