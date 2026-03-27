<script setup lang="ts">
import Swal from 'sweetalert2'
import { useRoute } from 'vue-router'
import { getUserStampCardByIdAsCurrentCompany, redeemRewardAsCompany } from '@/services/company/userStampCards'
import { useCompanyStore } from '@/stores/company'

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Owner'],
    layout: 'company',
  },
})

const route: any = useRoute()
const router = useRouter()
const companyStore = useCompanyStore()

const data: any = ref({})

const getData = async () => {
  if (!companyStore.selectedCompany?.id)
    return
  try {
    data.value = await getUserStampCardByIdAsCurrentCompany(companyStore.selectedCompany.id, route.params.userStampCardId)
  }
  catch (error: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: Array.isArray(error) ? error.join('\n') : error,
    })
  }
}

const redeemReward = async () => {
  try {
    await redeemRewardAsCompany(companyStore.selectedCompany.id, route.params.userStampCardId)

    Swal.fire({
      icon: 'success',
      title: '¡Listo!',
      text: 'Recompensa redimida con éxito',
    }).then(async result => {
      if (result.isConfirmed || result.isDismissed)
        router.push('/empresa/')
    })
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
    <!-- 👉 StampCard Details  -->
    <VCol cols="12">
      <div>
        <VCardText class="text-center ma-0 px-0 py-4">
          <VAlert
            color="warning"
            icon="tabler-alert-triangle"
            variant="tonal"
            density="compact"
            style="white-space: normal;"
          >
            <p class="mb-0">
              Viendo esta tarjeta cómo <strong>negocio</strong>
            </p>
          </VAlert>
        </VCardText>
      </div>

      <VCardText class="text-center text-h4 font-weight-bold ma-0 pa-0">
        {{ data?.customer?.firstName }} {{ data?.customer?.lastName }}
      </VCardText>
      <div v-if="data?.isCompleted && !data?.isRewardRedeemed">
        <VCardText class="text-center">
          <VBtn
            prepend-icon="tabler-gift"
            color="warning"
            block
            @click="redeemReward"
          >
            Redimir recompensa
          </VBtn>
        </VCardText>
      </div>

      <StampCardDetailsAsVisitor
        v-if="data?.stampCard"
        :business-name="data?.business?.name"
        :reward="data?.stampCard?.reward ?? null"
        :description="data?.stampCard?.description ?? null"
        :required-stamps="data?.stampCard?.requiredStamps"
        :visits-count="data?.visitsCount"
        :business-image="data?.business?.logoPath"
        :start-date="data?.stampCard?.startDate ?? null"
        :end-date="data?.stampCard?.endDate ?? null"
        :stamp-icon="data?.stampCard?.stampIconPath"
        :primary-color="data?.stampCard?.primaryColor ?? null"
        :is-active="data?.stampCard?.isActive"
        :is-completed="data?.isCompleted"
        :is-reward-redeemed="data?.isRewardRedeemed"
        :visits="data?.visits"
        company-view
      />
    </VCol>
  </VRow>
  <!-- 👉 Fin de StampCard Details  -->

</template>
