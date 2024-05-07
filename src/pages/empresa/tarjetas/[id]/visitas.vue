<script setup lang="ts">
import { getAllByStampCardAsCurrentCompany } from '@/services/company/visits'

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Owner'],
  },
})

const route: any = useRoute()

const data: any = ref({})

const getData = async () => {
  try {
    data.value = await getAllByStampCardAsCurrentCompany(route.params.id)
  }
  catch (error) {
    console.error('Error getting data:', error)
  }
}

onMounted(() => {
  getData()
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCardText class="text-center text-h3 font-weight-bold">
        Historial de Visitas
      </VCardText>
      <VCardText class="text-center text-h5 font-weight-bold">
        {{ data?.name || 'No disponible' }}
      </VCardText>
      <div>
        <VRow>
          <VCol cols="12">
            <VCardText class="text-center pt-2">
              <h5 class="text-h5">
                Total de Visitas: {{ data?.visits_count || 'No disponible' }}
              </h5>
            </VCardText>
            <CompanyVisitListItemFull
              v-if="data?.visits_count >= 1"
              :business-logo="data?.business?.logo_path"
              :business-name="data?.business?.name"
              :visits="data?.visits"
            />
          </VCol>
        </VRow>
      </div>
    </VCol>
  </VRow>
</template>
