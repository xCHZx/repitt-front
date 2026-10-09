<script setup lang="ts">
import { computed } from 'vue'
import type { PublicCard } from '@/api/types'
import { DEFAULT_CARD_COLOR } from '@/components/cards/cardMeta'
import { stampCount } from '@/components/stampCard/stampCard'
import { formatLocalDate } from '@/utils/dates'

// Loyalty card as shown on the public business page (PublicCardDto, guide §4.A.4).
// Fila plana (plan 2026-10-08 §2B): el color de la tarjeta solo en el filete y la ficha del ícono.

const props = defineProps<{
  card: PublicCard
}>()

const color = computed(() => props.card.primaryColor || DEFAULT_CARD_COLOR)
</script>

<template>
  <VCard
    rounded="xl"
    class="public-card"
    :style="{ '--c': color }"
  >
    <VCardText class="d-flex align-center gap-3 pa-4">
      <div class="public-card__icon">
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
          class="public-card__fallback"
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
          <span class="font-weight-bold">
            {{ stampCount(props.card.requiredStamps) }}
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
/* Filete de 3px del color de la tarjeta en el lado inicial; el resto del borde es --linea */
.v-card.public-card {
  border-inline-start: 3px solid var(--c);
}

/* Medida de pieza: 48px (avatar de la guía §1) */
.public-card__icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: var(--r-control);
  background: color-mix(in srgb, var(--c) 16%, transparent);
  block-size: 48px;
  inline-size: 48px;
}

.public-card__img {
  block-size: 32px;
  inline-size: 32px;
  object-fit: contain;
}

.public-card__fallback {
  /* Mezclado con --texto para que se lea con colores claros (amarillo) y en oscuro */
  color: color-mix(in srgb, var(--c) 50%, var(--texto));
}
</style>
