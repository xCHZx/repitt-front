<!-- Read-only view of a stamp card for the owner (StampCardDto). -->
<script setup lang="ts">
import { cooldownText, maxCyclesText, tint, validityText } from './cardMeta'
import type { StampCard } from '@/api/types'
import { useBusinessStore } from '@/stores/business'
import { formatInstant } from '@/utils/dates'

const props = defineProps<{
  card: StampCard
}>()

const business = useBusinessStore()

const accent = computed(() => tint(props.card.primaryColor, ''))
const showDots = computed(() => props.card.requiredStamps <= 12)

const rules = computed(() => [
  { icon: 'tabler-clock', text: cooldownText(props.card.cooldownHours) },
  { icon: 'tabler-repeat', text: maxCyclesText(props.card.maxCycles) },
  { icon: 'tabler-calendar', text: validityText(props.card) },
])
</script>

<template>
  <div>
    <!-- Encabezado -->
    <VCard
      rounded="xl"
      class="mb-4"
      :style="{ borderBlockStart: `4px solid ${accent}` }"
    >
      <VCardText class="pa-4">
        <div class="d-flex align-center gap-3">
          <VAvatar
            rounded="lg"
            size="52"
            :style="{ background: tint(props.card.primaryColor, '20') }"
          >
            <VImg
              v-if="props.card.iconUrl"
              :src="props.card.iconUrl"
              :width="32"
              :height="32"
            />
            <VIcon
              v-else
              icon="tabler-cards"
              size="26"
              :style="{ color: accent }"
            />
          </VAvatar>
          <div class="flex-grow-1 overflow-hidden">
            <div class="text-h6 font-weight-bold text-truncate">
              {{ props.card.name }}
            </div>
            <div
              v-if="props.card.description"
              class="text-body-2 text-medium-emphasis mt-1"
            >
              {{ props.card.description }}
            </div>
          </div>
        </div>
      </VCardText>
    </VCard>

    <!-- Sellos -->
    <VCard
      rounded="xl"
      class="mb-4"
    >
      <VCardText class="pa-4">
        <div class="d-flex align-center justify-space-between mb-3">
          <div class="text-body-2 font-weight-bold text-medium-emphasis text-uppercase section-label-sm">
            Sellos
          </div>
          <div
            class="text-h6 font-weight-bold"
            :style="{ color: accent }"
          >
            {{ props.card.requiredStamps }} {{ props.card.requiredStamps === 1 ? 'sello requerido' : 'sellos requeridos' }}
          </div>
        </div>
        <div
          v-if="showDots"
          class="stamps-grid"
        >
          <div
            v-for="i in props.card.requiredStamps"
            :key="i"
            class="stamp-dot"
            :style="{ background: tint(props.card.primaryColor, '20'), borderColor: accent }"
          >
            <VImg
              v-if="props.card.iconUrl"
              :src="props.card.iconUrl"
              :width="16"
              :height="16"
            />
            <VIcon
              v-else
              icon="tabler-star"
              size="14"
              :style="{ color: accent }"
            />
          </div>
        </div>
      </VCardText>
    </VCard>

    <!-- Recompensa -->
    <VCard
      rounded="xl"
      class="mb-4"
      :style="{ background: tint(props.card.primaryColor, '10') }"
    >
      <VCardText class="pa-4 d-flex align-center gap-3">
        <div
          class="stat-icon"
          :style="{ background: tint(props.card.primaryColor, '20'), color: accent }"
        >
          <VIcon
            icon="tabler-gift"
            size="22"
          />
        </div>
        <div class="overflow-hidden">
          <div class="text-caption text-medium-emphasis">
            Recompensa
          </div>
          <div class="text-body-1 font-weight-bold">
            {{ props.card.reward }}
          </div>
        </div>
      </VCardText>
    </VCard>

    <!-- Reglas y vigencia -->
    <VCard
      rounded="xl"
      class="mb-4"
    >
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
      color="info"
      variant="tonal"
      rounded="xl"
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

<style scoped>
.stamps-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.stamp-dot {
  display: flex;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  border: 2px solid;
  border-radius: 50%;
  block-size: 32px;
  inline-size: 32px;
}

.stat-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  block-size: 44px;
  inline-size: 44px;
}

.section-label-sm {
  font-size: 0.72rem;
  letter-spacing: 0.05em;
}
</style>
