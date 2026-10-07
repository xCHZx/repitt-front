<script setup lang="ts">
import type { CustomerSummary } from '@/api/types'
import { timeAgo } from '@/utils/dates'

// One row of the CRM list (CustomerSummaryDto, guide §4.A.7).

const props = defineProps<{
  customer: CustomerSummary
}>()

const initials = (name: string) => name
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map(part => part.charAt(0))
  .join('')
  .toUpperCase() || '?'
</script>

<template>
  <VCard
    rounded="xl"
    class="customer-card"
    :to="`/empresa/clientes/${props.customer.id}`"
  >
    <VCardText class="pa-4">
      <div class="d-flex align-center gap-3 mb-3">
        <VAvatar
          color="primary"
          variant="tonal"
          size="44"
        >
          <span class="text-body-1 font-weight-bold">
            {{ initials(props.customer.displayName) }}
          </span>
        </VAvatar>

        <div class="flex-grow-1 min-width-0">
          <div class="d-flex align-center gap-2">
            <span class="text-body-1 font-weight-bold text-truncate">
              {{ props.customer.displayName }}
            </span>
            <VChip
              v-if="props.customer.isTest"
              size="x-small"
              color="info"
              variant="tonal"
            >
              Prueba
            </VChip>
          </div>
          <div class="text-caption text-medium-emphasis">
            {{ props.customer.phoneMasked }}
          </div>
        </div>

        <div class="text-right">
          <div class="text-h6 font-weight-black text-primary">
            {{ props.customer.totalStamps }}
          </div>
          <div class="text-caption text-medium-emphasis">
            {{ props.customer.totalStamps === 1 ? 'sello' : 'sellos' }}
          </div>
        </div>
      </div>

      <div class="d-flex align-center justify-space-between gap-2">
        <div class="d-flex align-center gap-1">
          <VIcon
            icon="tabler-clock"
            size="13"
            color="secondary"
          />
          <span class="text-caption text-medium-emphasis">
            {{ props.customer.lastVisitAt ? timeAgo(props.customer.lastVisitAt) : 'Sin visitas registradas' }}
          </span>
        </div>
        <div class="d-flex align-center gap-1">
          <VIcon
            icon="tabler-gift"
            size="13"
            color="success"
          />
          <span class="text-caption text-medium-emphasis">
            {{ props.customer.totalRedemptions }} {{ props.customer.totalRedemptions === 1 ? 'canje' : 'canjes' }}
          </span>
        </div>
      </div>
    </VCardText>
  </VCard>
</template>

<style scoped>
.customer-card {
  transition: box-shadow 0.2s ease;
}
</style>
