// Presentation helpers for StampCardDto (guide §4.A.5).
import type { StampCard, StampCardStatus } from '@/api/types'
import { formatLocalDate } from '@/utils/dates'

export const DEFAULT_CARD_COLOR = '#6C3CE1'

/** Backend defaults (§4.A.5): published cards (expired included) and non-archived cards. */
export const MAX_PUBLISHED_CARDS = 5
export const MAX_NON_ARCHIVED_CARDS = 20

export const PRESET_COLORS = [
  { hex: '#6C3CE1', label: 'Violeta' },
  { hex: '#E53935', label: 'Rojo' },
  { hex: '#F57C00', label: 'Naranja' },
  { hex: '#FDD835', label: 'Amarillo' },
  { hex: '#43A047', label: 'Verde' },
  { hex: '#00897B', label: 'Teal' },
  { hex: '#1E88E5', label: 'Azul' },
  { hex: '#8E24AA', label: 'Púrpura' },
  { hex: '#D81B60', label: 'Rosa' },
  { hex: '#6D4C41', label: 'Café' },
] as const

export const CARD_STATUS: Record<StampCardStatus, { label: string; color: string; icon: string }> = {
  draft: { label: 'Borrador', color: 'secondary', icon: 'tabler-pencil' },
  published: { label: 'Publicada', color: 'success', icon: 'tabler-circle-check' },
  paused: { label: 'Pausada', color: 'warning', icon: 'tabler-player-pause' },
  archived: { label: 'Archivada', color: 'default', icon: 'tabler-archive' },
}

/** "10 oct 2026 – 31 dic 2026" / "Desde 10 oct 2026 · Sin fin". `endsOn` is inclusive. */
export function validityText(card: Pick<StampCard, 'startsOn' | 'endsOn'>): string {
  const start = formatLocalDate(card.startsOn)

  return card.endsOn ? `${start} – ${formatLocalDate(card.endsOn)}` : `Desde ${start} · Sin fin`
}

export function cooldownText(hours: number): string {
  if (!hours)
    return 'Sin espera entre sellos'

  return hours === 1 ? '1 hora entre sellos' : `${hours} horas entre sellos`
}

export function maxCyclesText(maxCycles: number | null): string {
  if (maxCycles == null)
    return 'Sin límite de ciclos por cliente'

  return maxCycles === 1 ? '1 ciclo por cliente' : `Hasta ${maxCycles} ciclos por cliente`
}

/** Hex color with alpha suffix (`#RRGGBB` + `AA`), falling back to the default color. */
export function tint(color: string | null | undefined, alpha: string): string {
  const hex = color && /^#[\dA-F]{6}$/i.test(color) ? color : DEFAULT_CARD_COLOR

  return `${hex}${alpha}`
}

export type CardAction = 'publish' | 'pause' | 'resume' | 'archive'
