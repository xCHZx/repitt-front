<script setup lang="ts">
import { useRoute } from 'vue-router'
import { getByIdByCurrentVisitor } from '@/services/visitor/stampCards'

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
    data.value = await getByIdByCurrentVisitor(route.params.id)
  }
  catch (error) {
    console.error('Error getting data:', error)
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
      <StampCardDetailsAsVisitor
        v-if="data?.business"
        :business-name="data?.business.name"
        :reward="data?.reward"
        :required-stamps="data?.required_stamps"
        :visits-count="data?.visits_count"
        :business-image="data?.business.logo_path"
        :start-date="data?.start_date"
        :end-date="data?.end_date"
        :visits="data?.visits"
        :stamp-icon="data?.stamp_icon_path"
      />
      <VCardText class="text-center">
        <VBtn
          block
          @click="goToQr(data?.name)"
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
        <VisitListSimple :visits="data?.visits" />
      </VCol>
    </VRow>
  </div>
  <!-- Fin de Visitas  -->
</template>
