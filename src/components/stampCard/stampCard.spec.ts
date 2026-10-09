import { describe, expect, it } from 'vitest'
import {
  MAX_STAMPS,
  MIN_STAMPS,
  STAMP_ANGLES,
  avatarInitial,
  cardSubtitle,
  clampRequired,
  clampStamps,
  contrastRatio,
  displayStatus,
  gridColumns,
  previewStamps,
  progressLabel,
  stampAngle,
  stampCount,
  stampIconMode,
  stampInk,
  statusMessage,
  visibleSlots,
} from './stampCard'

describe('estado de la tarjeta', () => {
  it('acota los sellos requeridos entre 1 y 50', () => {
    expect(clampRequired(0)).toBe(MIN_STAMPS)
    expect(clampRequired(60)).toBe(MAX_STAMPS)
    expect(clampRequired(Number.NaN)).toBe(MIN_STAMPS)
    expect(clampRequired(10)).toBe(10)
  })

  it('acota los sellos a pintar entre 0 y los requeridos', () => {
    expect(clampStamps(-2, 8)).toBe(0)
    expect(clampStamps(20, 8)).toBe(8)
    expect(clampStamps(5.7, 8)).toBe(5)
    expect(clampStamps(Number.NaN, 8)).toBe(0)
  })

  it('respeta el estado de la API', () => {
    expect(displayStatus('open', 5, 8)).toBe('open')
    expect(displayStatus('completed', 8, 8)).toBe('completed')
    expect(displayStatus('redeemed', 8, 8)).toBe('redeemed')
  })

  it('muestra completa una tarjeta abierta con todos los sellos', () => {
    expect(displayStatus('open', 8, 8)).toBe('completed')
    expect(displayStatus('open', 9, 8)).toBe('completed')
  })
})

describe('textos en español', () => {
  it('etiqueta de progreso «N de M»', () => {
    expect(progressLabel(5, 8)).toBe('5 de 8')
    expect(progressLabel(0, 10)).toBe('0 de 10')
  })

  it('cuenta sellos en singular y plural', () => {
    expect(stampCount(1)).toBe('1 sello')
    expect(stampCount(2)).toBe('2 sellos')
    expect(stampCount(50)).toBe('50 sellos')
  })

  it('subtítulo: el nombre de la tarjeta o cuántos sellos pide', () => {
    expect(cardSubtitle('Café gratis', 8)).toBe('Café gratis')
    expect(cardSubtitle('', 10)).toBe('10 sellos')
    expect(cardSubtitle('   ', 10)).toBe('10 sellos')
    expect(cardSubtitle(null, 1)).toBe('1 sello')
  })

  it('mensajes para lectores de pantalla', () => {
    expect(statusMessage('open', 6, 8, 'Un americano')).toBe('6 de 8 sellos.')
    expect(statusMessage('completed', 8, 8, 'Un americano')).toBe('Tarjeta completa. Premio listo: Un americano.')
    expect(statusMessage('open', 8, 8, 'Un americano')).toBe('Tarjeta completa. Premio listo: Un americano.')
    expect(statusMessage('redeemed', 8, 8, 'Un americano')).toBe('Premio canjeado.')
    expect(statusMessage('completed', 8, 8, '')).toBe('Tarjeta completa. Premio listo.')
  })
})

describe('inicial del avatar', () => {
  it.each([
    ['Café Luna', 'C'],
    ['ñandú', 'Ñ'],
    ['🍕 Pizzería', 'P'],
    ['👩‍🍳 Cocina', 'C'],
    ['  «La Esquina»', 'L'],
    ['7 Mares', '7'],
    ['éxito', 'É'],
    ['   ', 'R'],
    ['🍕🍕', 'R'],
  ])('«%s» → %s', (name, initial) => {
    expect(avatarInitial(name)).toBe(initial)
  })

  it('sin nombre usa «R»', () => {
    expect(avatarInitial(null)).toBe('R')
    expect(avatarInitial(undefined)).toBe('R')
  })

  it('devuelve un solo carácter completo, nunca medio par sustituto', () => {
    for (const name of ['🍕 Pizzería', '𝒜lfa', '👩‍🍳'])
      expect(avatarInitial(name)).not.toMatch(/[\uD800-\uDFFF]/u)
  })
})

