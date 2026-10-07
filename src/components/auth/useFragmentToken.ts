// Email links carry their token in the URL fragment (guide §2.10): `/reset-password#token=…`,
// `/verify-email#token=…`. Read it once, wipe it from the address bar AND from vue-router's
// state, and keep the page under `Referrer-Policy: no-referrer` while it is mounted.
import { onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function useFragmentToken(): string | null {
  const router = useRouter()
  const route = useRoute()
  const token = new URLSearchParams(window.location.hash.slice(1)).get('token')

  if (window.location.hash) {
    // Immediate wipe. `current` (router location, without base) is overwritten too: vue-router's
    // push() rewrites the current entry from history.state.current, which would otherwise put the
    // token back in history.
    const current = router.resolve({ path: route.path, query: route.query }).fullPath

    history.replaceState({ ...history.state, current }, '', window.location.pathname + window.location.search)

    // Let the router drop the hash as well (currentLocation, route.hash, route.fullPath)
    router.replace({ path: route.path, query: route.query, hash: '' }).catch(() => {})
  }

  const meta = document.createElement('meta')

  meta.name = 'referrer'
  meta.content = 'no-referrer'
  document.head.appendChild(meta)

  onBeforeUnmount(() => meta.remove())

  return token || null
}
