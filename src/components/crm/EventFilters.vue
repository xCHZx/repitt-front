<script setup lang="ts">
import { EVENT_TYPE_OPTIONS } from './eventLabels'
import type { CardOption, EventFilterValue } from './eventLabels'

// Event log filters (guide §4.A.8): type, card and a local date range (YYYY-MM-DD).

interface Props {
  cards: CardOption[]
  cardsLoading?: boolean

  /** The card is fixed by the page (card event log): hide its select. */
  hideCard?: boolean
  fieldErrors?: Record<string, string | undefined>
}

const props = defineProps<Props>()
const model = defineModel<EventFilterValue>({ required: true })

const set = <K extends keyof EventFilterValue>(key: K, value: EventFilterValue[K]) => {
  model.value = { ...model.value, [key]: value }
}
</script>

<template>
  <VRow dense>
    <VCol
      cols="12"
      :sm="props.hideCard ? 12 : 6"
    >
      <VSelect
        :model-value="model.type"
        :items="EVENT_TYPE_OPTIONS"
        label="Tipo de movimiento"
        placeholder="Todos"
        density="comfortable"
        clearable
        hide-details="auto"
        @update:model-value="set('type', $event ?? null)"
      />
    </VCol>
    <VCol
      v-if="!props.hideCard"
      cols="12"
      sm="6"
    >
      <VSelect
        :model-value="model.cardId"
        :items="props.cards"
        :loading="props.cardsLoading"
        label="Tarjeta"
        placeholder="Todas"
        density="comfortable"
        clearable
        hide-details="auto"
        no-data-text="Sin tarjetas"
        @update:model-value="set('cardId', $event ?? null)"
      />
    </VCol>
    <VCol cols="6">
      <VTextField
        :model-value="model.from"
        type="date"
        label="Desde"
        density="comfortable"
        hide-details="auto"
        :error-messages="props.fieldErrors?.from"
        @update:model-value="set('from', $event ?? '')"
      />
    </VCol>
    <VCol cols="6">
      <VTextField
        :model-value="model.to"
        type="date"
        label="Hasta"
        density="comfortable"
        hide-details="auto"
        :error-messages="props.fieldErrors?.to"
        @update:model-value="set('to', $event ?? '')"
      />
    </VCol>
  </VRow>
</template>
