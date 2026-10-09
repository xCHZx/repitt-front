<script setup lang="ts">
import { computed } from 'vue'
import type { CustomerDetail, Cycle } from '@/api/types'
import { progressLabel, stampCount } from '@/components/stampCard/stampCard'
import { formatInstant } from '@/utils/dates'

// A card of a customer with its cycles (CustomerDetailDto.cards[], guide §4.A.7).
// Fila plana (plan 2026-10-08 §2B): filete y progreso en el color de la tarjeta si se conoce
// (CardRefDto no lo trae; la página puede pasarlo), si no en --acento. Premio pendiente con .chip-premio.

const props = defineProps<{
  entry: CustomerDetail['cards'][number]
  timezone: string

  /** Color de la tarjeta (StampCardDto.primaryColor), si la página lo tiene. */
  primaryColor?: string | null
}>()

const STATUS: Record<Cycle['status'], { label: string; icon: string }> = {
  open: { label: 'En curso', icon: 'tabler-progress' },
  completed: { label: 'Premio pendiente', icon: 'tabler-clock' },
  redeemed: { label: 'Canjeado', icon: 'tabler-gift' },
}

const accent = computed(() => props.primaryColor || 'var(--acento)')

const cycles = computed(() => [...props.entry.cycles].sort((a, b) => b.cycleNumber - a.cycleNumber))

const cycleDate = (cycle: Cycle) => {
  const fmt = (iso: string | null) => formatInstant(iso, props.timezone)
  if (cycle.status === 'redeemed')
    return `Canjeado el ${fmt(cycle.redeemedAt)}`
  if (cycle.status === 'completed')
    return `Completado el ${fmt(cycle.completedAt)}`

  return `Desde el ${fmt(cycle.openedAt)}`
}
</script>

<template>
  <VCard
    rounded="xl"
    class="fila-tarjeta"
    :style="{ '--c': accent }"
  >
    <VCardText class="pa-4 pb-2">
      <div class="text-body-1 font-weight-bold">
        {{ props.entry.card.name }}
      </div>
      <div class="text-caption text-medium-emphasis">
        {{ props.entry.card.reward }} · {{ stampCount(props.entry.card.requiredStamps) }}
      </div>
    </VCardText>

    <VList
      v-if="cycles.length"
      density="compact"
    >
      <template
        v-for="(cycle, idx) in cycles"
        :key="cycle.id"
      >
        <VListItem
          class="py-2"
          :to="`/empresa/ciclos/${cycle.id}`"
        >
          <template #prepend>
            <VAvatar
              variant="tonal"
              size="36"
              class="me-3"
            >
              <VIcon
                :icon="STATUS[cycle.status].icon"
                size="18"
              />
            </VAvatar>
          </template>

          <VListItemTitle class="text-body-2 font-weight-bold">
            Ciclo {{ cycle.cycleNumber }}
          </VListItemTitle>
          <VListItemSubtitle class="text-caption">
            {{ progressLabel(cycle.stampsCount, cycle.requiredStamps) }} sellos · {{ cycleDate(cycle) }}
          </VListItemSubtitle>
          <VProgressLinear
            v-if="cycle.status === 'open'"
            :model-value="(cycle.stampsCount / Math.max(cycle.requiredStamps, 1)) * 100"
            :color="accent"
            rounded
            class="mt-2"
          />

          <template #append>
            <VChip
              size="x-small"
              class="ms-2"
              :class="{ 'chip-premio': cycle.status === 'completed' }"
            >
              {{ STATUS[cycle.status].label }}
            </VChip>
          </template>
        </VListItem>
        <VDivider v-if="idx < cycles.length - 1" />
      </template>
    </VList>

    <VCardText
      v-else
      class="text-caption text-medium-emphasis pt-0"
    >
      Sin ciclos registrados
    </VCardText>
  </VCard>
</template>

<style scoped>
/* Filete de 3px del color de la tarjeta (o --acento) en el lado inicial; el resto del borde es --linea */
.v-card.fila-tarjeta {
  border-inline-start: 3px solid var(--c);
}
</style>
