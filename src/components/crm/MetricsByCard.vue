<script setup lang="ts">
import type { Metrics } from '@/api/types'

// Per-card breakdown of the period (MetricsDto.byCard).

const props = defineProps<{
  cards: Metrics['byCard']
}>()
</script>

<template>
  <VCard rounded="xl">
    <VCardText class="pa-4 pb-2">
      <div class="section-label">
        <VIcon
          icon="tabler-cards"
          size="13"
        />
        Por tarjeta
      </div>
    </VCardText>

    <VList v-if="props.cards.length">
      <template
        v-for="(card, index) in props.cards"
        :key="card.cardId"
      >
        <VListItem class="px-4 py-2">
          <VListItemTitle class="text-body-2 font-weight-bold">
            {{ card.name }}
          </VListItemTitle>
          <div class="d-flex flex-wrap gap-2 mt-2">
            <VChip
              size="x-small"
              color="primary"
              variant="tonal"
              prepend-icon="tabler-sticker"
            >
              {{ card.stamps }} {{ card.stamps === 1 ? 'sello' : 'sellos' }}
            </VChip>
            <VChip
              size="x-small"
              color="info"
              variant="tonal"
              prepend-icon="tabler-circle-check"
            >
              {{ card.completedCycles }} {{ card.completedCycles === 1 ? 'completada' : 'completadas' }}
            </VChip>
            <VChip
              size="x-small"
              color="success"
              variant="tonal"
              prepend-icon="tabler-gift"
            >
              {{ card.redemptions }} {{ card.redemptions === 1 ? 'canje' : 'canjes' }}
            </VChip>
          </div>
        </VListItem>
        <VDivider v-if="index < props.cards.length - 1" />
      </template>
    </VList>

    <VCardText
      v-else
      class="text-medium-emphasis py-6"
    >
      Sin movimientos en este periodo
    </VCardText>
  </VCard>
</template>
