// Error catalog → UI text (guide §5).
// The backend `message` (and `details[].message`) is already in es-MX and safe to show, so it is
// the default. Overrides exist only where the guide prescribes a specific UI text, or where the
// error is a front bug / transport problem that the user cannot act on.
import { isApiError, toApiError } from './errors'
import type { ApiError, ApiErrorCode } from './errors'

const BUG_TEXT = 'Algo salió mal de nuestro lado. Intenta de nuevo.'

const BY_CODE: Partial<Record<ApiErrorCode, string>> = {
  NETWORK: 'No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.',
  INTERNAL_ERROR: 'Ocurrió un error inesperado. Intenta de nuevo en un momento.',
  CLIENT: 'Ocurrió un error inesperado. Recarga la página e intenta de nuevo.',
  CANCELED: '',
  IDEMPOTENCY_KEY_REQUIRED: BUG_TEXT,
  IDEMPOTENCY_MISMATCH: BUG_TEXT,
  NOT_IMPLEMENTED: BUG_TEXT,
  UNSUPPORTED_FILE_TYPE: 'Usa una imagen PNG, JPG o WebP.',
  SELF_STAMP_FORBIDDEN: 'No puedes sellarte a ti mismo.',
  MAX_CYCLES_REACHED: 'El cliente ya completó todos los ciclos de esta tarjeta.',
  BUSINESS_NOT_PUBLISHED: 'Publica tu negocio para registrar clientes o sellar.',
  MAX_PUBLISHED_CARDS: 'Llegaste al máximo de tarjetas publicadas. Pausa o archiva otra para continuar.',
  MEMBER_LIMIT_REACHED: 'Alcanzaste el máximo de cajeros.',
  OTP_EXPIRED: 'El código venció o ya se usó. Pide uno nuevo.',
  OTP_MAX_ATTEMPTS: 'Agotaste los intentos. Pide un código nuevo.',
  RESET_TOKEN_INVALID: 'El enlace ya no es válido. Solicita un enlace nuevo.',
  EMAIL_TOKEN_INVALID: 'El enlace ya no es válido. Solicita un enlace nuevo.',
  VOID_WINDOW_EXPIRED: 'Pasó el tiempo para deshacer. Pídeselo al dueño del negocio.',
  VOID_NOT_ALLOWED: 'Este movimiento no se puede anular. Contacta a soporte.',
  CYCLE_REDEEMED: 'El sello es de un ciclo ya canjeado: anula primero el canje y después el sello.',
  ALREADY_VOIDED: 'Este movimiento ya se anuló.',
  SUBSCRIPTION_EXISTS: 'Este negocio ya tiene una suscripción. Adminístrala desde el portal de pagos.',
}

const BY_DETAIL: Record<string, string> = {
  // 409 CONFLICT
  noPublishedCard: 'Publica una tarjeta primero.',
  cardLimit: 'Llegaste al máximo de 20 tarjetas sin archivar. Archiva alguna para crear otra.',
  customerRevoked: 'Esta persona ya no participa en el programa de este negocio; no se puede registrar.',
  businessSuspended: 'El negocio está suspendido. Contacta a soporte.',
  ownerPhone: 'Ese es tu propio teléfono.',
  alreadyMember: 'Esa persona ya es parte de tu equipo.',
  noBillingAccount: 'Este negocio aún no tiene cuenta de pagos. Elige un plan primero.',
  billingUnavailable: 'La contratación no está disponible por ahora.',
  ownsBusinesses: 'Para cancelar tu cuenta primero hay que cerrar tus negocios. Escríbenos a soporte.',

  // 403 FORBIDDEN
  selfRedeem: 'No puedes canjear tu propia recompensa.',
  notOwnEvent: 'Solo puedes deshacer tus propios movimientos. Pídeselo al dueño del negocio.',
  redeemVoidLimit: 'Ya se anuló un canje en este ciclo. Pídeselo al dueño del negocio.',

  // 400 INVALID_QR
  invalidFormat: 'El código no es válido.',
  businessQr: 'Ese es el QR del negocio: escanea el QR del cliente.',
  cycleMismatch: 'El código no corresponde a este cliente o tarjeta.',

  // Front bugs
  whitelistValidation: BUG_TEXT,
  jsonRequired: BUG_TEXT,
  contentLengthRequired: BUG_TEXT,
  isUuid: BUG_TEXT,

  // 413
  maxPixels: 'La imagen tiene demasiados píxeles.',
}

export interface DescribedError {
  /** Text for an inline alert / toast. */
  message: string
  /** Show it next to the message so support can trace the request. */
  requestId?: string
  /** Per-field messages from `details[]` (validation). */
  fieldErrors: Record<string, string>
  error: ApiError
}

function retryText(ms?: number) {
  if (!ms)
    return 'Demasiados intentos. Espera un momento e intenta de nuevo.'
  const s = Math.ceil(ms / 1000)

  return s < 120
    ? `Demasiados intentos. Intenta de nuevo en ${s} s.`
    : `Demasiados intentos. Intenta de nuevo en ${Math.ceil(s / 60)} min.`
}

export function errorMessage(e: unknown): string {
  const err = toApiError(e)

  if (err.code === 'RATE_LIMITED')
    return retryText(err.retryAfterMs)
  if (err.code === 'FILE_TOO_LARGE')
    return err.detailCode === 'maxPixels' ? BY_DETAIL.maxPixels : 'La imagen pesa más de 2 MB.'
  if (err.detailCode && BY_DETAIL[err.detailCode])
    return BY_DETAIL[err.detailCode]

  return BY_CODE[err.code] ?? err.message
}

export function describeError(e: unknown): DescribedError {
  const err = toApiError(e)

  return {
    message: errorMessage(err),
    requestId: err.requestId,
    fieldErrors: err.fieldErrors,
    error: err,
  }
}

/** Non-API exceptions (programming errors) should still be visible in dev tools. */
export function reportUnexpected(e: unknown) {
  if (!isApiError(e))
    console.error(e)
}
