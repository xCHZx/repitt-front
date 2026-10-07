<script setup lang="ts">
import EventLog from '@/components/crm/EventLog.vue'
import { useBusinessStore } from '@/stores/business'

// Event log of one card (guide §4.A.8, `GET …/events?cardId=`).

definePage({
  meta: {
    layout: 'company',
    area: 'business',
    ownerOnly: true,
  },
})

const route = useRoute()
const router = useRouter()
const business = useBusinessStore()

// The card belongs to the business that was active: on a switch, go back to the card list
watch(() => business.activeId, (id, previous) => {
  if (previous && id !== previous)
    router.replace('/empresa/tarjetas')
})

const cardId = computed(() => {
  const params = route.params as Record<string, string | string[] | undefined>
  const id = params.id

  return typeof id === 'string' ? id : undefined
})
</script>

<template>
  <div>
    <div class="section-label mb-3">
      <VIcon
        icon="tabler-history"
        size="15"
      />
      Movimientos de la tarjeta
    </div>
    <EventLog
      :key="cardId"
      :fixed-card-id="cardId"
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
