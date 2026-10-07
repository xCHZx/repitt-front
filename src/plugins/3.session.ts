// Wires the API client to the session store, the router and the reauth dialog.
// Runs after 1.router and 2.pinia (plugins are registered in file-name order).
import type { App } from 'vue'
import { configureApiClient } from '@/api/client'
import { requestReauth, settleReauth } from '@/composables/useReauth'
import { router } from '@/plugins/1.router'
import { useBusinessStore } from '@/stores/business'
import { useSessionStore } from '@/stores/session'

/** Role in a given business: the loaded business list first, then `me.memberships`. */
function roleIn(businessId: string) {
  return useBusinessStore().businesses.find(b => b.id === businessId)?.role
    ?? useSessionStore().memberships.find(m => m.businessId === businessId)?.role
    ?? null
}

export default function (_: App) {
  configureApiClient({
    getAccessToken: () => useSessionStore().accessToken,

    setAccessToken: token => useSessionStore().setAccess(token),

    onSessionEnded: () => {
      // A pending step-up dialog must not stay on top of the login screen
      settleReauth(false)

      const session = useSessionStore()
      if (session.status === 'anonymous')
        return
      session.clear()

      const current = router.currentRoute.value
      if (!current.meta.public)
        router.push({ path: '/auth/login', query: { redirect: current.fullPath } })
    },

    onAccountSuspended: () => {
      settleReauth(false)
      useSessionStore().clear('suspended')
      router.push({ path: '/cuenta-suspendida' })
    },

    requestReauth,

    // §1.12: no password step-up for a cashier of THAT business; routes outside any business
    // (POST /v1/businesses) only need the user to have a password.
    canStepUpWithPassword: businessId => useSessionStore().hasPassword
      && (businessId === null || roleIn(businessId) !== 'cashier'),
  })
}
