// Business form state shared by /empresa/crear and /empresa/editar (guide §4.A.1, §4.A.2).
import type { Business, OpeningHours, OpeningHoursSlot, components } from '@/api/types'
import { DEFAULT_TIMEZONE } from '@/utils/dates'

type S = components['schemas']

export const WEEK_DAYS = [
  { key: 'mon', label: 'Lunes', short: 'Lun' },
  { key: 'tue', label: 'Martes', short: 'Mar' },
  { key: 'wed', label: 'Miércoles', short: 'Mié' },
  { key: 'thu', label: 'Jueves', short: 'Jue' },
  { key: 'fri', label: 'Viernes', short: 'Vie' },
  { key: 'sat', label: 'Sábado', short: 'Sáb' },
  { key: 'sun', label: 'Domingo', short: 'DOM' },
] as const

export type WeekDay = typeof WEEK_DAYS[number]['key']

/** Max slots per day accepted by the API. */
export const MAX_SLOTS_PER_DAY = 4

export interface BusinessFormState {
  name: string
  categoryId: string | null
  timezone: string
  description: string
  address: string
  publicPhone: string
  openingHours: OpeningHours
}

export function emptyBusinessForm(): BusinessFormState {
  return {
    name: '',
    categoryId: null,
    timezone: DEFAULT_TIMEZONE,
    description: '',
    address: '',
    publicPhone: '',
    openingHours: {},
  }
}

function cloneHours(hours: OpeningHours | null | undefined): OpeningHours {
  const out: OpeningHours = {}
  for (const { key } of WEEK_DAYS) {
    const slots = hours?.[key]
    if (slots?.length)
      out[key] = slots.map(s => ({ open: s.open, close: s.close }))
  }

  return out
}

export function businessToForm(b: Business): BusinessFormState {
  return {
    name: b.name,
    categoryId: b.categoryId,
    timezone: b.timezone,
    description: b.description ?? '',
    address: b.address ?? '',
    publicPhone: b.publicPhone ?? '',
    openingHours: cloneHours(b.openingHours),
  }
}

/** Only days with at least one slot; null when every day is closed. */
function normalizedHours(hours: OpeningHours): OpeningHours | null {
  const out = cloneHours(hours)

  return Object.keys(out).length ? out : null
}

const trimmed = (v: string) => v.trim()

export function toCreateBody(form: BusinessFormState): S['BusinessCreateDto'] {
  const body: S['BusinessCreateDto'] = {
    name: trimmed(form.name),
    categoryId: form.categoryId ?? '',
    timezone: form.timezone,
  }

  if (trimmed(form.description))
    body.description = trimmed(form.description)
  if (trimmed(form.address))
    body.address = trimmed(form.address)
  if (trimmed(form.publicPhone))
    body.publicPhone = trimmed(form.publicPhone)

  const hours = normalizedHours(form.openingHours)
  if (hours)
    body.openingHours = hours

  return body
}

/** Full form re-sent on PATCH: empty optional fields are cleared with null (§4.A.2). */
export function toUpdateBody(form: BusinessFormState): S['BusinessUpdateDto'] {
  return {
    name: trimmed(form.name),
    categoryId: form.categoryId ?? undefined,
    timezone: form.timezone,
    description: trimmed(form.description) || null,
    address: trimmed(form.address) || null,
    publicPhone: trimmed(form.publicPhone) || null,
    openingHours: normalizedHours(form.openingHours),
  }
}

export function formatSlots(slots: OpeningHoursSlot[] | undefined): string {
  if (!slots?.length)
    return 'Cerrado'

  return slots.map(s => `${s.open}–${s.close}`).join(', ')
}

const OWNER_HINTS: Record<Business['entitlement']['reason'], { text: string; color: string }> = {
  pre_trial: { text: 'Prueba sin iniciar', color: 'info' },
  trial: { text: 'En prueba', color: 'info' },
  subscribed: { text: 'Suscrito', color: 'success' },
  grace: { text: 'Pago pendiente', color: 'warning' },
  trial_expired: { text: 'Prueba terminada', color: 'error' },
  subscription_ended: { text: 'Suscripción terminada', color: 'error' },
  suspended: { text: 'Suspendido', color: 'error' },
}

/** Short labels for the business selector (guide §3.2). */
export function entitlementHint(b: Business): { text: string; color: string } | null {
  const { allowed, reason } = b.entitlement
  if (b.role === 'cashier')
    return allowed ? null : { text: 'Sin servicio', color: 'error' }

  return OWNER_HINTS[reason] ?? null
}

export const roleLabel = (role: Business['role'] | null | undefined) => role === 'cashier' ? 'Cajero' : 'Dueño'

export const LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp']
export const LOGO_MAX_BYTES = 2 * 1024 * 1024
