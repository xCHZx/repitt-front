// Error state for a counter action: like useApiError(), with the §4.B texts (describeCounterError).
import { computed, ref } from 'vue'
import { describeCounterError } from './counter'
import type { CounterOperation } from './counter'
import type { DescribedError } from '@/api/messages'
import { useBusinessStore } from '@/stores/business'

export function useCounterError(op: CounterOperation) {
  const business = useBusinessStore()
  const error = ref<DescribedError | null>(null)

  const fieldErrors = computed<Record<string, string | undefined>>(() => error.value?.fieldErrors ?? {})

  function capture(e: unknown): DescribedError {
    error.value = describeCounterError(e, { op, role: business.role, timeZone: business.timezone })

    return error.value
  }

  function reset() {
    error.value = null
  }

  return { error, fieldErrors, capture, reset }
}
