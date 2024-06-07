<script setup lang="ts">
import { useRouter } from 'vue-router'
import { getAllUserStampCardsByCurrentVisitor } from '@/services/visitor/userStampCards'

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Visitor', 'Owner'],
  },
})

const router = useRouter()

const data: any = ref({})

const getData = async () => {
  try {
    data.value = await getAllUserStampCardsByCurrentVisitor()
  }
  catch (error: any) {
    console.error('Error getting data:', error)

    // Swal.fire({
    //   icon: 'error',
    //   title: 'Error',
    //   text: Array.isArray(error) ? error.join('\n') : error,
    // })
  }
}

onMounted(() => {
  getData()
})

const goToCard = (id: number) => {
  router.push(`/visitante/tarjetas/${id}`)
}
</script>

<template>
  <div>
    <div v-if="data && data.length > 0">
      <div
        v-for="stampCard in data"
        :key="stampCard"
        class="mb-6"
      >
        <!-- 👉 VCard Rewards -->
        <StampCardListItem
          :business-name="stampCard.stamp_card.business.name"
          :segment="stampCard.stamp_card.business.segment.name"
          :reward="stampCard.stamp_card.reward"
          :visits-count="stampCard.visits_count"
          :required-stamps="stampCard.stamp_card.required_stamps"
          :image="stampCard.stamp_card.business.logo_path"
          :disabled="!stampCard.stamp_card.is_active || !stampCard.is_active"
          :is-completed="stampCard.is_completed"
          :is-redeemed="stampCard.is_reward_redeemed"
          @click="goToCard(stampCard.id)"
        />
      </div>
    </div>
    <div v-else>
      <VCardText class="text-center pt-2">
        <h5 class="text-h5">
          No hay tarjetas para mostrar
        </h5>
      </VCardText>
    </div>
  </div>
</template>
