<script setup lang="ts">
import OpeningHoursList from '@/components/business/OpeningHoursList.vue'
import type { Business } from '@/api/types'
import { MEXICO_TIMEZONES, formatInstant } from '@/utils/dates'

// Owner view of the business data (guide §3.1, BusinessWithRoleDto).

const props = defineProps<{
  business: Business
  categoryName?: string | null
}>()

const initial = computed(() => String(props.business.name || 'R').charAt(0).toUpperCase())

const timezoneLabel = computed(() =>
  MEXICO_TIMEZONES.find(z => z.value === props.business.timezone)?.title ?? props.business.timezone)
</script>

<template>
  <VCard
    rounded="xl"
    class="mb-4"
  >
    <VCardText class="pa-5">
      <VAvatar
        rounded="lg"
        size="80"
        color="primary"
        variant="tonal"
        class="mb-3"
      >
        <VImg
          v-if="props.business.logoUrl"
          :src="props.business.logoUrl"
          cover
        />
        <span
          v-else
          class="text-h3 font-weight-bold"
        >{{ initial }}</span>
      </VAvatar>

      <div class="text-h6 font-weight-bold mb-2">
        {{ props.business.name }}
      </div>

      <div class="d-flex flex-wrap gap-2 mb-3">
        <VChip
          v-if="props.categoryName"
          color="primary"
          size="small"
          variant="tonal"
        >
          {{ props.categoryName }}
        </VChip>
        <VChip
          size="small"
          variant="outlined"
        >
          <VIcon
            start
            icon="tabler-barcode"
            size="13"
          />
          {{ props.business.repittCode }}
        </VChip>
      </div>

      <div
        v-if="props.business.description"
        class="text-body-2 text-medium-emphasis"
      >
        {{ props.business.description }}
      </div>
    </VCardText>

    <VDivider />

    <VList density="compact">
      <VListItem
        prepend-icon="tabler-map-pin"
        :title="props.business.address || 'Sin dirección'"
      />
      <VDivider />
      <VListItem
        prepend-icon="tabler-phone"
        :title="props.business.publicPhone || 'Sin teléfono público'"
      />
      <VDivider />
      <VListItem
        prepend-icon="tabler-world"
        :title="`Zona horaria: ${timezoneLabel}`"
      />
      <VDivider />
      <VListItem
        prepend-icon="tabler-calendar"
        :title="`Creado el ${formatInstant(props.business.createdAt, props.business.timezone)}`"
      />
    </VList>

    <VDivider />

    <VCardText class="pa-4">
      <div class="d-flex align-center gap-2 mb-2 text-body-2 font-weight-medium">
        <VIcon
          icon="tabler-clock"
          size="18"
        />
        Horario de atención
      </div>
      <OpeningHoursList
        v-if="props.business.openingHours"
        :hours="props.business.openingHours"
      />
      <div
        v-else
        class="text-body-2 text-medium-emphasis"
      >
        Sin horario registrado
      </div>
    </VCardText>
  </VCard>
</template>
