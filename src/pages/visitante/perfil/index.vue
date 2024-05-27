<script lang="ts" setup>
import Swal from 'sweetalert2'
import { getCurrentVisitorData } from '@/services/visitor/users'

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Visitor', 'Owner'],
  },
})

const data: any = ref({})

const getData = async () => {
  try {
    data.value = await getCurrentVisitorData()
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
