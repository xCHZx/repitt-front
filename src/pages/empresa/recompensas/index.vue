<script lang = "ts" setup>
import Swal from 'sweetalert2'
import { getUserStampCardReadyToRedeemAsCurrentCompany } from '@/services/company/userStampCards'
import { useCompanyStore } from '@/stores/company'

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Owner'],
  },
})

const router = useRouter()

const data: any = ref([])

const companyStore = useCompanyStore()
const businessId = companyStore.selectedCompany.id

const getData = async () => {
  try {
    const payload = {
      business_id: businessId ?? 0,
    }

    data.value = await getUserStampCardReadyToRedeemAsCurrentCompany(payload)
  }
  catch (error: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: Array.isArray(error) ? error.join('\n') : error,
    })
  }
}

const goToCard = (stampCardId: string, userStampCardId: string) => {
  router.push(`/empresa/tarjetas/${stampCardId}/tarjetas-de-usuario/${userStampCardId}`)
}

onMounted(() => {
  getData()
})
</script>

<template>
  <div
    v-if="data.length === 0"
    class="d-flex flex-column align-center justify-center"
  >
    <VIcon
      icon="tabler-gift-off"
      size="50"
      color="primary"
    />
    <VCardText class="text-center text-h4 font-weight-medium mt-2">
      No hay recompensas listas para redimir
    </VCardText>
  </div>
  <UserStampCardWaitingRedeemListAsCompany
    v-for="(item, index) in data"
    :key="index"
    :title="item.stamp_card.reward"
    :description="item.stamp_card.name"
    icon="tabler-gift"
    :completed-date="item.completed_at"
    :linked-user="`${item.user.first_name} ${item.user.last_name}`"
    accent-color="#E0D9FF"
    text-accent-color="#493599"
    class="mt-2"
    @click="goToCard(item.stamp_card.id, item.id)"
  />
</template>
