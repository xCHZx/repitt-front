// Formatting helpers for MetricsDto (guide §4.A.9).
import type { Metrics, MetricsPeriod } from '@/api/types'
import { formatInstant } from '@/utils/dates'

type IndicatorKey = keyof Metrics['indicators']

export interface IndicatorTile {
  key: IndicatorKey
  title: string
  icon: string
  color: string
  value: string
  growth?: number
  caption: string
}

const INDICATORS: { key: IndicatorKey; title: string; icon: string; color: string; percent?: boolean }[] = [
  { key: 'stamps', title: 'Sellos', icon: 'tabler-sticker', color: 'primary' },
  { key: 'uniqueCustomers', title: 'Clientes activos', icon: 'tabler-users-group', color: 'warning' },
  { key: 'newCustomers', title: 'Clientes nuevos', icon: 'tabler-user-plus', color: 'info' },
  { key: 'returningCustomers', title: 'Clientes que regresaron', icon: 'tabler-repeat', color: 'secondary' },
  { key: 'completedCycles', title: 'Tarjetas completadas', icon: 'tabler-cards', color: 'info' },
  { key: 'redemptions', title: 'Recompensas canjeadas', icon: 'tabler-gift', color: 'success' },
  { key: 'redemptionRate', title: 'Tasa de canje', icon: 'tabler-percentage', color: 'success', percent: true },
  { key: 'activeCycles', title: 'Tarjetas en curso', icon: 'tabler-progress', color: 'primary' },
]

const formatNumber = (n: number) => n.toLocaleString('es-MX')
const formatPercent = (fraction: number) => `${(Math.round(fraction * 1000) / 10).toLocaleString('es-MX')}%`

/** KPI tiles; `growth` is a fraction in the API (null when previous is 0) → percentage or undefined. */
export function indicatorTiles(indicators: Metrics['indicators']): IndicatorTile[] {
  return INDICATORS.map(({ key, title, icon, color, percent }) => {
    const { current, previous, growth } = indicators[key]
    const fmt = percent ? formatPercent : formatNumber

    return {
      key,
      title,
      icon,
      color,
      value: fmt(current),
      growth: growth === null ? undefined : growth * 100,
      caption: `Periodo anterior: ${fmt(previous)}`,
    }
  })
}

/** Label of a series bucket. Granularity: day/week → days, month → weeks, year → months. */
export function bucketLabel(bucket: string, period: MetricsPeriod, timeZone: string): string {
  if (period === 'year')
    return formatInstant(bucket, timeZone, { month: 'short' })
  if (period === 'month')
    return `Sem ${formatInstant(bucket, timeZone, { day: 'numeric', month: 'short' })}`
  if (period === 'week')
    return formatInstant(bucket, timeZone, { weekday: 'short', day: 'numeric' })

  return formatInstant(bucket, timeZone, { day: 'numeric', month: 'short' })
}

/** "1 oct 2026 – 6 oct 2026" in the metrics time zone (`to` is the effective end). */
export function rangeLabel(metrics: Metrics): string {
  const toMs = new Date(metrics.to).getTime()
  const end = Number.isNaN(toMs) ? metrics.to : new Date(toMs - 1).toISOString()
  const from = formatInstant(metrics.from, metrics.timezone)
  const to = formatInstant(end, metrics.timezone)

  return from === to ? from : `${from} – ${to}`
}
