<script setup lang="ts">
import type { PublicCard } from '@/api/types'
import { formatLocalDate } from '@/utils/dates'

// Loyalty card as shown on the public business page (PublicCardDto, guide §4.A.4).

const props = defineProps<{
  card: PublicCard
}>()

const color = computed(() => props.card.primaryColor || '#6C3CE1')
</script>

<template>
  <VCard
    rounded="xl"
    class="public-card"
    :style="{ borderInlineStartColor: color }"
  >
    <VCardText class="d-flex align-center gap-3 pa-4">
      <div
        class="public-card__icon"
        :style="{ background: `${color}1f` }"
      >
        <img
          v-if="props.card.iconUrl"
          :src="props.card.iconUrl"
          :alt="props.card.name"
          class="public-card__img"
        >
        <VIcon
          v-else
          icon="tabler-award"
          size="24"
          :color="color"
        />
      </div>
      <div class="flex-grow-1 min-w-0">
        <div class="text-body-1 font-weight-bold text-truncate">
          {{ props.card.name }}
        </div>
        <div class="text-body-2 text-medium-emphasis">
          {{ props.card.reward }}
        </div>
        <div class="d-flex flex-wrap gap-2 mt-1 text-caption">
          <span
            class="font-weight-bold"
            :style="{ color }"
          >
            {{ props.card.requiredStamps }} {{ props.card.requiredStamps === 1 ? 'sello' : 'sellos' }}
          </span>
          <span
            v-if="props.card.endsOn"
            class="text-medium-emphasis"
          >
            · Válida hasta el {{ formatLocalDate(props.card.endsOn) }}
          </span>
        </div>
      </div>
    </VCardText>
  </VCard>
</template>

<style scoped>
.public-card {
  border-inline-start: 4px solid transparent;
}

.public-card__icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  block-size: 48px;
  inline-size: 48px;
}

.public-card__img {
  block-size: 32px;
  inline-size: 32px;
  object-fit: contain;
}
</style>
