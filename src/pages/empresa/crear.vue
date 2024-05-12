<script lang="ts" setup>
import Swal from 'sweetalert2'
import { createBusinessAsCompany } from '@/services/company/businesses'
import { getAllSegments } from '@/services/utils/utils'

definePage({
  meta: {
    requiresAuth: true,
    requiredRole: ['Owner'],
  },
})

const router = useRouter()

const name = ref('')
const description = ref('')
const address = ref('')
const phone = ref('')
const openingHours = ref('')
const segment = ref('')
const logo = ref<File[]>()

const segmentsList = ref(
  [
    {
      title: 'Cargando categorías...',
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
  console.log('Creating business...')

  const payload = {
    name: name.value,
    description: description.value,
    address: address.value,
    phone: phone.value,
    segment_id: segment.value,
    opening_hours: openingHours.value,
    logo_file: logo.value && logo.value.length > 0 ? logo.value[0] : null,
  }

  // Call API to create business
  try {
    await createBusinessAsCompany(payload)
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: 'Negocio creado correctamente.',
      confirmButtonText: 'Aceptar',
    }).then(async result => {
      if (result.isConfirmed || result.isDismissed)
        router.push('/empresa/')
    })

    // router.push('/empresa/seleccionar')
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
    <h2>Crear Negocio</h2>
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
          label="Logo"
        />
      </VCol>
      <VCol cols="12">
        <VBtn
          type="submit"
          color="primary"
          class="mt-3"
        >
          Crear
        </VBtn>
      </VCol>
    </VForm>
  </div>
</template>
