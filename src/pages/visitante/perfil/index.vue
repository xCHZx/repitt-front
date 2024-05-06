<script lang="ts" setup>
import { getCurrentVisitorData } from '@/services/visitor/users'

definePage({
  meta: {
    requiresAuth: true,
  },
})

const data: any = ref({})

const getData = async () => {
  try {
    data.value = await getCurrentVisitorData()
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
      <ProfileDetails
        :first-name="data?.first_name"
        :last-name="data?.last_name"
        :email="data?.email"
        :phone="data?.phone"
        :repitt-code="data?.repitt_code"
        :visits-count="data?.visits_count"
        :account-status="data?.account_status?.name"
        :has-verified-email="data?.has_verified_email"
        :qr-path="data?.qr_path"
      />
    </VCol>
  </VRow>
</template>
