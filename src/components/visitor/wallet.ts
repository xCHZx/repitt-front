// Presentation helpers for the visitor wallet (guide §4.C.2–§4.C.3).
import type { MeActivityEvent, MeCard } from '@/api/types'

export type WalletEventType = MeActivityEvent['type']

export const EVENT_META: Record<WalletEventType, { label: string; icon: string; color: string }> = {
  stamp: { label: 'Sello', icon: 'tabler-rosette-discount-check', color: 'primary' },
  redeem: { label: 'Canje', icon: 'tabler-gift', color: 'success' },
  void_stamp: { label: 'Sello anulado', icon: 'tabler-arrow-back-up', color: 'error' },
  void_redeem: { label: 'Canje anulado', icon: 'tabler-arrow-back-up', color: 'error' },
}

export const DEFAULT_ACCENT = '#6C3CE1'

export const accentOf = (color?: string | null) => color || DEFAULT_ACCENT

export const initialOf = (name?: string | null) => String(name || 'R').charAt(0).toUpperCase()

type CardLike = Pick<MeCard, 'card' | 'cycle'>

/** Stamps required by the cycle (snapshot at its start), falling back to the card rule. */
export const requiredOf = (item: CardLike) => item.cycle.requiredStamps || item.card.requiredStamps

export const progressOf = (item: CardLike) => {
  const required = requiredOf(item)

  return required > 0 ? Math.min(item.cycle.stampsCount / required, 1) : 0
}

export const stampsLeftOf = (item: CardLike) => Math.max(requiredOf(item) - item.cycle.stampsCount, 0)

/** Completed cycle = reward ready to redeem. */
export const isRedeemable = (item: CardLike) => item.cycle.status === 'completed'

export function walletGroups(items: MeCard[]) {
  return {
    redeemable: items.filter(isRedeemable),

    // Open cycles first (closest to the reward on top); already-redeemed cycles go last.
    inProgress: items
      .filter(i => i.card.isActive && !isRedeemable(i))
      .sort((a, b) => {
        const aOpen = a.cycle.status === 'open' ? 0 : 1
        const bOpen = b.cycle.status === 'open' ? 0 : 1

        return aOpen - bOpen || progressOf(b) - progressOf(a)
      }),
    inactive: items.filter(i => !i.card.isActive && !isRedeemable(i)),
  }
}

/** The active, not-yet-redeemed card closest to its reward. */
export function nearestCard(items: MeCard[]): MeCard | null {
  const open = items.filter(i => i.card.isActive && i.cycle.status === 'open')
  if (!open.length)
    return null

  return [...open].sort((a, b) => progressOf(b) - progressOf(a))[0]
}

/** A business I can leave (GET /v1/me/businesses row or a cashier membership). */
export interface RevokeTarget {
  businessId: string
  name: string

  /** Known only for businesses listed by GET /v1/me/businesses; used to cross the wallet. */
  repittCode: string | null
  isCashier: boolean
}

/** `ABCD2345` →`ABCD 2345` (display only; codes are always sent without separators). */
export const formatRepittCode = (code?: string | null) =>
  code ? code.replace(/(.{4})(?=.)/g, '$1 ') : '—'
