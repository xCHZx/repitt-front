<script lang="ts" setup>
import Swal from 'sweetalert2'
import { getCurrentVisitorData } from '@/services/visitor/users'

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Visitor', 'Owner'],
  },
})

const route: any = useRoute()
const router: any = useRouter()
const data: any = ref({})
const stampCard: any = ref()

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

const getStampCardByQueryParams = async () => {
  try {
    stampCard.value = route.query.sc
  }
  catch (error) {
    console.error('Error getting data:', error)
  }
}

onMounted(() => {
  getData()
  getStampCardByQueryParams()
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <UserQrCard
        :first-name="data?.first_name"
        :last-name="data?.last_name"
        :qr-path="data?.qr_path"
        :repitt-code="data?.repitt_code"
      />
    </VCol>
  </VRow>
  <VRow v-if="$route.query.sc">
    <VCol cols="12">
      <VCard>
        <VCardText class="text-center pt-5">
          <h6 class="text-h6">
            Tarjeta a sellar:
          </h6>
          <h4 class="text-h4">
            {{ stampCard }}
          </h4>
          <VBtn
            block
            size="small"
            color="success"
            prepend-icon="tabler-arrow-left"
            @click="router.back()"
          >
            Regresar
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
