<script setup lang="ts">
import type { Metrics } from '@/api/types'
import UserWithCountListItem from '@/components/general/UserWithCountListItem.vue'

// Top customers of the period (MetricsDto.topCustomers, ≤ 5).

const props = defineProps<{
  customers: Metrics['topCustomers']
}>()
</script>

<template>
  <VCard rounded="xl">
    <VCardText class="pa-4 pb-2">
      <div class="section-label">
        <VIcon
          icon="tabler-crown"
          size="13"
        />
        Clientes más frecuentes
      </div>
    </VCardText>

    <VList v-if="props.customers.length">
      <template
        v-for="(customer, index) in props.customers"
        :key="customer.customerId"
      >
        <UserWithCountListItem
          :rank="index + 1"
          :display-name="customer.displayName"
          :subtitle="customer.phoneMasked"
          :count="customer.stamps"
          :count-label="customer.stamps === 1 ? 'sello' : 'sellos'"
          :to="`/empresa/clientes/${customer.customerId}`"
        />
        <VDivider v-if="index < props.customers.length - 1" />
      </template>
    </VList>

    <VCardText
      v-else
      class="text-medium-emphasis py-8"
    >
      <VIcon
        icon="tabler-users-group"
        size="36"
        class="empty-icon mb-2 d-block"
      />
      Sin datos para este periodo
    </VCardText>
  </VCard>
</template>

<style scoped>
.empty-icon {
  opacity: 0.3;
}
</style>
