<script setup lang="ts">
import { getMyCard } from '@/api/endpoints/me'
import type { MeCardDetail } from '@/api/types'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import MeCardDetailView from '@/components/visitor/MeCardDetailView.vue'
import { useApiError } from '@/composables/useApiError'

// GET /v1/me/cards/{cycleId} (guide §4.C.2). The id is always a cycle uuid from a previous response.

definePage({
  meta: {
    layout: 'visitor',
  },
})

const route = useRoute()
const cycleId = computed(() => String((route.params as Record<string, unknown>).cycleId ?? ''))

const detail = ref<MeCardDetail | null>(null)
const loading = ref(true)
const notFound = ref(false)
const { error, capture, reset } = useApiError()

const load = async () => {
  if (!cycleId.value)
    return
  loading.value = true
  notFound.value = false
  reset()
  try {
    detail.value = await getMyCard(cycleId.value)
  }
  catch (e) {
    detail.value = null

    const described = capture(e)
    if (described.error.status === 404 || described.error.code === 'VALIDATION_FAILED') {
      notFound.value = true
      reset()
    }
  }
  finally {
    loading.value = false
  }
}

watch(cycleId, load, { immediate: true })
</script>

<template>
  <div>
    <template v-if="loading">
      <VSkeletonLoader
        type="card"
        class="mb-4 rounded-xl"
      />
      <VSkeletonLoader
        type="list-item-two-line, list-item-two-line"
        class="rounded-xl"
      />
    </template>

    <div
      v-else-if="notFound"
      class="py-12"
    >
      <VIcon
        icon="tabler-cards-off"
        size="56"
        color="medium-emphasis"
        class="mb-4"
      />
      <div class="text-h6 font-weight-bold mb-1">
        Esta tarjeta no está disponible
      </div>
      <div class="text-body-2 text-medium-emphasis mb-5">
        Puede que ya no forme parte de tu cartera
      </div>
      <VBtn
        to="/visitante/tarjetas"
        variant="tonal"
        color="primary"
        prepend-icon="tabler-cards"
      >
        Ver mis tarjetas
      </VBtn>
    </div>

    <div
      v-else-if="error"
      class="py-6"
    >
      <ApiErrorAlert :error="error" />
      <VBtn
        variant="tonal"
        class="mt-4"
        prepend-icon="tabler-refresh"
        @click="load"
      >
        Reintentar
      </VBtn>
    </div>

    <MeCardDetailView
      v-else-if="detail"
      :detail="detail"
    />
  </div>
</template>
