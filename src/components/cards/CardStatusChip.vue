<script setup lang="ts">
import { CARD_STATUS } from './cardMeta'
import type { StampCardStatus } from '@/api/types'

const props = defineProps<{
  status: StampCardStatus
  isExpired: boolean
  size?: 'x-small' | 'small'
}>()

const meta = computed(() => CARD_STATUS[props.status])
</script>

<template>
  <div class="d-flex flex-wrap justify-end gap-1">
    <VChip
      :color="meta.color"
      :size="props.size ?? 'x-small'"
      variant="tonal"
      :prepend-icon="meta.icon"
    >
      {{ meta.label }}
    </VChip>
    <VChip
      v-if="props.isExpired && props.status !== 'archived'"
      color="error"
      :size="props.size ?? 'x-small'"
      variant="tonal"
      prepend-icon="tabler-calendar-x"
    >
      Vencida
    </VChip>
  </div>
</template>
