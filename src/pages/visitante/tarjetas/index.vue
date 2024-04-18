<script setup lang="ts">
import { useRouter } from 'vue-router'
import { getAllByCurrentVisitor } from '@/services/stampCards'

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
          :segment="stampCard.business.segment"
          :reward="stampCard.reward"
          :visits-count="stampCard.visits_count"
          :required-stamps="stampCard.required_stamps"
          image="https://i.pinimg.com/originals/aa/92/89/aa9289de1ed2865bccd7c7457f246482.jpg"
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
