<script setup lang="ts">
import { getByIdByCurrentCompany } from '@/services/company/businesses'
import { useCompanyStore } from '@/stores/company'

const companyStore = useCompanyStore()
const router = useRouter()

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

const goToEditBusiness = () => {
  console.log('goToEditBusiness')

  router.push('/empresa/editar')
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
      <div class="mt-4">
        <VBtn
          block
          size="small"
          @click="goToEditBusiness"
        >
          Editar
          <VIcon
            end
            icon="tabler-edit"
          />
        </VBtn>
      </div>
    </VCol>
  </VRow>
</template>
