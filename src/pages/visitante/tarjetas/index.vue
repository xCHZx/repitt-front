<script setup lang="ts">
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'
import { getAllByCurrentVisitor } from '@/services/visitor/stampCards'

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
    data.value = await getAllByCurrentVisitor()
  }
  catch (error: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.join('\n'),
    })
  }
}

onMounted(() => {
  getData()
})

const goToCard = (id: number) => {
  console.log('goToCard', id)

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
          :business-name="stampCard.business.name"
          :segment="stampCard.business.segment.name"
          :reward="stampCard.reward"
          :visits-count="stampCard.visits_count"
          :required-stamps="stampCard.required_stamps"
          :image="stampCard.business.logo_path"
          @click="goToCard(stampCard.id)"
        />
      </div>
    </div>
    <div v-else>
      <div class="text-h4">
        Sin datos disponibles
      </div>
    </div>
  </div>
</template>
