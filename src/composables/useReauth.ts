// Step-up / reauthentication prompt (guide §2.8–§2.9).
// The API interceptor calls `requestReauth(method)` and awaits the user: the global
// <ReauthDialog> (mounted in App.vue) performs the step-up and settles the promise.
import { reactive } from 'vue'
import type { ReauthMethod } from '@/api/client'
import { useSessionStore } from '@/stores/session'

interface ReauthState {
  open: boolean
  method: ReauthMethod
}

const state = reactive<ReauthState>({ open: false, method: 'password' })

let pending: { promise: Promise<boolean>; resolve: (ok: boolean) => void } | null = null

export function requestReauth(method: ReauthMethod): Promise<boolean> {
  if (pending)
    return pending.promise

  let settle!: (ok: boolean) => void

  const promise = new Promise<boolean>(resolve => {
    settle = resolve
  })

  pending = { promise, resolve: settle }
  state.method = method
  state.open = true

  return promise
}

/** Called by the dialog: true = reauthenticated, false = cancelled. */
export function settleReauth(ok: boolean) {
  state.open = false
  pending?.resolve(ok)
  pending = null
}

export function useReauthState() {
  return state
}

/**
 * Reauthenticate BEFORE an action that needs it when a 403 would be costly
 * (GET /v1/me/export counts the 403 toward its 3/h limit, §4.C.6).
 */
export async function ensureReauthenticated(): Promise<boolean> {
  const session = useSessionStore()
  if (session.isRecentlyReauthenticated())
    return true

  return requestReauth(session.hasPassword ? 'password' : 'otp')
}
