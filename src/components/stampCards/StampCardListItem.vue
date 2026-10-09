<script setup lang="ts">
import { computed } from 'vue'
import type { MeCard } from '@/api/types'
import { progressLabel } from '@/components/stampCard/stampCard'
import StampProgress from '@/components/visitor/StampProgress.vue'
import { accentOf, initialOf, isRedeemable, requiredOf } from '@/components/visitor/wallet'

// Wallet entry (MeCardDto, guide §4.C.2). Fila plana (plan 2026-10-08 §2B): el color de la tarjeta
// solo en el filete, el avatar y los sellos; «premio listo» con .chip-premio.

const props = withDefaults(defineProps<{
  item: MeCard
  to?: string
  dimmed?: boolean
}>(), {
  to: undefined,
  dimmed: false,
})

const accentColor = computed(() => accentOf(props.item.card.primaryColor))
const redeemable = computed(() => isRedeemable(props.item))
const required = computed(() => requiredOf(props.item))
</script>

<template>
  <VCard
    rounded="xl"
    :to="props.to"
    class="fila-tarjeta"
    :class="{ 'fila-tarjeta--atenuada': props.dimmed }"
    :style="{ '--c': accentColor }"
  >
    <VCardText class="pa-4">
      <div class="d-flex align-center gap-3 mb-4">
        <VAvatar
          rounded="lg"
          :size="48"
          class="fila-tarjeta__avatar"
        >
          <VImg
            v-if="props.item.business.logoUrl"
            :src="props.item.business.logoUrl"
          />
          <span
            v-else
            class="text-body-1 font-weight-bold"
          >{{ initialOf(props.item.business.name) }}</span>
        </VAvatar>

        <div class="flex-grow-1 overflow-hidden">
          <div class="text-subtitle-1 font-weight-bold text-truncate">
            {{ props.item.business.name }}
          </div>
          <div class="text-caption text-medium-emphasis text-truncate">
            {{ props.item.card.name }}
          </div>
        </div>

        <div class="flex-shrink-0">
          <VChip
            v-if="redeemable"
            size="small"
            prepend-icon="tabler-gift"
            class="chip-premio"
          >
            ¡A canjear!
          </VChip>
          <VChip
            v-else-if="props.item.cycle.status === 'redeemed'"
            size="small"
            prepend-icon="tabler-check"
          >
            Canjeada
          </VChip>
          <div
            v-else
            class="text-end"
          >
            <div class="fila-tarjeta__cuenta text-h6 font-weight-bold text-no-wrap">
              {{ progressLabel(props.item.cycle.stampsCount, required) }}
            </div>
            <div class="text-caption text-medium-emphasis">
              sellos
            </div>
          </div>
        </div>
      </div>

      <StampProgress
        :count="props.item.cycle.stampsCount"
        :required="required"
        :color="accentColor"
        :icon-url="props.item.card.iconUrl"
        class="mb-3"
      />

      <div class="d-flex align-center gap-1 text-caption text-medium-emphasis">
        <VIcon
          size="14"
          icon="tabler-gift"
        />
        <span class="text-truncate">{{ props.item.card.reward }}</span>
        <VChip
          v-if="!props.item.card.isActive"
          size="x-small"
          class="ms-auto flex-shrink-0"
        >
          No disponible
        </VChip>
      </div>
    </VCardText>
  </VCard>
</template>

<style scoped>
/* Filete de 3px del color de la tarjeta en el lado inicial; el resto del borde es --linea */
.v-card.fila-tarjeta {
  border-inline-start: 3px solid var(--c);
}

.v-card.fila-tarjeta--atenuada {
  opacity: 0.6;
}

.fila-tarjeta__avatar {
  background-color: color-mix(in srgb, var(--c) 16%, transparent);
  color: var(--texto);
}

.fila-tarjeta__cuenta {
  font-variant-numeric: tabular-nums;
}
</style>
