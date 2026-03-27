<script lang="ts" setup>
import { getStampCardByIdAsCurrentCompany, setStampCardActiveStatus } from '@/services/company/stampCards'
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
const data: any = ref(null)

const getData = async () => {
  try {
    data.value = await getStampCardByIdAsCurrentCompany(companyStore.selectedCompany.id, route.params.id)
  }
  catch {
    // silently ignore — user stays on page with no data shown
  }
}

const toggleActive = async () => {
  const newState = !data.value?.isActive
  try {
    await setStampCardActiveStatus(companyStore.selectedCompany.id, data.value.id, newState)
    data.value = { ...data.value, isActive: newState }
  }
  catch {
    // silently ignore
  }
}

onMounted(() => getData())
</script>

<template>
  <StampCardDetailsAsCompany
    v-if="data?.id"
    :stamp-card-name="data?.name"
    :description="data?.description"
    :reward="data?.reward"
    :required-stamps="data?.requiredStamps"
    :visits-count="data?.visitsCount"
    :stamp-icon="data?.stampIconPath"
    :primary-color="data?.primaryColor"
    :start-date="data?.startDate"
    :end-date="data?.endDate"
    :require-otp="data?.requireOtp"
    :is-active="data?.isActive"
    @toggle-active="toggleActive"
    @go-visits="router.push(`/empresa/tarjetas/${data.id}/visitas`)"
    @go-edit="router.push(`/empresa/tarjetas/${data.id}/editar`)"
    @go-register="router.push(`/empresa/visitas/registrar`)"
  />
</template>
