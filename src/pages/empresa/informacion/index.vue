<script setup lang="ts">
import Swal from 'sweetalert2'
import { getBusinessByIdAsCurrentCompany, publishBusiness, unpublishBusiness } from '@/services/company/businesses'
import { useCompanyStore } from '@/stores/company'

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Owner'],
  },
})

const companyStore = useCompanyStore()
const router = useRouter()

const data: any = ref({})
const businessId = companyStore.selectedCompany.id

const getData = async () => {
  try {
    data.value = await getBusinessByIdAsCurrentCompany(businessId ?? 0)
  }
  catch (error: any) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: Array.isArray(error) ? error.join('\n') : error,
    })
  }
}

const goToEditBusiness = () => {
  console.log('goToEditBusiness')

  router.push('/empresa/editar')
}

const goToPublishBusiness = async (id: number) => {
  console.log('goToPublishBusiness')

  try {
    await publishBusiness(id)

    Swal.fire({
      icon: 'success',
      title: 'Negocio activado',
      text: 'Tu negocio ha sido activado correctamente.',
    }).then(async result => {
      if (result.isConfirmed || result.isDismissed) {
        await router.push('/empresa')
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

const goToUnpublishBusiness = async (id: number) => {
  console.log('goToUnpublishBusiness')
  try {
    await unpublishBusiness(id)

    Swal.fire({
      icon: 'success',
      title: 'Negocio desactivado',
      text: 'Tu negocio ha sido desactivado correctamente.',
    }).then(async result => {
      if (result.isConfirmed || result.isDismissed) {
        await router.push('/empresa')
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
      <div v-if="data?.is_active">
        <VAlert
          color="success"
          icon="tabler-eye"
          variant="tonal"
          density="compact"
          style="white-space: normal;"
          class="pb-2 text-left mb-6 mt-2"
        >
          <p class="mb-0">
            Tu negocio está <strong>ACTIVO.</strong>
          </p>
        </VAlert>
      </div>
      <div v-else>
        <VAlert
          color="error"
          icon="tabler-alert-triangle"
          variant="tonal"
          density="compact"
          style="white-space: normal;"
          class="pb-2 text-left mb-6 mt-2"
        >
          <p class="mb-0">
            Tu negocio está <strong>INACTIVO.</strong>
          </p>
        </VAlert>
      </div>
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
      <div
        v-if="data?.is_active"
        class="mt-4"
      >
        <VBtn
          block
          size="small"
          color="error"
          @click="goToUnpublishBusiness(data?.id)"
        >
          Desactivar Negocio
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
          @click="goToPublishBusiness(data?.id)"
        >
          Activar Negocio
          <VIcon
            end
            icon="tabler-circle-check"
          />
        </VBtn>
      </div>
    </VCol>
  </VRow>
</template>
