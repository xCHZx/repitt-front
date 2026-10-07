// Shared helpers for the counter screens (guide §4.B): QR / manual code parsing, card
// availability and the counter-specific error texts on top of the §5 catalog.
import { ApiError, toApiError } from '@/api/errors'
import { describeError, reportUnexpected } from '@/api/messages'
import type { DescribedError } from '@/api/messages'
import type { BusinessRole, Cycle, LoyaltyEventType, StampCard, components } from '@/api/types'
import { formatDateTime, formatTime, todayInZone } from '@/utils/dates'
import { paywallMessage } from '@/utils/entitlement'

export const DEFAULT_CARD_COLOR = '#6C3CE1'

/** Data of the fullscreen confirmation after a stamp / counter enroll. */
export interface CounterSuccessInfo {
  title: string
  subtitle?: string
  customerName: string
  cardName?: string
  stampsCount?: number
  requiredStamps?: number
  isTest?: boolean
}

/** What the redeem dialog shows without loading the cycle (when the caller already knows it). */
export interface RedeemSummary {
  customerName: string
  cardName: string
  reward: string
  isTest?: boolean
}

type Schemas = components['schemas']

/** Summary for the redeem dialog from a PendingRedemption, a CycleDetail or a StampResult. */
export function redeemSummaryOf(src: { customer: Schemas['CustomerRefDto']; card: Schemas['CardRefDto']; cycle: Pick<Cycle, 'isTest'> }): RedeemSummary {
  return {
    customerName: src.customer.displayName,
    cardName: src.card.name,
    reward: src.card.reward,
    isTest: src.cycle.isTest,
  }
}

/** repittCode alphabet (§1.3): 8 chars, no 0/O/1/I. */
const USER_CODE = /^[A-HJ-NP-Z2-9]{8}$/

export type ScannedCode =
  | { kind: 'card'; code: string } // repitt:c:<user>:<card> → the card comes in the code
  | { kind: 'user'; code: string } // repitt:u:<user> → the cashier picks the card
  | { kind: 'invalid'; error: ApiError } // anything else (business QR, random text)

/** Manual capture: strip spaces / dashes, uppercase. Returns the 8-char code or null. */
export function normalizeUserCode(input: string): string | null {
  const clean = input.replace(/[\s-]+/g, '').toUpperCase()

  return USER_CODE.test(clean) ? clean : null
}

function localInvalidQr(detailCode: 'invalidFormat' | 'businessQr') {
  return new ApiError({ status: 400, code: 'INVALID_QR', message: 'El código no es válido.', detailCode })
}

