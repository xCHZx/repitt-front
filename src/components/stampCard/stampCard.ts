/**
 * Lógica pura de la tarjeta de sellos. Portada de repitt-web/src/components/islands/stampCard.ts
 * (HEAD 90884dc) sin la parte de demo y configurador de la landing, con el estado de la API
 * (`cycle.status`: open | completed | redeemed). Sin DOM y sin aleatoriedad.
 *
 * Úsala para todo «N de M» de la app (`progressLabel`), no solo dentro de la tarjeta.
 */
import type { Cycle } from '@/api/types'

export type CardStatus = Cycle['status']

export const MIN_STAMPS = 1
export const MAX_STAMPS = 50

/** Hasta este número se dibujan todos los sellos; con más, una barra de 8px. */
export const MAX_VISIBLE_STAMPS = 12

/** Rotaciones fijas entre −12° y 12° (guía §5.5): nada aleatorio. */
export const STAMP_ANGLES = [-9, 5, -12, 7, -4, 11, -7, 3, -11, 8, -2, 6] as const

export function clampRequired(value: number): number {
  if (!Number.isFinite(value))
    return MIN_STAMPS

  return Math.min(MAX_STAMPS, Math.max(MIN_STAMPS, Math.round(value)))
}

/** Sellos a pintar: entre 0 y los requeridos. */
export function clampStamps(stamps: number, required: number): number {
  if (!Number.isFinite(stamps))
    return 0

  return Math.min(clampRequired(required), Math.max(0, Math.floor(stamps)))
}

/**
 * Estado que se dibuja. Respeta el de la API; si dice `open` pero ya están todos los sellos,
 * se muestra completa (como en la landing).
 */
export function displayStatus(status: CardStatus, stamps: number, required: number): CardStatus {
  if (status === 'open' && clampStamps(stamps, required) >= clampRequired(required))
    return 'completed'

  return status
}

/** «5 de 8». */
export function progressLabel(stamps: number, required: number): string {
  return `${stamps} de ${required}`
}

/** «1 sello», «10 sellos». */
export function stampCount(count: number): string {
  return `${count} ${count === 1 ? 'sello' : 'sellos'}`
}

/** Subtítulo de la tarjeta: su nombre o, si no tiene, cuántos sellos pide. */
export function cardSubtitle(cardName: string | null | undefined, required: number): string {
  return cardName?.trim() || stampCount(required)
}

/**
 * Inicial del avatar: la primera letra o cifra del nombre, en mayúscula. Busca por punto de
 * código (regex con /u), así que no parte emojis ni pares sustitutos; sin letras ni cifras, «R».
 */
export function avatarInitial(name: string | null | undefined): string {
  return (name ?? '').normalize('NFC').match(/[\p{L}\p{N}]/u)?.[0]?.toLocaleUpperCase('es-MX') ?? 'R'
}

/** Texto para lectores de pantalla y regiones vivas. */
export function statusMessage(status: CardStatus, stamps: number, required: number, reward: string): string {
  const shown = displayStatus(status, stamps, required)
  if (shown === 'completed')
    return reward.trim() ? `Tarjeta completa. Premio listo: ${reward.trim()}.` : 'Tarjeta completa. Premio listo.'
  if (shown === 'redeemed')
    return 'Premio canjeado.'

  return `${progressLabel(clampStamps(stamps, required), clampRequired(required))} sellos.`
}

/** Posiciones a dibujar, o null si van en barra (más de 12). */
export function visibleSlots(required: number): number | null {
  return required <= MAX_VISIBLE_STAMPS ? required : null
}

/** Columnas de la rejilla: una fila hasta 5 sellos; si no, dos filas. */
export function gridColumns(required: number): number {
  return required <= 5 ? required : Math.ceil(Math.min(required, MAX_VISIBLE_STAMPS) / 2)
}

export function stampAngle(index: number): number {
  const size = STAMP_ANGLES.length

  return STAMP_ANGLES[((index % size) + size) % size]
}

/** Sellos llenos de muestra (vista del dueño y del editor): enseña el diseño sin completarla. */
export function previewStamps(required: number): number {
  return Math.min(3, clampRequired(required) - 1)
}

/**
 * Cómo se dibuja el ícono dentro del sello lleno (decisión D4 del plan 2026-10-08):
 * - `blanco`: el PNG de los íconos predefinidos (trazo del color de la tarjeta, fondo transparente)
 *   se vuelve blanco con `filter: brightness(0) invert(1)`.
 * - `tonal`: una foto o un JPG/WebP propio no se puede volver blanco; va tal cual sobre
 *   `color-mix(in srgb, var(--c) 16%, transparent)`.
 * - `ninguno`: sin ícono.
 */
export type StampIconMode = 'blanco' | 'tonal' | 'ninguno'

function relativeLuminance(hex: string): number {
  const channel = (start: number): number => {
    const value = Number.parseInt(hex.slice(start, start + 2), 16) / 255

    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  }

  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5)
}

/** Contraste WCAG 2 entre dos colores `#RRGGBB`. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)

  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/** Valores de --papel y --tinta en tokens.css: no cambian con el tema. */
const INKS = { papel: '#FFFFFF', tinta: '#2F2B3D' } as const

export type StampInk = keyof typeof INKS

/**
 * Tinta sobre el color de la tarjeta: la de más contraste, igual que `checkInk` de la landing
 * (repitt-web/src/components/islands/stampIcons.ts). Sirve para el ícono del sello lleno y para el
 * check de la muestra elegida. Con blanco fijo, el amarillo daba 1.40:1. Un color que no sea
 * `#RRGGBB` usa papel.
 */
export function stampInk(hex: string | null | undefined): StampInk {
  if (!hex || !/^#[\da-f]{6}$/i.test(hex))
    return 'papel'

  return contrastRatio(INKS.papel, hex) >= contrastRatio(INKS.tinta, hex) ? 'papel' : 'tinta'
}

export function stampIconMode(iconUrl?: string | null): StampIconMode {
  const url = iconUrl?.trim()
  if (!url)
    return 'ninguno'

  const path = url.split(/[?#]/, 1)[0]

  return /\.png$/i.test(path) ? 'blanco' : 'tonal'
}
