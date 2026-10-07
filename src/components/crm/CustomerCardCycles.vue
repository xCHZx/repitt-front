<script setup lang="ts">
import type { CustomerDetail, Cycle } from '@/api/types'
import { formatInstant } from '@/utils/dates'

// A card of a customer with its cycles (CustomerDetailDto.cards[], guide §4.A.7).

const props = defineProps<{
  entry: CustomerDetail['cards'][number]
  timezone: string
}>()

const STATUS: Record<Cycle['status'], { label: string; color: string; icon: string }> = {
  open: { label: 'En curso', color: 'primary', icon: 'tabler-progress' },
  completed: { label: 'Premio pendiente', color: 'warning', icon: 'tabler-clock' },
  redeemed: { label: 'Canjeado', color: 'success', icon: 'tabler-gift' },
}

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
  <VCard rounded="xl">
    <VCardText class="pa-4 pb-2">
      <div class="text-body-1 font-weight-bold">
        {{ props.entry.card.name }}
      </div>
      <div class="text-caption text-medium-emphasis">
        {{ props.entry.card.reward }} · {{ props.entry.card.requiredStamps }} sellos
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
              :color="STATUS[cycle.status].color"
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
            {{ cycle.stampsCount }} / {{ cycle.requiredStamps }} sellos · {{ cycleDate(cycle) }}
          </VListItemSubtitle>
          <VProgressLinear
            v-if="cycle.status === 'open'"
            :model-value="(cycle.stampsCount / Math.max(cycle.requiredStamps, 1)) * 100"
            color="primary"
            bg-color="primary"
            bg-opacity="0.12"
            rounded
            height="5"
            class="mt-2"
          />

          <template #append>
            <VChip
              :color="STATUS[cycle.status].color"
              size="x-small"
              variant="tonal"
              class="ms-2"
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
