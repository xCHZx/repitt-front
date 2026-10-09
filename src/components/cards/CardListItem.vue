<!-- Row of a stamp card in the owner's list; also used as the live preview of the card form. -->
<script setup lang="ts">
import { computed } from 'vue'
import CardStatusChip from './CardStatusChip.vue'
import { tint } from './cardMeta'
import type { StampCardStatus } from '@/api/types'
import { stampCount } from '@/components/stampCard/stampCard'

// Fila plana (plan 2026-10-08 §2B): el color de la tarjeta solo en el filete y la ficha del ícono.

const props = defineProps<{
  name: string
  reward: string
  requiredStamps: number
  primaryColor: string
  iconUrl: string | null
  status?: StampCardStatus
  isExpired: boolean
  validity?: string
  to?: string
}>()

const accent = computed(() => tint(props.primaryColor, ''))
</script>

<template>
  <VCard
    :to="props.to"
    rounded="xl"
    class="fila-tarjeta"
    :style="{ '--c': accent }"
  >
    <VCardText class="pa-4">
      <div class="d-flex align-center gap-3">
        <VAvatar
          rounded="lg"
          size="44"
          class="fila-tarjeta__avatar"
        >
          <VImg
            v-if="props.iconUrl"
            :src="props.iconUrl"
            :width="28"
            :height="28"
          />
          <VIcon
            v-else
            icon="tabler-cards"
            size="22"
            class="fila-tarjeta__icono"
          />
        </VAvatar>

        <div class="flex-grow-1 overflow-hidden">
          <div class="text-body-1 font-weight-bold text-truncate">
            {{ props.name }}
          </div>
          <div class="text-caption text-medium-emphasis mt-1 d-flex align-center gap-1 text-truncate">
            <VIcon
              icon="tabler-gift"
              size="13"
            />
            <span class="text-truncate">{{ props.reward }}</span>
          </div>
          <div
            v-if="props.validity"
            class="text-caption text-medium-emphasis d-flex align-center gap-1"
          >
            <VIcon
              icon="tabler-calendar"
              size="13"
            />
            <span class="text-truncate">{{ props.validity }}</span>
          </div>
        </div>

        <div class="d-flex flex-column align-end gap-2 flex-shrink-0">
          <CardStatusChip
            v-if="props.status"
            :status="props.status"
            :is-expired="props.isExpired"
          />
          <span class="text-caption text-medium-emphasis text-no-wrap">
            {{ stampCount(props.requiredStamps) }}
          </span>
        </div>
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
</style>
