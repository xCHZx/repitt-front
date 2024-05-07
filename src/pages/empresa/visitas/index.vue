<script setup lang="ts">
import { getAllByBusinessAsCurrentCompany } from '@/services/company/visits'
import { useCompanyStore } from '@/stores/company'

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Owner'],
  },
})

const companyStore = useCompanyStore()

const data: any = ref({})

const getData = async () => {
  try {
    data.value = await getAllByBusinessAsCurrentCompany(companyStore.company.id ?? 0)
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
        {{ companyStore.selectedCompany.name || 'No disponible' }}
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
              :business-logo="data?.logo_path"
              :business-name="data?.name"
              :visits="data?.visits"
            />
          </VCol>
        </VRow>
      </div>
    </VCol>
  </VRow>
</template>
