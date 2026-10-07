// Counter "Recientes" (guide §4.B.7): results of stamp, enroll-with-stamp and redeem made in this
// tab, kept in memory only (never persisted). "Deshacer" is offered while the event is younger than
// the backend void window (15 min). After a reload, the fallback is the cycle detail page.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useBusinessStore } from '@/stores/business'

/** Backend VOID_WINDOW_MINUTES default (§4.B.7). */
export const VOID_WINDOW_MS = 15 * 60 * 1000

const MAX_ENTRIES = 20

export type CounterRecentType = 'stamp' | 'redeem'

export interface CounterRecent {
  businessId: string
  eventId: string
  cycleId: string
  type: CounterRecentType
  customerName: string
  cardName: string

  /** Epoch ms when the result arrived. */
  at: number
  voided?: boolean
}

// Module level: survives navigation inside the SPA, lost on reload (by design).
const entries = ref<CounterRecent[]>([])

/** True while an event that happened at `at` (ms or ISO) can still be undone from the counter. */
export function withinVoidWindow(at: number | string, now: number = Date.now()) {
  const t = typeof at === 'number' ? at : new Date(at).getTime()

  return Number.isFinite(t) && now - t < VOID_WINDOW_MS
}

export function addCounterRecent(entry: Omit<CounterRecent, 'at' | 'voided'> & { at?: number }) {
  const next: CounterRecent = { ...entry, at: entry.at ?? Date.now() }

  entries.value = [next, ...entries.value.filter(e => e.eventId !== next.eventId)].slice(0, MAX_ENTRIES)
}

export function markCounterRecentVoided(eventId: string) {
  entries.value = entries.value.map(e => (e.eventId === eventId ? { ...e, voided: true } : e))
}

/**
 * Recents of the active business, plus a `now` that ticks every 30 s so "Deshacer" disappears when
 * the window closes.
 */
export function useCounterRecents() {
  const business = useBusinessStore()
  const now = ref(Date.now())
  let timer: ReturnType<typeof setInterval> | undefined

  onMounted(() => {
    timer = setInterval(() => {
      now.value = Date.now()
    }, 30_000)
  })
  onBeforeUnmount(() => clearInterval(timer))

  const recents = computed(() => entries.value.filter(e => e.businessId === business.activeId))

  const canUndo = (entry: CounterRecent) => !entry.voided && withinVoidWindow(entry.at, now.value)

  return { recents, now, canUndo, add: addCounterRecent, markVoided: markCounterRecentVoided }
}
