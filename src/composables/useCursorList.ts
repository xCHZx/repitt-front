// Cursor-paginated list (guide §1.2): `{ data, page: { nextCursor } }`, no totals.
// The cursor is opaque: re-send it as-is.
import { computed, ref, shallowRef } from 'vue'
import { describeError, reportUnexpected } from '@/api/messages'
import type { DescribedError } from '@/api/messages'
import type { CursorPage } from '@/api/types'

export function useCursorList<T>(fetchPage: (cursor: string | undefined) => Promise<CursorPage<T>>) {
  const items = shallowRef<T[]>([])
  const nextCursor = ref<string | null>(null)
  const loading = ref(false)
  const loaded = ref(false)
  const error = ref<DescribedError | null>(null)

  let generation = 0

  const hasMore = computed(() => nextCursor.value !== null)
  const isEmpty = computed(() => loaded.value && items.value.length === 0)

  async function run(cursor: string | undefined, append: boolean) {
    const gen = ++generation

    loading.value = true
    error.value = null
    try {
      const page = await fetchPage(cursor)
      if (gen !== generation)
        return
      items.value = append ? [...items.value, ...page.data] : page.data
      nextCursor.value = page.page.nextCursor
      loaded.value = true
    }
    catch (e) {
      if (gen !== generation)
        return
      reportUnexpected(e)
      error.value = describeError(e)
    }
    finally {
      if (gen === generation)
        loading.value = false
    }
  }

  /** Load the first page (also used to reload after filters change). */
  const reload = () => run(undefined, false)

  const loadMore = () => {
    if (!nextCursor.value || loading.value)
      return Promise.resolve()

    return run(nextCursor.value, true)
  }

  return { items, loading, loaded, error, hasMore, isEmpty, reload, loadMore }
}
