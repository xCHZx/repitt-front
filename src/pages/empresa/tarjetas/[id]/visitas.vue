<script setup lang="ts">
import Swal from 'sweetalert2'
import { getAllVisitsByStampCardIdAsCurrentCompany } from '@/services/company/visits'
import { useCompanyStore } from '@/stores/company'

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Owner'],
    layout: 'company',
  },
})

const route: any = useRoute()
const companyStore = useCompanyStore()

const data: any = ref({})

const getData = async () => {
  if (!companyStore.selectedCompany?.id)
    return
  try {
    data.value = await getAllVisitsByStampCardIdAsCurrentCompany(companyStore.selectedCompany.id, route.params.id)
  }
  catch (error: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: Array.isArray(error) ? error.join('\n') : error,
    })
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
      <div>
        <VRow>
          <VCol cols="12">
            <VCardText class="text-center pt-2">
              <h5 class="text-h5">
                Total de Visitas: {{ data?.totalVisits ?? 'No disponible' }}
              </h5>
            </VCardText>
            <CompanyVisitListItemFull
              v-if="data?.totalVisits >= 1"
              :stamp-card-id="route.params.id"
              :visits="data?.visits"
            />
          </VCol>
        </VRow>
      </div>
    </VCol>
  </VRow>
</template>
