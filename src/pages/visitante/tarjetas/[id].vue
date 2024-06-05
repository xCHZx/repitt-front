<script setup lang="ts">
import Swal from 'sweetalert2'
import { useRoute } from 'vue-router'
import { getStampCardByIdAsVisitor } from '@/services/visitor/stampCards'

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Visitor', 'Owner'],
  },
})

const route: any = useRoute()
const router = useRouter()

const data: any = ref({})

const getData = async () => {
  try {
    data.value = await getStampCardByIdAsVisitor(route.params.id)
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

const goToQr = (stampCardName: string) => {
  router.push(`/visitante/perfil/qr?sc=${stampCardName}`)
}

const reloadPage = () => {
  location.reload()
}

onMounted(() => {
  getData()
})
</script>

<template>
  <VRow>
    <!-- 👉 StampCard Details  -->
    <VCol cols="12">
      <div v-if="!data?.is_active">
        <VCardText class="text-center ma-0 px-0 py-4">
          <VAlert
            color="error"
            icon="tabler-alert-triangle"
            variant="tonal"
            density="compact"
            style="white-space: normal;"
          >
            <p class="mb-0">
              Esta tarjeta se ha <strong>desactivado</strong> por el negocio 😓
            </p>
          </VAlert>
        </VCardText>
      </div>

      <StampCardDetailsAsVisitor
        v-if="data?.stamp_card"
        :business-name="data?.stamp_card?.business.name"
        :reward="data?.stamp_card?.reward"
        :description="data?.stamp_card?.description"
        :required-stamps="data?.stamp_card?.required_stamps"
        :visits-count="data?.visits_count"
        :business-image="data?.stamp_card.business.logo_path"
        :start-date="data?.stamp_card?.start_date"
        :end-date="data?.stamp_card?.end_date"
        :stamp-icon="data?.stamp_card?.stamp_icon_path"
        :visits="data?.stamp_card?.visits"
      />
      <div v-if="data?.stamp_card?.is_active">
        <VCardText class="text-center">
          <VBtn
            block
            @click="goToQr(data?.stamp_card?.name)"
          >
            Sellar tarjeta
          </VBtn>
        </VCardText>
        <VCardText class="text-center">
          <VBtn
            block
            size="small"
            color="secondary"
            prepend-icon="tabler-reload"
            variant="outlined"
            @click="reloadPage"
          >
            Actualizar
          </VBtn>
        </VCardText>
      </div>
    </VCol>
  </VRow>
  <!-- 👉 Fin de StampCard Details  -->

  <!-- 👉 Visitas  -->
  <div v-if="data?.visits_count >= 1">
    <VRow>
      <VCol cols="12">
        <VCardText class="text-center pt-5">
          <h5 class="text-h5">
            Visitas
          </h5>
        </VCardText>
        <VisitListSimple :visits="data?.stamp_card?.visits" />
      </VCol>
    </VRow>
  </div>
  <!-- Fin de Visitas  -->
</template>
