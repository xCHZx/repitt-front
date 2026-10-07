<script setup lang="ts">
import type { MeCardDetail } from '@/api/types'
import { EVENT_META } from '@/components/visitor/wallet'
import { formatDateTime } from '@/utils/dates'

// Events of a cycle (MeCardDetailDto.events, chronological, ≤ 200).
// The visitor DTO has no business time zone: instants use the default zone.

const props = defineProps<{
  events: MeCardDetail['events']
}>()

// Newest first reads better on a phone
const ordered = computed(() => [...props.events].reverse())
</script>

<template>
  <VCard rounded="xl">
    <VList
      v-if="ordered.length"
      density="compact"
    >
      <template
        v-for="(event, index) in ordered"
        :key="event.id"
      >
        <VListItem>
          <template #prepend>
            <VAvatar
              size="32"
              variant="tonal"
              :color="EVENT_META[event.type].color"
            >
              <VIcon
                :icon="EVENT_META[event.type].icon"
                size="18"
              />
            </VAvatar>
          </template>
          <VListItemTitle class="text-body-2 font-weight-medium">
            {{ EVENT_META[event.type].label }}
          </VListItemTitle>
          <VListItemSubtitle>
            {{ formatDateTime(event.occurredAt) }}
          </VListItemSubtitle>
        </VListItem>
        <VDivider v-if="index < ordered.length - 1" />
      </template>
    </VList>
    <VCardText
      v-else
      class="text-body-2 text-medium-emphasis text-center"
    >
      Aún no hay movimientos en esta tarjeta
    </VCardText>
  </VCard>
</template>
