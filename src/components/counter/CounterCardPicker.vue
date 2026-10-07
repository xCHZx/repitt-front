<script setup lang="ts">
import { computed } from 'vue'
import { cardAvailability } from './counter'
import type { StampCard } from '@/api/types'
import { todayInZone } from '@/utils/dates'

// Card to stamp (§4.B.1): published cards; expired ones and those starting after today (business
// zone) are shown disabled.

const props = withDefaults(defineProps<{
  cards: StampCard[]
  timeZone: string
  loading?: boolean
  label?: string
  clearable?: boolean
  errorMessages?: string | string[]
}>(), {
  label: 'Tarjeta a sellar',
  loading: false,
  clearable: false,
  errorMessages: () => [],
})

const model = defineModel<string | null>({ default: null })

const items = computed(() => {
  const today = todayInZone(props.timeZone)

  return props.cards.map(card => {
    const availability = cardAvailability(card, props.timeZone, today)

    return {
      title: card.name,
      value: card.id,
      props: {
        subtitle: availability.reason ?? `${card.requiredStamps} sellos · ${card.reward}`,
        disabled: !availability.stampable,
      },
      color: card.primaryColor,
    }
  })
})
</script>

<template>
  <VSelect
    v-model="model"
    :items="items"
    :label="props.label"
    :loading="props.loading"
    :clearable="props.clearable"
    :error-messages="props.errorMessages"
    :no-data-text="props.loading ? 'Cargando tarjetas…' : 'No hay tarjetas publicadas'"
    prepend-inner-icon="tabler-cards"
    rounded="lg"
    variant="outlined"
    hide-details="auto"
  >
    <template #item="{ item, props: itemProps }">
      <VListItem v-bind="itemProps">
        <template #prepend>
          <VAvatar
            size="10"
            :color="item.raw.color"
            class="me-3"
          />
        </template>
      </VListItem>
    </template>
  </VSelect>
</template>