/** Classify a scanned QR (raw text) or a typed code. Never sends dashes (V2 format). */
export function parseCounterCode(raw: string): ScannedCode {
  const text = raw.trim()

  if (/^repitt:c:/i.test(text))
    return { kind: 'card', code: text }
  if (/^repitt:u:/i.test(text))
    return { kind: 'user', code: text }

  const userCode = normalizeUserCode(text)
  if (userCode)
    return { kind: 'user', code: `repitt:u:${userCode}` }

  // The business QR is a URL ending in /n/<repittCode>
  if (/^https?:\/\//i.test(text) && /\/n\/[a-z\d]{8}\/?(?:[?#].*)?$/i.test(text))
    return { kind: 'invalid', error: localInvalidQr('businessQr') }

  return { kind: 'invalid', error: localInvalidQr('invalidFormat') }
}

export interface CardAvailability {
  stampable: boolean

  /** Why it cannot be stamped (shown under the card name). */
  reason?: string
}

/** §4.B.1: expired cards and cards starting after today (business zone) cannot be stamped. */
export function cardAvailability(card: StampCard, timeZone: string, today: string = todayInZone(timeZone)): CardAvailability {
  if (card.isExpired)
    return { stampable: false, reason: 'Vencida' }
  if (card.startsOn > today)
    return { stampable: false, reason: 'Aún no empieza' }

  return { stampable: true }
}

export type CounterOperation = 'stamp' | 'enroll' | 'redeem' | 'void'

const STAMP_RULE_CODES = new Set(['CARD_NOT_ACTIVE', 'CARD_EXPIRED', 'CARD_NOT_STARTED', 'COOLDOWN_ACTIVE', 'MIN_INTERVAL', 'REWARD_PENDING', 'MAX_CYCLES_REACHED'])

/** Errors of the stamp part of an enroll-with-card: the enroll is reverted, offer "registrar sin sellar". */
export function isStampPartError(err: ApiError) {
  return STAMP_RULE_CODES.has(err.code)
}

function retryAtText(retryAt: string | undefined, timeZone: string) {
  if (!retryAt)
    return 'Espera un poco para volver a sellar a este cliente.'
  const sameDay = todayInZone(timeZone, new Date(retryAt)) === todayInZone(timeZone)
  const when = sameDay ? `a las ${formatTime(retryAt, timeZone)}` : `el ${formatDateTime(retryAt, timeZone)}`

  return `Espera para volver a sellar: este cliente podrá recibir otro sello ${when}.`
}

const NOT_FOUND_TEXT: Record<CounterOperation, string> = {
  stamp: 'Esa tarjeta ya no está disponible. Actualizamos la lista de tarjetas.',
  enroll: 'Esa tarjeta ya no está disponible. Actualizamos la lista de tarjetas.',
  redeem: 'Esta recompensa ya no está disponible.',
  void: 'Este movimiento ya no está disponible.',
}

const FIXED_TEXT: Partial<Record<string, string>> = {
  ALREADY_REDEEMED: 'Esta recompensa ya se canjeó.',
  NOT_COMPLETED: 'Este ciclo todavía no está completo.',
  ALREADY_VOIDED: 'Este movimiento ya se anuló.',
}

interface CounterErrorContext {
  op: CounterOperation
  role: BusinessRole | null | undefined
  timeZone: string
}

function counterMessage(err: ApiError, baseMessage: string, ctx: CounterErrorContext): string {
  if (err.code === 'ENTITLEMENT_REQUIRED')
    return paywallMessage(err.detailObj?.reason, ctx.role)
  if (err.code === 'MIN_INTERVAL' || err.code === 'COOLDOWN_ACTIVE')
    return retryAtText(err.detailObj?.retryAt, ctx.timeZone)
  if (err.code === 'VALIDATION_FAILED' && err.detailCode && ['exactlyOne', 'required', 'cardMismatch'].includes(err.detailCode))
    return Object.values(err.fieldErrors)[0] || err.message
  if (err.code === 'CUSTOMER_NOT_FOUND') {
    return ctx.op === 'enroll'
      ? 'La cuenta de ese teléfono no está disponible; no se puede registrar.'
      : 'No encontramos a ese cliente en tu negocio. Puedes registrarlo aquí mismo.'
  }
  if (err.code === 'NOT_FOUND')
    return NOT_FOUND_TEXT[ctx.op]
  if (err.code === 'RATE_LIMITED' && ctx.op === 'enroll')
    return `${baseMessage} Si el cliente ya está registrado, séllalo con su QR o su teléfono.`

  return FIXED_TEXT[err.code] ?? baseMessage
}

/**
 * describeError() + the counter texts of §4.B (paywall by role, retryAt in the business zone,
 * field messages of the stamp validation).
 */
export function describeCounterError(e: unknown, ctx: CounterErrorContext): DescribedError {
  reportUnexpected(e)

  const err = toApiError(e)
  const base = describeError(err)

  return { ...base, message: counterMessage(err, base.message, ctx) }
}

export const EVENT_LABELS: Record<LoyaltyEventType, string> = {
  stamp: 'Sello',
  redeem: 'Canje',
  void_stamp: 'Sello anulado',
  void_redeem: 'Canje anulado',
}

export const EVENT_ICONS: Record<LoyaltyEventType, string> = {
  stamp: 'tabler-rosette-discount-check',
  redeem: 'tabler-gift',
  void_stamp: 'tabler-arrow-back-up',
  void_redeem: 'tabler-arrow-back-up',
}

export const CYCLE_STATUS: Record<'open' | 'completed' | 'redeemed', { label: string; color: string }> = {
  open: { label: 'En curso', color: 'primary' },
  completed: { label: 'Recompensa pendiente', color: 'warning' },
  redeemed: { label: 'Canjeado', color: 'success' },
}
