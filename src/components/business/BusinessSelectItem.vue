<script setup lang="ts">
import { entitlementHint, roleLabel } from './businessForm'
import type { Business } from '@/api/types'

// One row of the business selector: logo, name, role and entitlement hint (guide §3.1, §3.2).

const props = defineProps<{
  business: Business
  selected?: boolean
}>()

const hint = computed(() => entitlementHint(props.business))
const initial = computed(() => String(props.business.name || 'N').charAt(0).toUpperCase())
</script>

<template>
  <VCard
    class="sel-card"
    :class="{ 'sel-card--selected': props.selected }"
    rounded="xl"
    elevation="0"
  >
    <VCardText class="d-flex align-center gap-3 pa-4">
      <div class="sel-avatar">
        <img
          v-if="props.business.logoUrl"
          :src="props.business.logoUrl"
          :alt="props.business.name"
          class="sel-avatar__img"
        >
        <span
          v-else
          class="sel-avatar__initial"
        >{{ initial }}</span>
      </div>

      <div class="flex-grow-1 min-w-0">
        <div class="text-body-1 font-weight-bold text-truncate">
          {{ props.business.name }}
        </div>
        <div class="d-flex flex-wrap gap-1 mt-1">
          <VChip
            :color="props.business.role === 'owner' ? 'primary' : 'secondary'"
            variant="tonal"
            size="x-small"
          >
            {{ roleLabel(props.business.role) }}
          </VChip>
          <VChip
            v-if="hint"
            :color="hint.color"
            variant="tonal"
            size="x-small"
          >
            {{ hint.text }}
          </VChip>
          <VChip
            v-if="!props.business.isPublished"
            variant="tonal"
            size="x-small"
          >
            En pausa
          </VChip>
        </div>
      </div>

      <VIcon
        :icon="props.selected ? 'tabler-circle-check-filled' : 'tabler-chevron-right'"
        :color="props.selected ? 'primary' : undefined"
        size="18"
        class="flex-shrink-0 text-medium-emphasis"
      />
    </VCardText>
  </VCard>
</template>

<style scoped>
.sel-card {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  cursor: pointer;
  transition: box-shadow 0.15s ease;
}

.sel-card:hover {
  box-shadow: 0 4px 16px rgba(var(--v-theme-primary), 0.12);
}

.sel-card--selected {
  border-color: rgb(var(--v-theme-primary));
}

.sel-avatar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(var(--v-theme-primary), 0.1);
  block-size: 44px;
  inline-size: 44px;
}

.sel-avatar__img {
  border-radius: 10px;
  block-size: 100%;
  inline-size: 100%;
  object-fit: cover;
}

.sel-avatar__initial {
  color: rgb(var(--v-theme-primary));
  font-size: 1.2rem;
  font-weight: 700;
}
</style>
