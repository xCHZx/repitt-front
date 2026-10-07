<script setup lang="ts">
import type { DescribedError } from '@/api/messages'

const props = defineProps<{
  error: DescribedError | null | undefined
}>()
</script>

<template>
  <VAlert
    v-if="props.error"
    color="error"
    variant="tonal"
    rounded="lg"
    density="compact"
    icon="tabler-alert-triangle"
    class="api-error-alert"
  >
    <div>{{ props.error.message }}</div>
    <slot />
    <div
      v-if="props.error.requestId"
      class="text-caption text-medium-emphasis mt-1"
    >
      Folio de soporte: {{ props.error.requestId }}
    </div>
  </VAlert>
</template>

<style scoped>
.api-error-alert {
  white-space: pre-line;
}
</style>
