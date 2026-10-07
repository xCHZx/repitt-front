<script setup lang="ts">
import EventLog from '@/components/crm/EventLog.vue'

// Event log of the business ("bitácora", guide §4.A.8). Optional ?customerId= / ?cardId= filters.

definePage({
  meta: {
    layout: 'company',
    area: 'business',
    ownerOnly: true,
  },
})

const route = useRoute()

const queryParam = (key: string) => {
  const value = route.query[key]

  return typeof value === 'string' ? value : undefined
}
</script>

<template>
  <div>
    <div class="section-label mb-3">
      <VIcon
        icon="tabler-history"
        size="15"
      />
      Movimientos
    </div>
    <!-- Keyed by the query filters: /empresa/visitas?customerId=… → /empresa/visitas re-seeds them -->
    <EventLog
      :key="`${queryParam('customerId') ?? ''}|${queryParam('cardId') ?? ''}`"
      :initial-customer-id="queryParam('customerId')"
      :initial-card-id="queryParam('cardId')"
    />
  </div>
</template>

<style scoped>
.section-label {
  display: flex;
  align-items: center;
  color: rgb(var(--v-theme-primary));
  font-size: 0.78rem;
  font-weight: 700;
  gap: 5px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
</style>
