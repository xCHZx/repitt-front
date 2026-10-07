<!-- Paywall / trial / grace banner for the active business (guide §3.2). -->
<script setup lang="ts">
import { useBusinessStore } from '@/stores/business'
import { entitlementNotice } from '@/utils/entitlement'

const business = useBusinessStore()

const notice = computed(() => entitlementNotice(business.entitlement, business.role, business.timezone))

const color = computed(() => notice.value?.tone === 'error' ? 'error' : notice.value?.tone === 'warning' ? 'warning' : 'primary')
</script>

<template>
  <VAlert
    v-if="notice"
    :color="color"
    variant="tonal"
    rounded="lg"
    density="compact"
    :icon="notice.tone === 'info' ? 'tabler-info-circle' : 'tabler-alert-triangle'"
  >
    <div class="d-flex flex-wrap align-center gap-2">
      <span class="flex-grow-1">{{ notice.text }}</span>
      <VBtn
        v-if="notice.showPlans || notice.showPortal"
        size="small"
        variant="flat"
        :color="color"
        to="/empresa/planes"
      >
        {{ notice.showPortal ? 'Ver pagos' : 'Ver planes' }}
      </VBtn>
    </div>
  </VAlert>
</template>
