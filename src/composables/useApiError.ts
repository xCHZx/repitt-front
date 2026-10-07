// Form/action error state for API calls (guide §5).
// const { error, fieldErrors, capture, reset } = useApiError()
// try { … } catch (e) { capture(e) }
// <ApiErrorAlert :error="error" />  and  :error-messages="fieldErrors.name"
import { computed, ref } from 'vue'
import { describeError, reportUnexpected } from '@/api/messages'
import type { DescribedError } from '@/api/messages'

export function useApiError() {
  const error = ref<DescribedError | null>(null)

  const fieldErrors = computed<Record<string, string | undefined>>(() => error.value?.fieldErrors ?? {})

  /** Store the error for display and return it (to branch on `.error.code` / `.error.detailCode`). */
  function capture(e: unknown): DescribedError {
    reportUnexpected(e)
    error.value = describeError(e)

    return error.value
  }

  function reset() {
    error.value = null
  }

  return { error, fieldErrors, capture, reset }
}
