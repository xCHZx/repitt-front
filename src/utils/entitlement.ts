// Paywall / banners from `entitlement { allowed, reason, until }` (guide §3.2).
// Never decide access from `isPublished` or `subscription.status`.
import { formatInstant } from './dates'
import type { BusinessRole, Entitlement } from '@/api/types'

export type BannerTone = 'info' | 'warning' | 'error'

export interface EntitlementNotice {
  tone: BannerTone
  text: string

  /** Show the "plans" / billing CTA (owners only). */
  showPlans: boolean

  /** Show the payment-portal CTA (grace period). */
  showPortal: boolean
}

/**
 * Banner for the business layout, or null when nothing must be shown.
 * `timeZone` is the business zone (`until` is an instant).
 */
export function entitlementNotice(
  entitlement: Entitlement | null | undefined,
  role: BusinessRole | null | undefined,
  timeZone?: string,
): EntitlementNotice | null {
  if (!entitlement)
    return null

  const until = formatInstant(entitlement.until, timeZone)
  const isOwner = role === 'owner'

  if (!isOwner) {
    return entitlement.allowed
      ? null
      : { tone: 'warning', text: 'Este negocio no puede registrar sellos por ahora. Avísale al dueño.', showPlans: false, showPortal: false }
  }

  switch (entitlement.reason) {
    case 'pre_trial':
      return { tone: 'info', text: 'Publica tu primera tarjeta para iniciar tu periodo de prueba.', showPlans: false, showPortal: false }
    case 'trial':
      return { tone: 'info', text: `Estás en periodo de prueba hasta el ${until}.`, showPlans: true, showPortal: false }
    case 'subscribed':
      return entitlement.until
        ? { tone: 'info', text: `Tu suscripción termina el ${until}.`, showPlans: false, showPortal: true }
        : null
    case 'grace':
      return { tone: 'warning', text: `No pudimos cobrar tu suscripción. Actualiza tu método de pago antes del ${until}.`, showPlans: false, showPortal: true }
    case 'trial_expired':
      return { tone: 'error', text: 'Tu periodo de prueba terminó. Elige un plan para seguir registrando sellos.', showPlans: true, showPortal: false }
    case 'subscription_ended':
      return { tone: 'error', text: 'Tu suscripción terminó. Elige un plan para seguir registrando sellos.', showPlans: true, showPortal: false }
    case 'suspended':
      return { tone: 'error', text: 'El negocio está suspendido. Contacta a soporte.', showPlans: false, showPortal: false }
    default:
      return null
  }
}

/** Text for a `402 ENTITLEMENT_REQUIRED` (`details.reason`) caught in an action. */
export function paywallMessage(reason: string | undefined, role: BusinessRole | null | undefined): string {
  if (role !== 'owner')
    return 'Este negocio no puede registrar sellos por ahora. Avísale al dueño.'

  switch (reason) {
    case 'trial_expired': return 'Tu periodo de prueba terminó. Elige un plan para continuar.'
    case 'subscription_ended': return 'Tu suscripción terminó. Elige un plan para continuar.'
    case 'suspended': return 'El negocio está suspendido. Contacta a soporte.'
    default: return 'Necesitas un plan activo para esta acción.'
  }
}
