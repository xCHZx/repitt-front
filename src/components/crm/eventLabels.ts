// Labels and helpers for the owner event log (guide §4.A.8).
import type { LoyaltyEvent, LoyaltyEventType } from '@/api/types'

/** `customer.id` of a customer who deleted their data from the business (§4.A.8). */
export const DELETED_CUSTOMER_ID = '00000000-0000-0000-0000-000000000000'

const UUID = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i

export const isUuid = (value: unknown): value is string => typeof value === 'string' && UUID.test(value)

interface EventTypeMeta {
  label: string
  icon: string
  color: string
}

export const EVENT_TYPES: Record<LoyaltyEventType, EventTypeMeta> = {
  stamp: { label: 'Sello', icon: 'tabler-sticker', color: 'primary' },
  redeem: { label: 'Canje', icon: 'tabler-gift', color: 'success' },
  void_stamp: { label: 'Sello anulado', icon: 'tabler-arrow-back-up', color: 'error' },
  void_redeem: { label: 'Canje anulado', icon: 'tabler-arrow-back-up', color: 'error' },
}

export const EVENT_TYPE_OPTIONS = (Object.keys(EVENT_TYPES) as LoyaltyEventType[])
  .map(value => ({ value, title: EVENT_TYPES[value].label }))

export const isDeletedCustomer = (event: Pick<LoyaltyEvent, 'customer'>) =>
  event.customer.id === DELETED_CUSTOMER_ID

/** Who registered the event: «Tú», «Soporte Repitt» (support correction) or the staff name. */
export function actorLabel(actor: LoyaltyEvent['actor']): string {
  if (actor.role === 'admin' || ((!actor.id || actor.id === DELETED_CUSTOMER_ID) && !actor.displayName))
    return 'Soporte Repitt'
  if (actor.isSelf)
    return 'Tú'

  return actor.displayName ?? 'Personal del negocio'
}

/** Event log filters as edited in the UI (`from`/`to` are `YYYY-MM-DD`, '' = none). */
export interface EventFilterValue {
  type: LoyaltyEventType | null
  cardId: string | null
  from: string
  to: string
}

export interface CardOption {
  value: string
  title: string
}
