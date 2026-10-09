<script lang="ts" setup>
import { computed } from 'vue'
import type { PendingRedemption } from '@/api/types'
import { DEFAULT_CARD_COLOR } from '@/components/counter/counter'
import { formatInstant } from '@/utils/dates'

// One pending redemption (§4.B.5): reward, card, customer and completion date. The body links to
// the cycle detail; "Canjear" redeems from the list (no code).
// Fila plana (plan 2026-10-08 §2B): el color de la tarjeta solo en el filete y la ficha del ícono.

const props = defineProps<{
  item: PendingRedemption
  timeZone: string

  /** From GET …/cards; null when the card is archived or not listed (default style). */
  primaryColor?: string | null
  iconUrl?: string | null
}>()

const emit = defineEmits<{
  redeem: []
}>()

const accentColor = computed(() => props.primaryColor || DEFAULT_CARD_COLOR)
const completed = computed(() => formatInstant(props.item.cycle.completedAt, props.timeZone))
</script>

<template>
  <VCard
    rounded="xl"
    class="fila-tarjeta"
    :style="{ '--c': accentColor }"
  >
    <VCardText class="pa-4">
      <div class="d-flex align-center gap-3">
        <RouterLink
          :to="`/empresa/ciclos/${props.item.cycle.id}`"
          class="pending-item__link d-flex align-center gap-3 flex-grow-1 overflow-hidden"
        >
          <VAvatar
            rounded="lg"
            size="44"
            class="fila-tarjeta__avatar"
          >
            <VImg
              v-if="props.iconUrl"
              :src="props.iconUrl"
            />
            <VIcon
              v-else
              icon="tabler-gift"
              size="22"
              class="fila-tarjeta__icono"
            />
          </VAvatar>

          <div class="flex-grow-1 overflow-hidden">
            <div class="text-body-1 font-weight-bold text-truncate">
              {{ props.item.card.reward }}
            </div>
            <div class="text-caption text-medium-emphasis text-truncate mt-1">
              {{ props.item.card.name }}
            </div>
            <div class="d-flex flex-wrap align-center column-gap-3 mt-1">
              <div class="d-flex align-center gap-1 text-caption text-high-emphasis text-truncate">
                <VIcon
                  icon="tabler-user"
                  size="13"
                />
                {{ props.item.customer.displayName }}
              </div>
              <div class="d-flex align-center gap-1 text-caption text-medium-emphasis">
                <VIcon
                  icon="tabler-calendar"
                  size="13"
                />
                {{ completed }}
              </div>
              <VChip
                v-if="props.item.cycle.isTest"
                size="x-small"
              >
                Prueba
              </VChip>
            </div>
          </div>
        </RouterLink>

        <VBtn
          size="small"
          variant="flat"
          prepend-icon="tabler-gift"
          class="flex-shrink-0"
          @click="emit('redeem')"
        >
          Canjear
        </VBtn>
      </div>
    </VCardText>
  </VCard>
</template>

<style scoped>
/* Filete de 3px del color de la tarjeta en el lado inicial; el resto del borde es --linea */
.v-card.fila-tarjeta {
  border-inline-start: 3px solid var(--c);
}

.fila-tarjeta__avatar {
  background-color: color-mix(in srgb, var(--c) 16%, transparent);
}

.fila-tarjeta__icono {
  /* Mezclado con --texto para que se lea con colores claros (amarillo) y en oscuro */
  color: color-mix(in srgb, var(--c) 50%, var(--texto));
}

.pending-item__link {
  color: inherit;
  text-decoration: none;
}
</style>
