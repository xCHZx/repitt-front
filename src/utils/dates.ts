// Date helpers (guide §1.4).
// - Instants (createdAt, occurredAt, until, retryAt, bucket…) are UTC ISO strings: format them in
//   the BUSINESS time zone, never the browser's, for anything that belongs to a business.
// - Local dates `YYYY-MM-DD` (startsOn / endsOn) are calendar dates: format them without shifting.
//   `endsOn` is the last valid day, inclusive.

export const DEFAULT_TIMEZONE = 'America/Mexico_City'
export const LOCALE = 'es-MX'

const LOCAL_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

export function formatInstant(
  iso: string | null | undefined,
  timeZone: string = DEFAULT_TIMEZONE,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' },
): string {
  if (!iso)
    return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime()))
    return '—'

  return new Intl.DateTimeFormat(LOCALE, { ...options, timeZone }).format(d)
}

export function formatDateTime(iso: string | null | undefined, timeZone: string = DEFAULT_TIMEZONE): string {
  return formatInstant(iso, timeZone, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export function formatTime(iso: string | null | undefined, timeZone: string = DEFAULT_TIMEZONE): string {
  return formatInstant(iso, timeZone, { hour: 'numeric', minute: '2-digit' })
}

/** `YYYY-MM-DD` → "10 oct 2026" with no time zone shift. */
export function formatLocalDate(
  ymd: string | null | undefined,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' },
): string {
  const m = ymd ? LOCAL_DATE.exec(ymd) : null
  if (!m)
    return '—'
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])))

  return new Intl.DateTimeFormat(LOCALE, { ...options, timeZone: 'UTC' }).format(d)
}

/** Today's calendar date (`YYYY-MM-DD`) in the given zone. */
export function todayInZone(timeZone: string = DEFAULT_TIMEZONE, now: Date = new Date()): string {
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
}

/** Relative time in Spanish ("Hace 5 min", "Ayer"…). Zone independent. */
export function timeAgo(iso: string | null | undefined, now: Date = new Date()): string {
  if (!iso)
    return '—'
  const diff = now.getTime() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 2)
    return 'Hace un momento'
  if (mins < 60)
    return `Hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24)
    return hours === 1 ? 'Hace 1 hora' : `Hace ${hours} horas`
  const days = Math.floor(hours / 24)
  if (days === 1)
    return 'Ayer'
  if (days < 30)
    return `Hace ${days} días`
  const months = Math.floor(days / 30)

  return months === 1 ? 'Hace 1 mes' : `Hace ${months} meses`
}

/** IANA zones offered in business forms (Mexico). The backend rejects UTC and fixed offsets. */
export const MEXICO_TIMEZONES = [
  { value: 'America/Mexico_City', title: 'Centro (Ciudad de México)' },
  { value: 'America/Cancun', title: 'Sureste (Cancún)' },
  { value: 'America/Merida', title: 'Mérida' },
  { value: 'America/Monterrey', title: 'Monterrey' },
  { value: 'America/Matamoros', title: 'Matamoros' },
  { value: 'America/Chihuahua', title: 'Chihuahua' },
  { value: 'America/Ciudad_Juarez', title: 'Ciudad Juárez' },
  { value: 'America/Ojinaga', title: 'Ojinaga' },
  { value: 'America/Mazatlan', title: 'Pacífico (Mazatlán)' },
  { value: 'America/Bahia_Banderas', title: 'Bahía de Banderas' },
  { value: 'America/Hermosillo', title: 'Sonora (Hermosillo)' },
  { value: 'America/Tijuana', title: 'Noroeste (Tijuana)' },
] as const
