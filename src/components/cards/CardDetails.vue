<!-- Read-only view of a stamp card for the owner (StampCardDto). -->
<script setup lang="ts">
import { cooldownText, maxCyclesText, validityText } from './cardMeta'
import type { StampCard as StampCardDto } from '@/api/types'
import StampCard from '@/components/stampCard/StampCard.vue'
import { previewStamps } from '@/components/stampCard/stampCard'
import { useBusinessStore } from '@/stores/business'
import { formatInstant } from '@/utils/dates'

const props = defineProps<{
  card: StampCardDto
}>()

const business = useBusinessStore()

const rules = computed(() => [
  { icon: 'tabler-clock', text: cooldownText(props.card.cooldownHours) },
  { icon: 'tabler-repeat', text: maxCyclesText(props.card.maxCycles) },
  { icon: 'tabler-calendar', text: validityText(props.card) },
])
</script>

<template>
  <div>
    <!-- Tarjeta (sellos de muestra) -->
    <div class="section-label mb-3">
      Sellos · {{ props.card.requiredStamps }} {{ props.card.requiredStamps === 1 ? 'sello requerido' : 'sellos requeridos' }}
    </div>
    <StampCard
      :business-name="business.active?.name ?? ''"
      :logo-url="business.active?.logoUrl"
      :card-name="props.card.name"
      :reward="props.card.reward"
      :required-stamps="props.card.requiredStamps"
      :stamps="previewStamps(props.card.requiredStamps)"
      :color="props.card.primaryColor"
      :icon-url="props.card.iconUrl"
      class="mb-4"
    />
    <p
      v-if="props.card.description"
      class="note mb-4"
    >
      {{ props.card.description }}
    </p>

    <!-- Reglas y vigencia -->
    <VCard class="mb-4">
      <VList density="compact">
        <VListItem
          v-for="rule in rules"
          :key="rule.icon"
          :prepend-icon="rule.icon"
          :title="rule.text"
        />
      </VList>
    </VCard>

    <!-- Reglas congeladas -->
    <VAlert
      v-if="props.card.rulesLockedAt"
      density="compact"
      icon="tabler-lock"
      class="mb-4"
    >
      Reglas congeladas desde el {{ formatInstant(props.card.rulesLockedAt, business.timezone) }}, cuando se registró
      el primer sello de un cliente. Ya no puedes cambiar los sellos requeridos, la espera, los ciclos ni la fecha de
      inicio; la fecha de fin solo se puede extender o quitar.
    </VAlert>
  </div>
</template>
