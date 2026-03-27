<script setup lang="ts">
import { getAllUserStampCardsByCurrentVisitor } from '@/services/visitor/userStampCards'

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Visitor', 'Owner'],
    layout: 'visitor',
  },
})

const data = ref<any[]>([])

const getData = async () => {
  try {
    data.value = await getAllUserStampCardsByCurrentVisitor() || []
  }
  catch (error: any) {
    console.error('Error getting data:', error)
  }
}

const redeemable = computed(() =>
  data.value.filter((c: any) => c.isCompleted && !c.isRewardRedeemed),
)

const active = computed(() =>
  data.value.filter((c: any) => !c.isCompleted && !c.isRewardRedeemed && c.isActive && c.stampCard?.isActive),
)

const redeemed = computed(() =>
  data.value.filter((c: any) => c.isRewardRedeemed),
)

onMounted(() => {
  getData()
})
</script>

<template>
  <div>
    <!-- Empty state -->
    <div
      v-if="data.length === 0"
      class="text-center py-12"
    >
      <VIcon
        icon="tabler-cards"
        size="56"
        color="medium-emphasis"
        class="mb-4"
        style="opacity: 0.35;"
      />
      <div class="text-h6 font-weight-bold mb-1">
        Aún no tienes tarjetas
      </div>
      <div class="text-body-2 text-medium-emphasis mb-5">
        Visita un negocio y pide que sellen tu tarjeta
      </div>
      <VBtn
        to="/visitante/negocios"
        variant="tonal"
        color="primary"
        prepend-icon="tabler-map-pin"
      >
        Explorar negocios
      </VBtn>
    </div>

    <template v-else>
      <!-- Canjeables -->
      <template v-if="redeemable.length">
        <div class="section-label text-warning">
          <VIcon icon="tabler-gift" size="15" />
          ¡Listas para canjear!
        </div>
        <div
          v-for="card in redeemable"
          :key="card.id"
          class="mb-3"
        >
          <StampCardListItem
            :business-name="card.business.name"
            :segment="card.business.categoryName"
            :reward="card.stampCard.reward"
            :visits-count="card.visitsCount"
            :required-stamps="card.stampCard.requiredStamps"
            :image="card.business.logoPath"
            :primary-color="card.stampCard.primaryColor"
            :is-completed="card.isCompleted"
            :is-redeemed="card.isRewardRedeemed"
            :to="`/visitante/tarjetas/${card.id}`"
          />
        </div>
      </template>

      <!-- En progreso -->
      <template v-if="active.length">
        <div class="section-label">
          <VIcon icon="tabler-rosette-discount" size="15" />
          En progreso
        </div>
        <div
          v-for="card in active"
          :key="card.id"
          class="mb-3"
        >
          <StampCardListItem
            :business-name="card.business.name"
            :segment="card.business.categoryName"
            :reward="card.stampCard.reward"
            :visits-count="card.visitsCount"
            :required-stamps="card.stampCard.requiredStamps"
            :image="card.business.logoPath"
            :primary-color="card.stampCard.primaryColor"
            :is-completed="card.isCompleted"
            :is-redeemed="card.isRewardRedeemed"
            :to="`/visitante/tarjetas/${card.id}`"
          />
        </div>
      </template>

      <!-- Canjeadas -->
      <template v-if="redeemed.length">
        <div class="section-label text-medium-emphasis">
          <VIcon icon="tabler-check" size="15" />
          Canjeadas
        </div>
        <div
          v-for="card in redeemed"
          :key="card.id"
          class="mb-3"
        >
          <StampCardListItem
            :business-name="card.business.name"
            :segment="card.business.categoryName"
            :reward="card.stampCard.reward"
            :visits-count="card.visitsCount"
            :required-stamps="card.stampCard.requiredStamps"
            :image="card.business.logoPath"
            :primary-color="card.stampCard.primaryColor"
            :is-completed="card.isCompleted"
            :is-redeemed="card.isRewardRedeemed"
            :disabled="true"
            :to="`/visitante/tarjetas/${card.id}`"
          />
        </div>
      </template>
    </template>
  </div>
</template>

<style scoped>
.section-label {
  display: flex;
  align-items: center;
  font-size: 0.78rem;
  font-weight: 700;
  gap: 5px;
  letter-spacing: 0.04em;
  margin-block-end: 10px;
  text-transform: uppercase;
}

.section-label:not(:first-child) {
  margin-block-start: 24px;
}
</style>
