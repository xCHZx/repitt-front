<!--
  Shown on the card detail when the icon upload failed right after creating the card:
  retries only the upload (the card already exists, §4.A.5).
-->
<script setup lang="ts">
import { pendingIconUpload } from './pendingIcon'
import { uploadCardIcon } from '@/api/endpoints/cards'
import type { StampCard } from '@/api/types'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import { useApiError } from '@/composables/useApiError'

const props = defineProps<{
  businessId: string
  card: StampCard
}>()

const emit = defineEmits<{
  (e: 'uploaded', card: StampCard): void
}>()

const pending = computed(() => pendingIconUpload.value?.cardId === props.card.id ? pendingIconUpload.value : null)

const { error, capture, reset } = useApiError()
const isUploading = ref(false)

const shownError = computed(() => error.value ?? pending.value?.error ?? null)

async function retry() {
  const file = pending.value?.file
  if (!file)
    return
  reset()
  isUploading.value = true
  try {
    const card = await uploadCardIcon(props.businessId, props.card.id, file)

    pendingIconUpload.value = null
    emit('uploaded', card)
  }
  catch (e) {
    capture(e)
  }
  finally {
    isUploading.value = false
  }
}

function dismiss() {
  pendingIconUpload.value = null
}
</script>

<template>
  <div v-if="pending">
    <ApiErrorAlert
      v-if="shownError"
      :error="shownError"
      class="mb-4"
    >
      <div class="mt-1">
        La tarjeta se creó, pero no pudimos subir el ícono.
      </div>
      <div class="d-flex flex-wrap gap-2 mt-2">
        <VBtn
          size="small"
          variant="flat"
          color="error"
          :loading="isUploading"
          @click="retry"
        >
          Reintentar
        </VBtn>
        <VBtn
          size="small"
          variant="text"
          @click="dismiss"
        >
          Omitir
        </VBtn>
      </div>
    </ApiErrorAlert>
    <VAlert
      v-else
      color="warning"
      variant="tonal"
      rounded="lg"
      density="compact"
      icon="tabler-alert-triangle"
      closable
      class="mb-4"
      @click:close="dismiss"
    >
      La tarjeta se creó, pero no pudimos preparar el ícono. Elige otro desde «Editar tarjeta».
    </VAlert>
  </div>
</template>
