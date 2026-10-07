// Wires the API client to the session store, the router and the reauth dialog.
// Runs after 1.router and 2.pinia (plugins are registered in file-name order).
import type { App } from 'vue'
import { configureApiClient } from '@/api/client'
import { requestReauth } from '@/composables/useReauth'
import { router } from '@/plugins/1.router'
import { useBusinessStore } from '@/stores/business'
import { useSessionStore } from '@/stores/session'

export default function (_app: App) {
  configureApiClient({
    getAccessToken: () => useSessionStore().accessToken,

    setAccessToken: token => useSessionStore().setAccess(token),

    onSessionEnded: () => {
      const session = useSessionStore()
      if (session.status === 'anonymous')
        return
      session.clear()

      const current = router.currentRoute.value
      if (!current.meta.public)
        router.push({ path: '/auth/login', query: { redirect: current.fullPath } })
    },

    onAccountSuspended: () => {
      useSessionStore().clear('suspended')
      router.push({ path: '/cuenta-suspendida' })
    },

    requestReauth,

    canStepUpWithPassword: () => useSessionStore().hasPassword && !useBusinessStore().isCashier,
  })
}
