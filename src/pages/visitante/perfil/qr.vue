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

const route = useRoute()
const router = useRouter()
const data = ref<any>(null)

const stampCardContext = computed(() => route.query.sc as string | undefined)

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
  <div>
    <!-- Banner contextual cuando viene de un negocio -->
    <VCard
      v-if="stampCardContext"
      rounded="xl"
      color="primary"
      variant="tonal"
      class="mb-4"
    >
      <VCardText class="pa-3 d-flex align-center justify-space-between">
        <div class="d-flex align-center gap-2">
          <VIcon
            icon="tabler-rosette-discount"
            size="18"
            color="primary"
          />
          <div>
            <div class="text-caption text-medium-emphasis">
              Sellando tarjeta
            </div>
            <div class="text-body-2 font-weight-bold">
              {{ stampCardContext }}
            </div>
          </div>
        </div>
        <VBtn
          icon
          variant="text"
          size="small"
          @click="router.back()"
        >
          <VIcon icon="tabler-x" size="18" />
        </VBtn>
      </VCardText>
    </VCard>

    <UserQrCard
      :first-name="data?.firstName"
      :last-name="data?.lastName"
      :qr-path="data?.qrPath"
      :repitt-code="data?.repittCode"
    />
  </div>
</template>
