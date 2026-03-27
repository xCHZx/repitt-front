<script lang="ts" setup>
import Swal from 'sweetalert2'
import { getCurrentVisitorData } from '@/services/visitor/users'

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Visitor', 'Owner'],
    layout: 'visitor',
  },
})

const data = ref<any>(null)

const getData = async () => {
  try {
    data.value = await getCurrentVisitorData()
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
  <ProfileDetails
    :first-name="data?.firstName"
    :last-name="data?.lastName"
    :email="data?.email"
    :phone="data?.phone"
    :repitt-code="data?.repittCode"
    :visits-count="data?.visitsCount"
    :account-status="data?.accountStatus?.name"
    :has-verified-email="data?.hasVerifiedEmail"
    :qr-path="data?.qrPath"
    @updated="getData"
  />
</template>
