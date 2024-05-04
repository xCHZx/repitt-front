<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { getAllByCurrentCompany } from '@/services/company/businesses'

const router = useRouter()

const data: any = ref({})

const getData = async () => {
  try {
    data.value = await getAllByCurrentCompany()
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

  router.push(`/empresa/negocios/${id}`)
}
</script>

<template>
  <div>
    <div v-if="data">
      <div
        v-for="business in data"
        :key="business"
        class="mb-6"
      >
        <!-- 👉 VCard Rewards -->
        <BusinessListItem
          :image="business.logo_path"
          :business-name="business.name"
          :segment="business.segment.name"
          :description="business.description"
          @click="goToCard(business.id)"
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
