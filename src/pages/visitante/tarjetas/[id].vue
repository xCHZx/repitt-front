<script setup lang="ts">
import Swal from 'sweetalert2'
import { getUserStampCardByIdAsVisitor } from '@/services/visitor/userStampCards'

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Visitor', 'Owner'],
    layout: 'visitor',
  },
})

const route = useRoute()
const data = ref<any>(null)

const getData = async () => {
  try {
    data.value = await getUserStampCardByIdAsVisitor(route.params.id as string)
  }
  catch (error: any) {
    Swal.fire({ icon: 'error', title: 'Error', text: String(error) })
  }
}

onMounted(() => {
  getData()
})
</script>

<template>
  <StampCardDetailsAsVisitor
    v-if="data?.stampCard"
    :business-name="data?.business?.name"
    :reward="data?.stampCard?.reward"
    :description="data?.stampCard?.description"
    :required-stamps="data?.stampCard?.requiredStamps"
    :visits-count="data?.visitsCount"
    :business-image="data?.business?.logoPath"
    :start-date="data?.stampCard?.startDate"
    :end-date="data?.stampCard?.endDate"
    :stamp-icon="data?.stampCard?.stampIconPath"
    :primary-color="data?.stampCard?.primaryColor"
    :is-completed="data?.isCompleted"
    :is-reward-redeemed="data?.isRewardRedeemed"
    :is-active="data?.isActive"
    :visits="data?.visits"
    :qr-path="data?.qrPath"
  />
</template>