describe('rejilla', () => {
  it('dibuja hasta 12 sellos y con más usa barra', () => {
    expect(visibleSlots(8)).toBe(8)
    expect(visibleSlots(12)).toBe(12)
    expect(visibleSlots(13)).toBeNull()
    expect(visibleSlots(50)).toBeNull()
  })

  it.each([[1, 1], [4, 4], [5, 5], [6, 3], [8, 4], [10, 5], [11, 6], [12, 6]])('%i sellos → %i columnas', (required, columns) => {
    expect(gridColumns(required)).toBe(columns)
  })

  it('usa 12 ángulos fijos entre −12° y 12°', () => {
    expect(STAMP_ANGLES).toHaveLength(12)
    for (const angle of STAMP_ANGLES)
      expect(Math.abs(angle)).toBeLessThanOrEqual(12)
  })

  it('el ángulo es determinista y cíclico', () => {
    expect(stampAngle(0)).toBe(-9)
    expect(stampAngle(12)).toBe(stampAngle(0))
    expect(stampAngle(13)).toBe(stampAngle(1))
    expect(stampAngle(-1)).toBe(STAMP_ANGLES[11])
  })

  it('llena hasta 3 sellos de muestra sin completarla', () => {
    expect(previewStamps(1)).toBe(0)
    expect(previewStamps(2)).toBe(1)
    expect(previewStamps(10)).toBe(3)
  })
})

describe('ícono del sello (D4)', () => {
  it('un PNG se pinta en blanco', () => {
    expect(stampIconMode('https://cdn.repitt.com/cards/abc/icon.png')).toBe('blanco')
    expect(stampIconMode('https://cdn.repitt.com/cards/abc/icon.PNG')).toBe('blanco')
  })

  it('ignora la query y el fragmento al ver la extensión', () => {
    expect(stampIconMode('https://cdn.repitt.com/icon.png?v=3&sig=x.jpg')).toBe('blanco')
    expect(stampIconMode('https://cdn.repitt.com/icon.png#x')).toBe('blanco')
    expect(stampIconMode('https://cdn.repitt.com/icon.jpg?name=a.png')).toBe('tonal')
  })

  it('otra imagen va tonal', () => {
    expect(stampIconMode('https://cdn.repitt.com/photo.jpg')).toBe('tonal')
    expect(stampIconMode('https://cdn.repitt.com/photo.webp')).toBe('tonal')
    expect(stampIconMode('blob:http://localhost/1234')).toBe('tonal')
  })

  it('sin URL no hay ícono', () => {
    expect(stampIconMode(null)).toBe('ninguno')
    expect(stampIconMode(undefined)).toBe('ninguno')
    expect(stampIconMode('')).toBe('ninguno')
    expect(stampIconMode('   ')).toBe('ninguno')
  })
})

describe('tinta sobre el color de la tarjeta', () => {
  // Tabla de la guía §2.5: columna «Check de selección».
  const CASES = [
    ['#6C3CE1', 'papel'],
    ['#E53935', 'papel'],
    ['#F57C00', 'tinta'],
    ['#FDD835', 'tinta'],
    ['#43A047', 'tinta'],
    ['#00897B', 'papel'],
    ['#1E88E5', 'tinta'],
    ['#8E24AA', 'papel'],
    ['#D81B60', 'papel'],
    ['#6D4C41', 'papel'],
  ] as const

  it.each(CASES)('%s lleva %s', (hex, ink) => {
    expect(stampInk(hex)).toBe(ink)
  })

  it('la tinta elegida da al menos 3.72:1 en los 10 colores', () => {
    for (const [hex, ink] of CASES)
      expect(contrastRatio(ink === 'papel' ? '#FFFFFF' : '#2F2B3D', hex)).toBeGreaterThanOrEqual(3.72)
  })

  it('un color no válido usa papel', () => {
    expect(stampInk(null)).toBe('papel')
    expect(stampInk('violeta')).toBe('papel')
    expect(stampInk('#FFF')).toBe('papel')
  })
})
