<script setup lang="ts">
import { getByIdByCurrentCompany } from '@/services/company/businesses'
import { useCompanyStore } from '@/stores/company'

const companyStore = useCompanyStore()

const data: any = ref({})
const businessId = companyStore.selectedCompany?.id

const getData = async () => {
  try {
    data.value = await getByIdByCurrentCompany(businessId)
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
      <BusinessDetails
        :name="data?.name"
        :description="data?.description"
        :address="data?.address"
        :phone="data?.phone"
        :segment="data?.segment?.name"
        :opening-hours="data?.opening_hours"
        :logo-path="data?.logo_path"
        :created-at="data?.created_at"
      />
    </VCol>
  </VRow>
</template>
