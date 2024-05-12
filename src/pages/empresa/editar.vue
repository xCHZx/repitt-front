<script lang="ts" setup>
import Swal from 'sweetalert2'
import { updateBusinessAsCurrentCompany } from '@/services/company/businesses'
import { getAllSegments } from '@/services/utils/utils'
import { useCompanyStore } from '@/stores/company'

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Owner'],
  },
})

const router = useRouter()

const companyStore = useCompanyStore()

const name = ref(companyStore.selectedCompany.name)
const segment = ref(companyStore.selectedCompany.segment.id)
const description = ref(companyStore.selectedCompany.description)
const address = ref(companyStore.selectedCompany.address)
const phone = ref(companyStore.selectedCompany.phone)
const openingHours = ref(companyStore.selectedCompany.opening_hours)

const logo = ref<File[]>()

const segmentsList = ref(
  [
    {
      title: 'Cargando segmentos...',
      value: null,
    },
  ],
)

const getSegments = async () => {
  try {
    const response = await getAllSegments()

    segmentsList.value = response.map((segmentItem: any) => ({
      title: segmentItem.name,
      value: segmentItem.id,
    }))
  }
  catch (error) {
    console.error('Error getting segments:', error)
  }
}

const onSubmit = async () => {
  console.log('Updating business...')

  const payload = {
    name: name.value,
    description: description.value,
    address: address.value,
    phone: phone.value,
    segment: segment.value,
    opening_hours: openingHours.value,
    logo_file: logo.value && logo.value.length > 0 ? logo.value[0] : null,
  }

  // Call API to create business
  try {
    await updateBusinessAsCurrentCompany(companyStore.selectedCompany.id as unknown as number, payload)
    companyStore.refreshCompany(companyStore.selectedCompany.id)
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: 'Negocio actualizado correctamente.',
    }).then(async result => {
      if (result.isConfirmed || result.isDismissed)
        router.push('/empresa/informacion')
    })
  }
  catch (error: any) {
    console.error('Error creating business:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.join('\n'),
    })
  }
}

onMounted(() => {
  getSegments()
})
</script>

<template>
  <div>
    <h2>Editar Negocio - {{ companyStore.selectedCompany.name }}</h2>
  </div>

  <div>
    <VForm @submit.prevent="onSubmit">
      <VCol cols="12">
        <VTextField
          v-model="name"
          variant="outlined"
          prepend-icon="tabler-building-store"
          label="Nombre del Negocio *"
          placeholder="..."
        />
      </VCol>
      <VCol cols="12">
        <VSelect
          v-model="segment"
          :items="segmentsList"
          label="Giro del Negocio *"
          prepend-icon="tabler-tag"
        />
      </VCol>
      <VCol cols="12">
        <VTextField
          v-model="description"
          variant="outlined"
          prepend-icon="tabler-text-plus"
          label="Descripción"
          placeholder="..."
        />
      </VCol>
      <VCol cols="12">
        <VTextField
          v-model="address"
          variant="outlined"
          prepend-icon="tabler-map-pin"
          label="Dirección"
          placeholder="..."
        />
      </VCol>
      <VCol cols="12">
        <VTextField
          v-model="phone"
          variant="outlined"
          prepend-icon="tabler-phone"
          label="Teléfono"
          placeholder="..."
        />
      </VCol>

      <VCol cols="12">
        <VTextField
          v-model="openingHours"
          variant="outlined"
          prepend-icon="tabler-clock"
          label="Horario de atención"
          placeholder="..."
        />
      </VCol>
      <VCol cols="12">
        <VFileInput
          v-model="logo"
          chips
          show-size
          accept="image/*"
          placeholder="..."
          prepend-icon="tabler-photo-up"
          label="Actualizar Logo"
        />
        <div class="mx-8 mt-5">
          <div>
            Logo actual:
          </div>
          <VImg
            v-if="companyStore.selectedCompany.logo_path"
            :src="companyStore.selectedCompany.logo_path"
            width="50"
            height="50"
            class="mt-3"
          />
        </div>
      </VCol>
      <VCol cols="12">
        <VBtn
          type="submit"
          color="primary"
          class="mt-3"
        >
          Guardar
        </VBtn>
      </VCol>
    </VForm>
  </div>
</template>
