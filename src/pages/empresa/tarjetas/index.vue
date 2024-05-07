<script setup lang="ts">
import { getAllByIdByCurrentCompany } from '@/services/company/stampCards'
import { useCompanyStore } from '@/stores/company'

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Owner'],
  },
})

const router = useRouter()
const data: any = ref({})
const companyStore = useCompanyStore()

const getData = async () => {
  try {
    data.value = await getAllByIdByCurrentCompany(companyStore.selectedCompany.id)
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

  router.push(`/empresa/tarjetas/${id}`)
}

const goToCreateCard = () => {
  console.log('goToCreateCard')

  router.push('/empresa/tarjetas/crear')
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
        <MainMenuItemList
          :title="stampCard.name"
          :description="stampCard.reward"
          icon="tabler-cards"
          accent-color="#E0D9FF"
          text-accent-color="#493599"
          @click="goToCard(stampCard.id)"
        />
      </div>
    </div>
    <div v-else>
      <h1>
        Sin datos disponibles
      </h1>
    </div>
    <div class="mt-4">
      <VBtn
        block
        color="success"
        size="small"
        @click="goToCreateCard"
      >
        Crear Tarjeta de Recompensas
        <VIcon
          end
          icon="tabler-square-plus"
        />
      </VBtn>
    </div>
  </div>
</template>
