// CRM, event log and metrics (guide §4.A.7–§4.A.9). Owner `pwd` routes.
import { request, unwrap } from '../client'
import type { LoyaltyEventType, MetricsPeriod } from '../types'

export interface CustomerListQuery {
  q?: string
  cursor?: string
  limit?: number
  includeTest?: boolean
}

export const listCustomers = (businessId: string, query: CustomerListQuery = {}) =>
  request('get', '/v1/businesses/{businessId}/customers', { path: { businessId }, query })

export const getCustomer = (businessId: string, customerId: string) =>
  request('get', '/v1/businesses/{businessId}/customers/{customerId}', { path: { businessId, customerId } }).then(unwrap)

export const renameCustomer = (businessId: string, customerId: string, displayName: string) =>
  request('patch', '/v1/businesses/{businessId}/customers/{customerId}', { path: { businessId, customerId }, body: { displayName } }).then(unwrap)

export interface EventListQuery {
  type?: LoyaltyEventType
  cardId?: string
  customerId?: string
  from?: string
  to?: string
  cursor?: string
  limit?: number
}

export const listEvents = (businessId: string, query: EventListQuery = {}) =>
  request('get', '/v1/businesses/{businessId}/events', { path: { businessId }, query })

export const getMetrics = (businessId: string, query: { period: MetricsPeriod; from?: string; to?: string }, signal?: AbortSignal) =>
  request('get', '/v1/businesses/{businessId}/metrics', { path: { businessId }, query, signal }).then(unwrap)
