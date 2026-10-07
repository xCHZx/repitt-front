import { describe, expect, it } from 'vitest'
import { formatInstant, formatLocalDate, timeAgo, todayInZone } from '../dates'

describe('dates', () => {
  it('formats instants in the business zone, not the runtime zone', () => {
    // 2026-10-07 03:30 UTC is still Oct 6 in Mexico City (UTC-6)
    expect(formatInstant('2026-10-07T03:30:00.000Z', 'America/Mexico_City', { day: 'numeric' })).toBe('6')
    expect(formatInstant('2026-10-07T03:30:00.000Z', 'Asia/Tokyo', { day: 'numeric' })).toBe('7')
  })

  it('formats local calendar dates without shifting', () => {
    expect(formatLocalDate('2026-12-31', { day: 'numeric', month: 'numeric', year: 'numeric' })).toBe('31/12/2026')
    expect(formatLocalDate(null)).toBe('—')
    expect(formatLocalDate('2026-12-31T00:00:00Z')).toBe('—')
  })

  it('computes today in a zone', () => {
    const now = new Date('2026-10-07T03:30:00.000Z')

    expect(todayInZone('America/Mexico_City', now)).toBe('2026-10-06')
    expect(todayInZone('UTC', now)).toBe('2026-10-07')
  })

  it('renders relative times', () => {
    const now = new Date('2026-10-07T12:00:00.000Z')

    expect(timeAgo('2026-10-07T11:59:30.000Z', now)).toBe('Hace un momento')
    expect(timeAgo('2026-10-07T11:00:00.000Z', now)).toBe('Hace 1 hora')
    expect(timeAgo('2026-10-06T11:00:00.000Z', now)).toBe('Ayer')
  })
})
