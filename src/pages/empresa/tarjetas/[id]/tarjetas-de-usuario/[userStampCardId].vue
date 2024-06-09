<script setup lang="ts">
import Swal from 'sweetalert2'
import { useRoute } from 'vue-router'
import { getUserStampCardByIdAsCurrentCompany, redeemRewardAsCompany } from '@/services/company/userStampCards'

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Owner'],
  },
})

const route: any = useRoute()
const router = useRouter()

// const router = useRouter()

const data: any = ref({})

const getData = async () => {
  try {
    data.value = await getUserStampCardByIdAsCurrentCompany(route.params.userStampCardId)
  }
  catch (error: any) {
    console.error('Error getting data:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: Array.isArray(error) ? error.join('\n') : error,
    })
  }
}

const redeemReward = async () => {
  try {
    const payload = {
      user_stamp_card_id: route.params.userStampCardId,
    }

    await redeemRewardAsCompany(payload)

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
    console.error('Error redeeming reward:', error)
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
        {{ data?.user?.first_name }} {{ data?.user?.last_name }}
      </VCardText>
      <div v-if="!data?.is_reward_redeemed && data?.is_completed">
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
        v-if="data?.stamp_card"
        :business-name="data?.stamp_card?.business.name"
        :reward="data?.stamp_card?.reward"
        :description="data?.stamp_card?.description"
        :required-stamps="data?.stamp_card?.required_stamps"
        :visits-count="data?.visits_count"
        :business-image="data?.stamp_card?.business?.logo_path"
        :start-date="data?.stamp_card?.start_date"
        :end-date="data?.stamp_card?.end_date"
        :stamp-icon="data?.stamp_card?.stamp_icon_path"
        :visits="data?.visits"
      />
    </VCol>
  </VRow>
  <!-- 👉 Fin de StampCard Details  -->

  <!-- 👉 Visitas  -->
  <div v-if="data?.visits">
    <VRow>
      <VCol cols="12">
        <VCardText class="text-center pt-5">
          <h5 class="text-h5">
            Visitas
          </h5>
        </VCardText>
        <VisitListSimple :visits="data?.visits" />
      </VCol>
    </VRow>
  </div>
  <!-- Fin de Visitas  -->
</template>
