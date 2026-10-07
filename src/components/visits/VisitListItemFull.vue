<script setup lang="ts">
import type { MeActivityEvent } from '@/api/types'
import { EVENT_META, accentOf, initialOf } from '@/components/visitor/wallet'
import { formatDateTime } from '@/utils/dates'

// One entry of my activity (MeActivityEventDto, guide §4.C.3). Opens the cycle detail.

const props = defineProps<{
  event: MeActivityEvent
}>()

const meta = computed(() => EVENT_META[props.event.type])
const accentColor = computed(() => accentOf(props.event.card.primaryColor))
</script>

<template>
  <VCard
    rounded="xl"
    :to="`/visitante/tarjetas/${props.event.cycleId}`"
    :style="{ borderInlineStart: `3px solid ${accentColor}` }"
  >
    <VCardText class="pa-4">
      <div class="d-flex align-center gap-3">
        <VAvatar
          rounded="lg"
          size="44"
          color="primary"
          variant="tonal"
        >
          <VImg
            v-if="props.event.business.logoUrl"
            :src="props.event.business.logoUrl"
          />
          <span
            v-else
            class="text-body-2 font-weight-bold"
          >{{ initialOf(props.event.business.name) }}</span>
        </VAvatar>

        <div class="flex-grow-1 overflow-hidden">
          <div class="text-subtitle-2 font-weight-bold text-truncate">
            {{ props.event.business.name }}
          </div>
          <div class="text-caption text-medium-emphasis text-truncate">
            {{ props.event.card.name }}
          </div>
          <div class="d-flex align-center gap-1 mt-1">
            <VIcon
              icon="tabler-calendar"
              size="12"
              color="medium-emphasis"
            />
            <span class="text-caption text-medium-emphasis">{{ formatDateTime(props.event.occurredAt) }}</span>
          </div>
        </div>

        <VChip
          size="small"
          variant="tonal"
          :color="meta.color"
          :prepend-icon="meta.icon"
          class="flex-shrink-0"
        >
          {{ meta.label }}
        </VChip>
      </div>
    </VCardText>
  </VCard>
</template>
