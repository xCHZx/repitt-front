// /v1/businesses/{businessId}/cards (guide §4.A.5, §4.B.1)
import { request, unwrap } from '../client'
import type { StampCardCreate, StampCardStatus, StampCardUpdate } from '../types'

/** Without status: non-archived cards (draft, published, paused). `archived`: 100 most recent. */
export const listCards = (businessId: string, status?: StampCardStatus) =>
  request('get', '/v1/businesses/{businessId}/cards', { path: { businessId }, query: status ? { status } : undefined }).then(unwrap)

export const getCard = (businessId: string, cardId: string) =>
  request('get', '/v1/businesses/{businessId}/cards/{cardId}', { path: { businessId, cardId } }).then(unwrap)

export const createCard = (businessId: string, body: StampCardCreate) =>
  request('post', '/v1/businesses/{businessId}/cards', { path: { businessId }, body }).then(unwrap)

export const updateCard = (businessId: string, cardId: string, body: StampCardUpdate) =>
  request('patch', '/v1/businesses/{businessId}/cards/{cardId}', { path: { businessId, cardId }, body }).then(unwrap)

/** Only from `draft`; may answer 402; starts the trial the first time (re-read the business after). */
export const publishCard = (businessId: string, cardId: string) =>
  request('post', '/v1/businesses/{businessId}/cards/{cardId}/publish', { path: { businessId, cardId } }).then(unwrap)

export const pauseCard = (businessId: string, cardId: string) =>
  request('post', '/v1/businesses/{businessId}/cards/{cardId}/pause', { path: { businessId, cardId } }).then(unwrap)

export const resumeCard = (businessId: string, cardId: string) =>
  request('post', '/v1/businesses/{businessId}/cards/{cardId}/resume', { path: { businessId, cardId } }).then(unwrap)

export const archiveCard = (businessId: string, cardId: string) =>
  request('post', '/v1/businesses/{businessId}/cards/{cardId}/archive', { path: { businessId, cardId } }).then(unwrap)

/** PNG/JPEG/WebP ≤ 2 MiB, field `file`. */
export const uploadCardIcon = (businessId: string, cardId: string, file: File | Blob) => {
  const body = new FormData()
  body.append('file', file)

  return request('post', '/v1/businesses/{businessId}/cards/{cardId}/icon', { path: { businessId, cardId }, body }).then(unwrap)
}
