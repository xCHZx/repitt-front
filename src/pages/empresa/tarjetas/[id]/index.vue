<script lang="ts" setup>
import { getByIdAsCurrentCompany } from '@/services/company/stampCards'

definePage({
  meta: {
    requiresAuth: true,
  },
})

const route: any = useRoute()
const router = useRouter()

const data: any = ref({})

const getData = async () => {
  try {
    data.value = await getByIdAsCurrentCompany(route.params.id)
  }
  catch (error) {
    console.error('Error getting data:', error)
  }
}

const goToQr = (stampCardId: number) => {
  router.push(`/empresa/visitas/registrar?sc=${stampCardId}`)
}

const goToVisitsOfStampCard = (stampCardId: number) => {
  router.push(`/empresa/tarjetas/${stampCardId}/visitas`)
}

const goToEditStampCard = (stampCardId: number) => {
  router.push(`/empresa/tarjetas/${stampCardId}/editar`)
}

onMounted(() => {
  getData()
})
</script>

<template>
  <VRow>
    <!-- 👉 StampCard Details  -->
    <VCol cols="12">
      <StampCardDetailsAsCompany
        v-if="data?.business"
        :business-image="data?.business?.logo_path"
        :business-name="data?.business?.name"
        :stamp-card-name="data?.name"
        :reward="data?.reward"
        :required-stamps="data?.required_stamps"
        :stamp-icon="data?.stamp_icon_path"
        :description="data?.description"
        :start-date="data?.start_date"
        :end-date="data?.end_date"
        :visits-count="data?.visits_count"
      />
      <VCardText class="text-center">
        <VBtn
          block
          color="success"
          @click="goToQr(data?.id)"
        >
          Registrar una visita
          <VIcon
            end
            icon="tabler-qrcode"
          />
        </VBtn>
      </VCardText>
      <VCardText class="text-center">
        <VBtn
          block
          size="small"
          color="primary"
          @click="goToVisitsOfStampCard(data?.id)"
        >
          Ver visitas
          <VIcon
            end
            icon="tabler-walk"
          />
        </VBtn>
      </VCardText>
      <VCardText class="text-center">
        <VBtn
          block
          size="small"
          color="secondary"
          @click="goToEditStampCard(data?.id)"
        >
          Editar
          <VIcon
            end
            icon="tabler-edit"
          />
        </VBtn>
      </VCardText>
    </VCol>
  </VRow>
</template>
