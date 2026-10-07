// Session (guide §2.1–§2.4).
// - Access token lives ONLY in memory (no persist): a reload boots with POST /v1/auth/refresh,
//   whose cookie is httpOnly and never touched by the front.
// - There is no global role: `me.memberships[]` (owner / cashier per business); none = visitor.
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { apiBaseUrl } from '@/api/client'
import { toApiError } from '@/api/errors'
import { logout as apiLogout, logoutAll as apiLogoutAll } from '@/api/endpoints/auth'
import { getMe } from '@/api/endpoints/me'
import { refreshAccessToken } from '@/api/refresh'
import type { AccessToken, Amr, MeDto } from '@/api/types'
import { clearCounterRecents } from '@/composables/useCounterRecents'
import { useBusinessStore } from '@/stores/business'

/**
 * `unavailable`: the boot could not reach the server (network, 5xx, 429). The refresh cookie may
 * still be valid, so this is NOT a signed-out state: `retryBoot()` tries again.
 */
export type SessionStatus = 'idle' | 'loading' | 'anonymous' | 'authenticated' | 'suspended' | 'unavailable'

/** Reauthentication window granted by a password login / step-up (§2.1). Kept slightly shorter than the server's 10 min. */
const REAUTH_WINDOW_MS = 9 * 60 * 1000

/** Waits between boot attempts on a transient failure (2 retries). */
const BOOT_RETRY_DELAYS_MS = [1000, 3000]
const MAX_RETRY_AFTER_MS = 5000

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/** Network / gateway, 5xx or 429: the server did not judge the session, so it is still worth retrying. */
function isTransient(e: unknown) {
  const err = toApiError(e)

  return err.isNetwork || err.status >= 500 || err.status === 429
}

function retryDelay(e: unknown, attempt: number) {
  const { retryAfterMs } = toApiError(e)

  return retryAfterMs !== undefined && retryAfterMs <= MAX_RETRY_AFTER_MS ? retryAfterMs : BOOT_RETRY_DELAYS_MS[attempt]
}

// V2 persisted the token in localStorage under these keys: drop them on boot.
const LEGACY_STORAGE_KEYS = ['auth', 'company']

export const useSessionStore = defineStore('session', () => {
  const accessToken = ref<string | null>(null)
  const amr = ref<Amr | null>(null)
  const me = ref<MeDto | null>(null)
  const status = ref<SessionStatus>('idle')
  const reauthenticatedAt = ref<number | null>(null)

  let bootPromise: Promise<void> | null = null

  const isAuthenticated = computed(() => status.value === 'authenticated' && !!accessToken.value)
  const memberships = computed(() => me.value?.memberships ?? [])
  const hasMemberships = computed(() => memberships.value.length > 0)
  const hasPassword = computed(() => !!me.value?.hasPassword)
  const isOtpSession = computed(() => amr.value === 'otp')
  const emailPendingVerification = computed(() => !!me.value?.email && !me.value?.emailVerifiedAt)

  function setAccess(token: Pick<AccessToken, 'accessToken' | 'amr'>) {
    accessToken.value = token.accessToken
    amr.value = token.amr
  }

  /** Login / OTP verify / owner register verify / step-up with password. */
  function applySession(session: { accessToken: string; amr: Amr; user?: MeDto | null }) {
    setAccess(session)
    if (session.user)
      me.value = session.user
    status.value = 'authenticated'

    // A password login or a fresh owner registration leaves the session reauthenticated for 10 min
    if (session.amr === 'pwd')
      markReauthenticated()
  }

  function markReauthenticated() {
    reauthenticatedAt.value = Date.now()
  }

  const isRecentlyReauthenticated = () =>
    reauthenticatedAt.value !== null && Date.now() - reauthenticatedAt.value < REAUTH_WINDOW_MS

  async function loadMe() {
    me.value = await getMe()

    return me.value
  }

  async function boot() {
    for (const key of LEGACY_STORAGE_KEYS) {
      try {
        localStorage.removeItem(key)
      }
      catch {}
    }

    status.value = 'loading'

    // §2.2: only 401 UNAUTHENTICATED / SESSION_REVOKED (or a 403) means "anonymous";
    // a network / 5xx / 429 failure is retried and then reported as `unavailable`.
    let outcome = await refreshAccessToken(apiBaseUrl)
    for (let attempt = 0; !outcome.ok && isTransient(outcome.error) && attempt < BOOT_RETRY_DELAYS_MS.length; attempt++) {
      await sleep(retryDelay(outcome.error, attempt))
      outcome = await refreshAccessToken(apiBaseUrl)
    }
    if (!outcome.ok) {
      if (outcome.error.code === 'ACCOUNT_SUSPENDED')
        status.value = 'suspended'
      else
        status.value = isTransient(outcome.error) ? 'unavailable' : 'anonymous'

      return
    }

    setAccess(outcome.token)
    for (let attempt = 0; ; attempt++) {
      try {
        await loadMe()
        status.value = 'authenticated'

        return
      }
      catch (e) {
        // Failures that end the session (401 / suspended) were already handled by the interceptor
        if (status.value !== 'loading')
          return

        if (!isTransient(e)) {
          clear()

          return
        }
        if (attempt >= BOOT_RETRY_DELAYS_MS.length) {
          // Keep the token: the session is fine, the server just did not answer
          status.value = 'unavailable'

          return
        }
        await sleep(retryDelay(e, attempt))
      }
    }
  }

  /** Resolves once the initial refresh + GET /v1/me finished (router guard awaits it). */
  function ensureReady() {
    bootPromise ??= boot()

    return bootPromise
  }

  /** "Reintentar" after a boot that could not reach the server (`status === 'unavailable'`). */
  function retryBoot() {
    if (status.value === 'unavailable')
      bootPromise = boot()

    return ensureReady()
  }

  /** Drop every trace of the session in memory. Does NOT call the API. */
  function clear(nextStatus: SessionStatus = 'anonymous') {
    accessToken.value = null
    amr.value = null
    me.value = null
    reauthenticatedAt.value = null
    status.value = nextStatus
    useBusinessStore().reset()
    clearCounterRecents()
  }

  /** Never just drop local state: the refresh cookie would survive (§2.4). */
  async function logout(everywhere = false) {
    try {
      await (everywhere ? apiLogoutAll() : apiLogout())
    }
    catch {
      // 401 here means there is no session left to close
    }
    clear()
  }

  return {
    accessToken,
    amr,
    me,
    status,
    isAuthenticated,
    memberships,
    hasMemberships,
    hasPassword,
    isOtpSession,
    emailPendingVerification,
    setAccess,
    applySession,
    markReauthenticated,
    isRecentlyReauthenticated,
    loadMe,
    ensureReady,
    retryBoot,
    clear,
    logout,
  }
})
