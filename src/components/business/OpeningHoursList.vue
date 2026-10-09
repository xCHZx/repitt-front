<script setup lang="ts">
import { WEEK_DAYS, formatSlots } from './businessForm'
import type { OpeningHours } from '@/api/types'

// Read-only weekly schedule (absent day = closed).

const props = defineProps<{
  hours: OpeningHours | null | undefined
}>()
</script>

<template>
  <div class="opening-hours-list">
    <div
      v-for="day in WEEK_DAYS"
      :key="day.key"
      class="d-flex justify-space-between gap-3 text-body-2"
    >
      <span class="text-medium-emphasis">{{ day.label }}</span>
      <span
        class="text-end"
        :class="{ 'text-medium-emphasis': !props.hours?.[day.key]?.length }"
      >
        {{ formatSlots(props.hours?.[day.key]) }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.opening-hours-list {
  display: flex;
  flex-direction: column;
  gap: var(--s-1);
}
</style>
