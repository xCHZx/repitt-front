<script setup lang="ts">
import { useRouter } from 'vue-router'
import { getAllByCurrentVisitor } from '@/services/visitor/stampCards'

const router = useRouter()

const data: any = ref({})

const getData = async () => {
  try {
    data.value = await getAllByCurrentVisitor()
  }
  catch (error) {
    console.error('Error getting data:', error)
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
    <div v-if="data">
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
      <h1>
        Sin datos disponibles
      </h1>
    </div>
  </div>
</template>
