<script setup lang="ts">
import { computed } from 'vue'
import type { DescribedError } from '@/api/messages'
import ApiErrorAlert from '@/components/common/ApiErrorAlert.vue'
import { useBusinessStore } from '@/stores/business'

// ApiErrorAlert for counter actions: adds the "Ver planes" link on a 402 for owners (§3.2) and a
// slot for the action buttons of each error (enroll, pending rewards, retry…).

const props = defineProps<{
  error: DescribedError | null | undefined
}>()

const business = useBusinessStore()

const showPlans = computed(() =>
  props.error?.error.code === 'ENTITLEMENT_REQUIRED'
  && business.isOwner
  && props.error.error.detailObj?.reason !== 'suspended',
)
</script>

<template>
  <ApiErrorAlert :error="props.error">
    <div
      v-if="showPlans || $slots.default"
      class="d-flex flex-wrap gap-2 mt-2"
    >
      <VBtn
        v-if="showPlans"
        size="small"
        variant="flat"
        color="error"
        to="/empresa/planes"
      >
        Ver planes
      </VBtn>
      <slot />
    </div>
  </ApiErrorAlert>
</template>
