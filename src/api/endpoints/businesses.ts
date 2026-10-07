// /v1/businesses (guide §3, §4.A.1–§4.A.3, §4.A.6)
import { request, unwrap } from '../client'
import type { components } from '../types'

type S = components['schemas']

export const listBusinesses = () =>
  request('get', '/v1/businesses').then(unwrap)

export const getBusiness = (businessId: string) =>
  request('get', '/v1/businesses/{businessId}', { path: { businessId } }).then(unwrap)

export const createBusiness = (body: S['BusinessCreateDto']) =>
  request('post', '/v1/businesses', { body }).then(unwrap)

export const updateBusiness = (businessId: string, body: S['BusinessUpdateDto']) =>
  request('patch', '/v1/businesses/{businessId}', { path: { businessId }, body }).then(unwrap)

export const publishBusiness = (businessId: string) =>
  request('post', '/v1/businesses/{businessId}/publish', { path: { businessId } }).then(unwrap)

export const unpublishBusiness = (businessId: string) =>
  request('post', '/v1/businesses/{businessId}/unpublish', { path: { businessId } }).then(unwrap)

/** PNG/JPEG/WebP ≤ 2 MiB, single field `file`. Returns BusinessAssetsDto (not the business). */
export const uploadBusinessLogo = (businessId: string, file: File | Blob) => {
  const body = new FormData()

  body.append('file', file)

  return request('post', '/v1/businesses/{businessId}/logo', { path: { businessId }, body }).then(unwrap)
}

export const getBusinessAssets = (businessId: string) =>
  request('get', '/v1/businesses/{businessId}/assets', { path: { businessId } }).then(unwrap)

export const regenerateBusinessAssets = (businessId: string) =>
  request('post', '/v1/businesses/{businessId}/assets/regenerate', { path: { businessId } }).then(unwrap)

// Cashiers (§4.A.6)
export const listMembers = (businessId: string) =>
  request('get', '/v1/businesses/{businessId}/members', { path: { businessId } }).then(unwrap)

export const createMember = (businessId: string, body: S['MemberCreateDto']) =>
  request('post', '/v1/businesses/{businessId}/members', { path: { businessId }, body }).then(unwrap)

export const removeMember = (businessId: string, memberId: string) =>
  request('delete', '/v1/businesses/{businessId}/members/{memberId}', { path: { businessId, memberId } })
