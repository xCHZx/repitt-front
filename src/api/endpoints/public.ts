// /v1/public/* — no session required
import { request, unwrap } from '../client'

export const listCategories = () =>
  request('get', '/v1/public/categories').then(unwrap)

/** 404 = not available (unpublished, suspended, archived or old code): never redirect to login. */
export const getPublicBusiness = (repittCode: string) =>
  request('get', '/v1/public/businesses/{repittCode}', { path: { repittCode } }).then(unwrap)

export const getPrivacyNotice = (kind: 'full' | 'short' = 'full') =>
  request('get', '/v1/public/privacy-notice', { query: { kind } }).then(unwrap)
