<script lang="ts" setup>
import Swal from 'sweetalert2'
import { getStampCardByIdAsCurrentCompany, publishStampCard, unpublishStampCard } from '@/services/company/stampCards'

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Owner'],
  },
})

const route: any = useRoute()
const router = useRouter()

const data: any = ref({})

const getData = async () => {
  try {
    data.value = await getStampCardByIdAsCurrentCompany(route.params.id)
  }
  catch (error: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: Array.isArray(error) ? error.join('\n') : error,
    })
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

const goToPublishStampCard = async (stampCardId: number) => {
  try {
    await publishStampCard(stampCardId)

    Swal.fire({
      icon: 'success',
      title: 'Tarjeta activada',
      text: 'Tu tarjeta ha sido activada correctamente.',
    }).then(async result => {
      if (result.isConfirmed || result.isDismissed) {
        await router.push('/empresa/tarjetas')
        location.reload()
      }
    })
  }
  catch (error: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: Array.isArray(error) ? error.join('\n') : error,
    })
  }
}

const goToUnpublishStampCard = async (stampCardId: number) => {
  try {
    await unpublishStampCard(stampCardId)

    Swal.fire({
      icon: 'success',
      title: 'Tarjeta desactivada',
      text: 'Tu tarjeta ha sido desactivada correctamente.',
    }).then(async result => {
      if (result.isConfirmed || result.isDismissed) {
        await router.push('/empresa/tarjetas')
        location.reload()
      }
    })
  }
  catch (error: any) {
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
      <div v-if="data?.is_active">
        <VCardText class="text-center ma-0 px-0 py-4">
          <VAlert
            color="success"
            icon="tabler-eye"
            variant="tonal"
            density="compact"
            style="white-space: normal;"
          >
            <p class="mb-0">
              Tarjeta de sellos <strong>ACTIVA.</strong>
            </p>
          </VAlert>
        </VCardText>
      </div>
      <div v-else>
        <VCardText class="text-center ma-0 px-0 py-4">
          <VAlert
            color="error"
            icon="tabler-alert-triangle"
            variant="tonal"
            density="compact"
            style="white-space: normal;"
          >
            <p class="mb-0">
              Tarjeta de sellos <strong>INACTIVA.</strong>
            </p>
          </VAlert>
        </VCardText>
      </div>
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
      <div
        v-if="data?.is_active"
        class="mt-4"
      >
        <VBtn
          block
          size="small"
          color="error"
          @click="goToUnpublishStampCard(data?.id)"
        >
          Desactivar Tarjeta
          <VIcon
            end
            icon="tabler-circle-x"
          />
        </VBtn>
      </div>
      <div
        v-else
        class="mt-4"
      >
        <VBtn
          block
          size="small"
          color="success"
          @click="goToPublishStampCard(data?.id)"
        >
          Activar Tarjeta
          <VIcon
            end
            icon="tabler-circle-check"
          />
        </VBtn>
      </div>
      <VCardText
        v-if="data?.is_active"
        class="text-center"
      >
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
