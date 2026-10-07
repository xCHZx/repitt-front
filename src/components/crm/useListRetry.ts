// Retry for a cursor list: "Reintentar" repeats the call that failed (first page or "Cargar más")
// and rows are hidden when the first page failed, so stale results never sit under the error.
import { computed, ref } from 'vue'
import type { useCursorList } from '@/composables/useCursorList'

type CursorList = Pick<ReturnType<typeof useCursorList<unknown>>, 'error' | 'reload' | 'loadMore'>

export function useListRetry(list: CursorList) {
  const lastWasMore = ref(false)

  const reload = () => {
    lastWasMore.value = false

    return list.reload()
  }

  const loadMore = () => {
    lastWasMore.value = true

    return list.loadMore()
  }

  const retry = () => (lastWasMore.value ? list.loadMore() : list.reload())

  /** False while the first page failed: the rows on screen belong to the previous query. */
  const showRows = computed(() => !list.error.value || lastWasMore.value)

  return { reload, loadMore, retry, showRows }
}
