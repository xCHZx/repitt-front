// Session (guide §2.1–§2.4).
// - Access token lives ONLY in memory (no persist): a reload boots with POST /v1/auth/refresh,
//   whose cookie is httpOnly and never touched by the front.
// - There is no global role: `me.memberships[]` (owner / cashier per business); none = visitor.
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { apiBaseUrl } from '@/api/client'
import { logout as apiLogout, logoutAll as apiLogoutAll } from '@/api/endpoints/auth'
import { getMe } from '@/api/endpoints/me'
import { refreshAccessToken } from '@/api/refresh'
import type { AccessToken, Amr, MeDto } from '@/api/types'
import { useBusinessStore } from '@/stores/business'

export type SessionStatus = 'idle' | 'loading' | 'anonymous' | 'authenticated' | 'suspended'

/** Reauthentication window granted by a password login / step-up (§2.1). Kept slightly shorter than the server's 10 min. */
const REAUTH_WINDOW_MS = 9 * 60 * 1000

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

    const outcome = await refreshAccessToken(apiBaseUrl)
    if (!outcome.ok) {
      status.value = outcome.error.code === 'ACCOUNT_SUSPENDED' ? 'suspended' : 'anonymous'

      return
    }

    setAccess(outcome.token)
    try {
      await loadMe()
      status.value = 'authenticated'
    }
    catch (e) {
      // loadMe failures that end the session are handled by the interceptor
      if (status.value === 'loading')
        status.value = 'anonymous'
      accessToken.value = null
    }
  }

  /** Resolves once the initial refresh + GET /v1/me finished (router guard awaits it). */
  function ensureReady() {
    bootPromise ??= boot()

    return bootPromise
  }

  /** Drop every trace of the session in memory. Does NOT call the API. */
  function clear(nextStatus: SessionStatus = 'anonymous') {
    accessToken.value = null
    amr.value = null
    me.value = null
    reauthenticatedAt.value = null
    status.value = nextStatus
    useBusinessStore().reset()
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
    clear,
    logout,
  }
})
